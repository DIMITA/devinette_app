import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.db_models import ScheduledPost, POST_STATUS_CANCELLED, POST_STATUS_SCHEDULED, User
from services.scheduler_service import schedule_post_job, cancel_post_job, VIDEO_STORAGE
from services.tiktok_service import download_render_video

router = APIRouter()

PRIVACY_LEVELS = {"PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"}


class CreateScheduleRequest(BaseModel):
    render_job_id: str = Field(..., description="ID du job de rendu MP4")
    template_id: str
    questions: list = Field(..., min_length=1)
    video_settings: Optional[dict] = None
    title: Optional[str] = Field(default=None, max_length=150)
    privacy_level: str = Field(default="SELF_ONLY")
    scheduled_at: datetime = Field(..., description="Date/heure UTC de publication")


class UpdateScheduleRequest(BaseModel):
    scheduled_at: Optional[datetime] = None
    title: Optional[str] = Field(default=None, max_length=150)
    privacy_level: Optional[str] = None


def _post_to_dict(post: ScheduledPost) -> dict:
    return {
        "id": post.id,
        "render_job_id": post.render_job_id,
        "template_id": post.template_id,
        "questions": post.questions,
        "video_settings": post.video_settings,
        "title": post.title,
        "privacy_level": post.privacy_level,
        "scheduled_at": post.scheduled_at.isoformat() if post.scheduled_at else None,
        "published_at": post.published_at.isoformat() if post.published_at else None,
        "tiktok_video_id": post.tiktok_video_id,
        "status": post.status,
        "error_message": post.error_message,
        "retry_count": post.retry_count,
        "created_at": post.created_at.isoformat() if post.created_at else None,
    }


@router.post("/schedule", status_code=201)
async def create_schedule(
    req: CreateScheduleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Schedule a rendered video for TikTok publication."""
    if req.scheduled_at <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="La date de publication doit être dans le futur")
    if req.privacy_level not in PRIVACY_LEVELS:
        raise HTTPException(status_code=400, detail=f"privacy_level invalide: {req.privacy_level}")

    post = ScheduledPost(
        user_id=current_user.id,
        render_job_id=req.render_job_id,
        template_id=req.template_id,
        questions=req.questions,
        video_settings=req.video_settings,
        title=req.title,
        privacy_level=req.privacy_level,
        scheduled_at=req.scheduled_at,
        status=POST_STATUS_SCHEDULED,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Pre-download the video so it's available at publish time
    video_path = os.path.join(VIDEO_STORAGE, f"{post.id}.mp4")
    try:
        await download_render_video(req.render_job_id, video_path)
        post.video_local_path = video_path
        db.commit()
    except Exception as e:
        # Non-blocking: scheduler will retry download at publish time
        print(f"[schedule] Pre-download failed for {post.id}: {e}")

    # Register with APScheduler
    schedule_post_job(post.id, req.scheduled_at)

    return _post_to_dict(post)


@router.get("/schedule")
async def list_schedules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all scheduled posts for the current user (calendar events)."""
    posts = (
        db.query(ScheduledPost)
        .filter(ScheduledPost.user_id == current_user.id)
        .order_by(ScheduledPost.scheduled_at.asc())
        .all()
    )
    return [_post_to_dict(p) for p in posts]


@router.get("/schedule/{post_id}")
async def get_schedule(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id, ScheduledPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    return _post_to_dict(post)


@router.put("/schedule/{post_id}")
async def update_schedule(
    post_id: str,
    req: UpdateScheduleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the scheduled time or title (drag-and-drop reschedule)."""
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id, ScheduledPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    if post.status not in (POST_STATUS_SCHEDULED,):
        raise HTTPException(status_code=409, detail=f"Impossible de modifier un post avec le statut '{post.status}'")

    if req.scheduled_at:
        if req.scheduled_at <= datetime.utcnow():
            raise HTTPException(status_code=400, detail="La nouvelle date doit être dans le futur")
        post.scheduled_at = req.scheduled_at
        # Re-register scheduler job with new time
        cancel_post_job(post.id)
        schedule_post_job(post.id, req.scheduled_at)

    if req.title is not None:
        post.title = req.title
    if req.privacy_level and req.privacy_level in PRIVACY_LEVELS:
        post.privacy_level = req.privacy_level

    post.updated_at = datetime.utcnow()
    db.commit()
    return _post_to_dict(post)


@router.delete("/schedule/{post_id}", status_code=204)
async def cancel_schedule(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id, ScheduledPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    if post.status == POST_STATUS_CANCELLED:
        raise HTTPException(status_code=409, detail="Post déjà annulé")

    cancel_post_job(post.id)
    post.status = POST_STATUS_CANCELLED
    post.updated_at = datetime.utcnow()
    db.commit()


@router.post("/schedule/{post_id}/publish-now", status_code=202)
async def publish_now(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Publish immediately (cancel scheduled job and trigger now)."""
    post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id, ScheduledPost.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    if post.status != POST_STATUS_SCHEDULED:
        raise HTTPException(status_code=409, detail=f"Post non planifié (statut: {post.status})")

    cancel_post_job(post.id)
    new_time = datetime.utcnow()
    schedule_post_job(post.id, new_time)
    post.scheduled_at = new_time
    post.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Publication immédiate déclenchée", "post_id": post_id}
