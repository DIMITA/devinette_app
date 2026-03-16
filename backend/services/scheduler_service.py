import os
import asyncio
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./devinette.db")
VIDEO_STORAGE = os.getenv("VIDEO_STORAGE_PATH", "/tmp/devinettelab-scheduled")
MAX_RETRIES = 3
RETRY_DELAY_MINUTES = 5

jobstores = {"default": SQLAlchemyJobStore(url=DATABASE_URL)}
scheduler = AsyncIOScheduler(jobstores=jobstores, timezone="UTC")


def start_scheduler() -> None:
    os.makedirs(VIDEO_STORAGE, exist_ok=True)
    if not scheduler.running:
        scheduler.start()
        print("[scheduler] Démarré")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)


def schedule_post_job(post_id: str, run_at: datetime) -> str:
    """Add a publish job to the scheduler. Returns the APScheduler job id."""
    job_id = f"publish_{post_id}"
    scheduler.add_job(
        _publish_job,
        trigger="date",
        run_date=run_at,
        id=job_id,
        args=[post_id],
        replace_existing=True,
        misfire_grace_time=300,  # 5 min grace
    )
    return job_id


def cancel_post_job(post_id: str) -> None:
    job_id = f"publish_{post_id}"
    try:
        scheduler.remove_job(job_id)
    except Exception:
        pass


async def _publish_job(post_id: str) -> None:
    """APScheduler async job: download video, publish to TikTok, notify."""
    from database import SessionLocal
    from models.db_models import ScheduledPost, POST_STATUS_PUBLISHING, POST_STATUS_PUBLISHED, POST_STATUS_FAILED
    from services.tiktok_service import get_valid_access_token, upload_and_publish, download_render_video
    from services.email_service import send_publish_success, send_publish_failure

    db = SessionLocal()
    try:
        post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
        if not post or post.status not in ("scheduled",):
            return

        post.status = POST_STATUS_PUBLISHING
        post.updated_at = datetime.utcnow()
        db.commit()

        user = post.user
        video_path = post.video_local_path

        # Download the video if not yet cached
        if not video_path or not os.path.exists(video_path):
            video_path = os.path.join(VIDEO_STORAGE, f"{post_id}.mp4")
            try:
                await download_render_video(post.render_job_id, video_path)
                post.video_local_path = video_path
                db.commit()
            except Exception as e:
                _handle_failure(db, post, f"Téléchargement vidéo échoué: {e}")
                return

        try:
            access_token = await get_valid_access_token(db, user.id)
            title = post.title or f"Quiz DevinetteLab — {len(post.questions)} question(s)"
            publish_id = await upload_and_publish(
                access_token=access_token,
                video_path=video_path,
                title=title,
                privacy_level=post.privacy_level,
            )
        except Exception as e:
            _handle_failure(db, post, str(e), retry=True)
            if user.email:
                send_publish_failure(user.email, user.tiktok_username or "", post.title or "", str(e), post.retry_count)
            return

        # Success
        post.status = POST_STATUS_PUBLISHED
        post.tiktok_video_id = publish_id
        post.published_at = datetime.utcnow()
        post.updated_at = datetime.utcnow()
        db.commit()

        if user.email:
            send_publish_success(user.email, user.tiktok_username or "", post.title or "")

    except Exception as e:
        print(f"[scheduler] Erreur inattendue pour post {post_id}: {e}")
    finally:
        db.close()


def _handle_failure(db, post, error_msg: str, retry: bool = False) -> None:
    from models.db_models import POST_STATUS_FAILED

    post.retry_count = (post.retry_count or 0) + 1
    post.error_message = error_msg
    post.updated_at = datetime.utcnow()

    if retry and post.retry_count < MAX_RETRIES:
        # Reschedule
        run_at = datetime.utcnow() + timedelta(minutes=RETRY_DELAY_MINUTES)
        post.status = "scheduled"
        db.commit()
        schedule_post_job(post.id, run_at)
    else:
        post.status = POST_STATUS_FAILED
        db.commit()
