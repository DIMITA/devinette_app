from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class Language(str, Enum):
    fr = "fr"
    en = "en"
    es = "es"
    ar = "ar"


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    expert = "expert"


class Format(str, Enum):
    qcm = "qcm"
    open = "open"


class GenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    context: Optional[str] = Field(default=None, max_length=500)
    language: Language = Language.fr
    difficulty: Difficulty = Difficulty.medium
    count: int = Field(default=3, ge=1, le=10)
    format: Format = Format.qcm
    include_emojis: bool = True
    include_explanation: bool = True


class Question(BaseModel):
    question: str
    options: Optional[List[str]] = None
    answer: str
    explanation: Optional[str] = None
    difficulty: Optional[str] = None


class GenerateResponse(BaseModel):
    questions: List[Question]
    topic: str
    language: str
    count: int
