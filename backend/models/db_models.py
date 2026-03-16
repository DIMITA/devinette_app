import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    tiktok_open_id = Column(String, unique=True, nullable=False)
    tiktok_username = Column(String, nullable=True)
    tiktok_avatar_url = Column(String, nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    token = relationship("TikTokToken", back_populates="user", uselist=False, cascade="all, delete-orphan")
    scheduled_posts = relationship("ScheduledPost", back_populates="user", cascade="all, delete-orphan")


class TikTokToken(Base):
    __tablename__ = "tiktok_tokens"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    scope = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="token")


# Post statuses
POST_STATUS_SCHEDULED = "scheduled"
POST_STATUS_PUBLISHING = "publishing"
POST_STATUS_PUBLISHED = "published"
POST_STATUS_FAILED = "failed"
POST_STATUS_CANCELLED = "cancelled"


class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    render_job_id = Column(String, nullable=True)       # Renderer job ID
    video_local_path = Column(String, nullable=True)    # Locally cached MP4 path
    template_id = Column(String, nullable=False)
    questions = Column(JSON, nullable=False)
    video_settings = Column(JSON, nullable=True)        # voice, colorScheme, bgPattern…
    title = Column(String, nullable=True)
    privacy_level = Column(String, default="SELF_ONLY")
    scheduled_at = Column(DateTime, nullable=False)
    published_at = Column(DateTime, nullable=True)
    tiktok_video_id = Column(String, nullable=True)
    status = Column(String, default=POST_STATUS_SCHEDULED)
    error_message = Column(String, nullable=True)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="scheduled_posts")
