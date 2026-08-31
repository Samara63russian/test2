from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    username: str
    full_name: str = ""
    role: Literal["admin", "user"] = "user"
    is_active: bool = True
    institution_ids: list[int] = []


class UserCreate(UserBase):
    password: str = Field(min_length=4)


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: Literal["admin", "user"] | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=4)
    institution_ids: list[int] | None = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class InstitutionCreate(BaseModel):
    name: str
    code: str = ""
    address: str = ""
    is_active: bool = True


class InstitutionUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    address: str | None = None
    is_active: bool | None = None


class InstitutionOut(InstitutionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AnswerOptionCreate(BaseModel):
    text: str
    value: str = ""
    sort_order: int = 0
    is_active: bool = True


class AnswerOptionOut(AnswerOptionCreate):
    id: int

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    text: str
    category: str = "Общие"
    answer_type: Literal["choice", "text", "number", "boolean"] = "choice"
    sort_order: int = 0
    is_required: bool = True
    is_active: bool = True
    answers: list[AnswerOptionCreate] = []


class QuestionUpdate(BaseModel):
    text: str | None = None
    category: str | None = None
    answer_type: Literal["choice", "text", "number", "boolean"] | None = None
    sort_order: int | None = None
    is_required: bool | None = None
    is_active: bool | None = None
    answers: list[AnswerOptionCreate] | None = None


class QuestionOut(BaseModel):
    id: int
    text: str
    category: str
    answer_type: str
    sort_order: int
    is_required: bool
    is_active: bool
    created_at: datetime
    answers: list[AnswerOptionOut] = []

    class Config:
        from_attributes = True


class ReportAnswerIn(BaseModel):
    question_id: int
    answer_option_id: int | None = None
    text_value: str = ""


class ReportCreate(BaseModel):
    institution_id: int
    report_date: str
    title: str = "Сводная справка"
    notes: str = ""
    status: Literal["draft", "submitted", "synced"] = "submitted"
    client_uuid: str | None = None
    answers: list[ReportAnswerIn] = []


class ReportUpdate(BaseModel):
    title: str | None = None
    notes: str | None = None
    status: Literal["draft", "submitted", "synced"] | None = None
    answers: list[ReportAnswerIn] | None = None


class ReportAnswerOut(BaseModel):
    id: int
    question_id: int
    answer_option_id: int | None
    text_value: str
    question_text: str | None = None
    answer_text: str | None = None

    class Config:
        from_attributes = True


class ReportOut(BaseModel):
    id: int
    institution_id: int
    institution_name: str | None = None
    report_date: str
    title: str
    status: str
    client_uuid: str | None
    created_by: int | None
    notes: str
    created_at: datetime
    updated_at: datetime
    synced_at: datetime | None
    answers: list[ReportAnswerOut] = []

    class Config:
        from_attributes = True


class SyncPayload(BaseModel):
    reports: list[ReportCreate]


class SyncResult(BaseModel):
    created: list[int]
    updated: list[int]
    skipped: list[str]


class AnalyticsSummary(BaseModel):
    total_reports: int
    submitted_reports: int
    draft_reports: int
    institutions_count: int
    questions_count: int
    by_institution: list[dict]
    by_date: list[dict]
    by_status: list[dict]
    answer_stats: list[dict]
