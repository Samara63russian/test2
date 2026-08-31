from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    institution_id: Optional[int]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserIn(BaseModel):
    username: str
    password: Optional[str] = None
    full_name: str = ""
    role: str = "operator"
    institution_id: Optional[int] = None
    is_active: bool = True


class InstitutionIn(BaseModel):
    name: str
    code: str = ""
    type_code: str = ""
    district: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    head_name: str = ""
    is_active: bool = True


class InstitutionOut(InstitutionIn):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DictionaryIn(BaseModel):
    group_code: str
    name: str
    code: str = ""
    extra: str = ""
    sort_order: int = 0
    is_active: bool = True


class DictionaryOut(DictionaryIn):
    id: int

    class Config:
        from_attributes = True


class CategoryIn(BaseModel):
    name: str
    sort_order: int = 0
    is_active: bool = True


class CategoryOut(CategoryIn):
    id: int

    class Config:
        from_attributes = True


class QuestionIn(BaseModel):
    category_id: int
    text: str
    hint: str = ""
    answer_type: str = "text"
    options: str = ""
    required: bool = True
    sort_order: int = 0
    is_active: bool = True


class QuestionOut(QuestionIn):
    id: int

    class Config:
        from_attributes = True


class AnswerIn(BaseModel):
    question_id: int
    value: str = ""


class ReportCreate(BaseModel):
    institution_id: int
    report_date: date
    answers: list[AnswerIn] = Field(default_factory=list)
    status: str = "draft"
    client_uuid: Optional[str] = None


class ReportUpdate(BaseModel):
    report_date: Optional[date] = None
    answers: Optional[list[AnswerIn]] = None
    status: Optional[str] = None


class AnswerOut(BaseModel):
    question_id: int
    value: str
    question_text: str = ""
    answer_type: str = "text"

    class Config:
        from_attributes = True


class ReportOut(BaseModel):
    id: int
    institution_id: int
    institution_name: str = ""
    user_id: int
    user_name: str = ""
    report_date: date
    status: str
    client_uuid: Optional[str]
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]
    answers: list[AnswerOut] = []

    class Config:
        from_attributes = True


class SettingIn(BaseModel):
    key: str
    value: str


class SyncReportIn(BaseModel):
    client_uuid: str
    institution_id: int
    report_date: date
    answers: list[AnswerIn]
    status: str = "submitted"


class SyncIn(BaseModel):
    reports: list[SyncReportIn]
