from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


class TemplateId(str, Enum):
    template1 = "Template1"
    template2 = "Template2"
    template3 = "Template3"


class RenderQuestion(BaseModel):
    question: str
    options: Optional[list[str]] = None
    answer: str
    explanation: Optional[str] = None
    difficulty: Optional[str] = None


class RenderRequest(BaseModel):
    question: RenderQuestion
    template_id: TemplateId = TemplateId.template1
    question_index: int = Field(default=1, ge=1)
    total_questions: int = Field(default=1, ge=1)
    show_timer: bool = True
    timer_duration: int = Field(default=5, ge=3, le=15)
    reveal_delay: int = Field(default=10, ge=5, le=30)
    watermark: Optional[str] = Field(default=None, max_length=50)
    lang: Optional[str] = Field(default="fr", max_length=5)


class MultiRenderRequest(BaseModel):
    questions: list[RenderQuestion] = Field(min_length=1, max_length=10)
    template_id: TemplateId = TemplateId.template1
    watermark: Optional[str] = Field(default=None, max_length=50)
    lang: Optional[str] = Field(default="fr", max_length=5)


class JobStatus(str, Enum):
    pending = "pending"
    rendering = "rendering"
    done = "done"
    error = "error"


class RenderJobResponse(BaseModel):
    job_id: str
    status: JobStatus
    template_id: str
    created_at: int
    started_at: Optional[int] = None
    completed_at: Optional[int] = None
    download_url: Optional[str] = None
    error: Optional[str] = None
