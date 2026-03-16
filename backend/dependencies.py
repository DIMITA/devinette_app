from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import verify_jwt
from models.db_models import User


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token d'authentification manquant")
    token = auth[7:]
    try:
        user_id = verify_jwt(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user
