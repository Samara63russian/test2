from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


Role = Literal["admin", "user"]
QuestionType = Literal["text", "single", "multi", "number", "date", "yesno"]
ReportStatus = Literal["draft", "submitted"]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username: str
    full_name: str = ""
    role: Role = "user"
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=4)


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: Role | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=4)


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class InstitutionBase(BaseModel):
    name: str
    code: str = ""
    address: str = ""
    description: str = ""
    is_active: bool = True


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    address: str | None = None
    description: str | None = None
    is_active: bool | None = None


class InstitutionOut(InstitutionBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AnswerOptionBase(BaseModel):
    text: str
    sort_order: int = 0


class AnswerOptionCreate(AnswerOptionBase):
    pass


class AnswerOptionOut(AnswerOptionBase):
    id: int
    question_id: int

    model_config = {"from_attributes": True}


class QuestionBase(BaseModel):
    text: str
    question_type: QuestionType = "text"
    sort_order: int = 0
    required: bool = True
    is_active: bool = True
    help_text: str = ""


class QuestionCreate(QuestionBase):
    options: list[AnswerOptionCreate] = []


class QuestionUpdate(BaseModel):
    text: str | None = None
    question_type: QuestionType | None = None
    sort_order: int | None = None
    required: bool | None = None
    is_active: bool | None = None
    help_text: str | None = None
    options: list[AnswerOptionCreate] | None = None


class QuestionOut(QuestionBase):
    id: int
    created_at: datetime
    options: list[AnswerOptionOut] = []

    model_config = {"from_attributes": True}


class AnswerIn(BaseModel):
    question_id: int
    value_text: str = ""
    option_ids: list[int] = []


class ReportCreate(BaseModel):
    institution_id: int
    report_date: date
    notes: str = ""
    status: ReportStatus = "draft"
    answers: list[AnswerIn] = []
    client_uuid: str | None = None


class ReportUpdate(BaseModel):
    notes: str | None = None
    status: ReportStatus | None = None
    answers: list[AnswerIn] | None = None


class AnswerOut(BaseModel):
    id: int
    question_id: int
    value_text: str
    option_ids: list[int] = []

    model_config = {"from_attributes": True}


class ReportOut(BaseModel):
    id: int
    institution_id: int
    institution_name: str = ""
    author_id: int | None = None
    author_name: str = ""
    report_date: date
    status: ReportStatus
    notes: str
    client_uuid: str | None = None
    created_at: datetime
    updated_at: datetime
    answers: list[AnswerOut] = []

    model_config = {"from_attributes": True}


class SyncPayload(BaseModel):
    reports: list[ReportCreate]


class SyncResult(BaseModel):
    created: list[ReportOut]
    updated: list[ReportOut]
    conflicts: list[str] = []


class AnalyticsSummary(BaseModel):
    total_reports: int
    submitted_reports: int
    draft_reports: int
    institutions_count: int
    questions_count: int
    by_institution: list[dict]
    by_month: list[dict]
    recent_reports: list[ReportOut]
