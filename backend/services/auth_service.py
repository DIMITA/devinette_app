import os
import secrets
from datetime import datetime, timedelta

import httpx
from jose import jwt
from sqlalchemy.orm import Session

from models.db_models import User, TikTokToken

TIKTOK_CLIENT_ID = os.getenv("TIKTOK_CLIENT_ID", "")
TIKTOK_CLIENT_SECRET = os.getenv("TIKTOK_CLIENT_SECRET", "")
TIKTOK_REDIRECT_URI = os.getenv("TIKTOK_REDIRECT_URI", "http://localhost:5173/auth/callback")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production-32chars-min")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30

# In-memory state store — use Redis in production
_oauth_states: dict[str, bool] = {}


def generate_oauth_state() -> str:
    state = secrets.token_urlsafe(16)
    _oauth_states[state] = True
    return state


def consume_oauth_state(state: str) -> bool:
    return _oauth_states.pop(state, None) is not None


def get_tiktok_auth_url(state: str) -> str:
    scope = "user.info.basic,video.publish,video.upload"
    return (
        f"https://www.tiktok.com/v2/auth/authorize/"
        f"?client_key={TIKTOK_CLIENT_ID}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&redirect_uri={TIKTOK_REDIRECT_URI}"
        f"&state={state}"
    )


async def exchange_code_for_token(code: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            "https://open.tiktokapis.com/v2/oauth/token/",
            data={
                "client_key": TIKTOK_CLIENT_ID,
                "client_secret": TIKTOK_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": TIKTOK_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        r.raise_for_status()
        return r.json()


async def refresh_tiktok_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            "https://open.tiktokapis.com/v2/oauth/token/",
            data={
                "client_key": TIKTOK_CLIENT_ID,
                "client_secret": TIKTOK_CLIENT_SECRET,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        r.raise_for_status()
        return r.json()


async def get_tiktok_user_info(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            "https://open.tiktokapis.com/v2/user/info/",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"fields": "open_id,union_id,avatar_url,display_name"},
        )
        r.raise_for_status()
        return r.json()


def create_jwt(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt(token: str) -> str:
    payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    return payload["sub"]


def get_or_create_user(db: Session, tiktok_open_id: str, username: str, avatar_url: str) -> User:
    user = db.query(User).filter(User.tiktok_open_id == tiktok_open_id).first()
    if not user:
        user = User(tiktok_open_id=tiktok_open_id, tiktok_username=username, tiktok_avatar_url=avatar_url)
        db.add(user)
    else:
        user.tiktok_username = username
        user.tiktok_avatar_url = avatar_url
        user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def save_tiktok_token(db: Session, user_id: str, token_data: dict) -> None:
    expires_at = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 86400))
    token = db.query(TikTokToken).filter(TikTokToken.user_id == user_id).first()
    if not token:
        token = TikTokToken(
            user_id=user_id,
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            expires_at=expires_at,
            scope=token_data.get("scope"),
        )
        db.add(token)
    else:
        token.access_token = token_data["access_token"]
        token.refresh_token = token_data.get("refresh_token", token.refresh_token)
        token.expires_at = expires_at
        token.scope = token_data.get("scope", token.scope)
        token.updated_at = datetime.utcnow()
    db.commit()
