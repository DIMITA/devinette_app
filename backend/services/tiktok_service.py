import os
from datetime import datetime, timedelta

import httpx
from sqlalchemy.orm import Session

from models.db_models import TikTokToken
from services.auth_service import refresh_tiktok_token, save_tiktok_token

RENDERER_URL = os.getenv("RENDERER_URL", "http://localhost:3001")


async def get_valid_access_token(db: Session, user_id: str) -> str:
    """Return a valid TikTok access token, refreshing if necessary."""
    token = db.query(TikTokToken).filter(TikTokToken.user_id == user_id).first()
    if not token:
        raise ValueError("Aucun token TikTok trouvé — l'utilisateur doit se reconnecter")

    # Refresh if expires within 5 minutes
    if token.expires_at <= datetime.utcnow() + timedelta(minutes=5):
        if not token.refresh_token:
            raise ValueError("Token expiré et pas de refresh token — reconnexion requise")
        new_token_data = await refresh_tiktok_token(token.refresh_token)
        save_tiktok_token(db=db, user_id=user_id, token_data=new_token_data)
        return new_token_data["access_token"]

    return token.access_token


async def upload_and_publish(
    access_token: str,
    video_path: str,
    title: str,
    privacy_level: str = "SELF_ONLY",
) -> str:
    """Upload a local MP4 and publish it on TikTok. Returns publish_id."""
    video_size = os.path.getsize(video_path)

    # 1. Initialize Direct Post
    async with httpx.AsyncClient(timeout=30.0) as client:
        init_resp = await client.post(
            "https://open.tiktokapis.com/v2/post/publish/video/init/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
            json={
                "post_info": {
                    "title": (title or "Quiz DevinetteLab")[:150],
                    "privacy_level": privacy_level,
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False,
                    "video_cover_timestamp_ms": 1000,
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": video_size,
                    "chunk_size": video_size,
                    "total_chunk_count": 1,
                },
            },
        )
        init_resp.raise_for_status()
        init_data = init_resp.json()

    upload_url = init_data["data"]["upload_url"]
    publish_id = init_data["data"]["publish_id"]

    # 2. Upload video bytes
    with open(video_path, "rb") as f:
        video_bytes = f.read()

    async with httpx.AsyncClient(timeout=300.0) as client:
        upload_resp = await client.put(
            upload_url,
            content=video_bytes,
            headers={
                "Content-Type": "video/mp4",
                "Content-Range": f"bytes 0-{video_size - 1}/{video_size}",
                "Content-Length": str(video_size),
            },
        )
        upload_resp.raise_for_status()

    return publish_id


async def check_publish_status(access_token: str, publish_id: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
            json={"publish_id": publish_id},
        )
        r.raise_for_status()
        return r.json()


async def download_render_video(render_job_id: str, dest_path: str) -> None:
    """Download MP4 from renderer to a local path."""
    url = f"{RENDERER_URL}/render/{render_job_id}/download"
    async with httpx.AsyncClient(timeout=180.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        with open(dest_path, "wb") as f:
            f.write(r.content)
