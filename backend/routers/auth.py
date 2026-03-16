import os

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.db_models import User
from services.auth_service import (
    consume_oauth_state,
    exchange_code_for_token,
    generate_oauth_state,
    get_or_create_user,
    get_tiktok_auth_url,
    get_tiktok_user_info,
    save_tiktok_token,
    create_jwt,
    TIKTOK_CLIENT_ID,
)

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/auth/tiktok/url")
async def get_auth_url():
    """Get the TikTok OAuth authorization URL."""
    if not TIKTOK_CLIENT_ID:
        raise HTTPException(status_code=503, detail="TikTok OAuth non configuré (TIKTOK_CLIENT_ID manquant)")
    state = generate_oauth_state()
    return {"url": get_tiktok_auth_url(state), "state": state}


@router.get("/auth/tiktok/callback")
async def tiktok_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    """Handle the TikTok OAuth callback, exchange code for token, redirect to frontend."""
    if not consume_oauth_state(state):
        raise HTTPException(status_code=400, detail="État OAuth invalide ou expiré")

    try:
        token_data = await exchange_code_for_token(code)
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=token_exchange_failed")

    try:
        user_info = await get_tiktok_user_info(token_data["access_token"])
        tiktok_user = user_info.get("data", {}).get("user", {})
    except Exception:
        return RedirectResponse(f"{FRONTEND_URL}/auth/error?message=user_info_failed")

    user = get_or_create_user(
        db=db,
        tiktok_open_id=tiktok_user.get("open_id", ""),
        username=tiktok_user.get("display_name", ""),
        avatar_url=tiktok_user.get("avatar_url", ""),
    )
    save_tiktok_token(db=db, user_id=user.id, token_data=token_data)

    jwt_token = create_jwt(user.id)
    return RedirectResponse(f"{FRONTEND_URL}/auth/success?token={jwt_token}")


@router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return current authenticated user info."""
    return {
        "id": current_user.id,
        "tiktok_username": current_user.tiktok_username,
        "tiktok_avatar_url": current_user.tiktok_avatar_url,
    }


@router.post("/auth/logout")
async def logout():
    return {"message": "Déconnecté"}
