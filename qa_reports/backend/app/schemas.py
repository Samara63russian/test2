from datetime import datetime

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username: str
    full_name: str = ""
    role: str = "user"
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: str | None = None
    full_name: str | None = None
    role: str | None = None
    is_active: bool | None = None
    password: str | None = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class InstitutionBase(BaseModel):
    name: str
    address: str = ""
    contact: str = ""
    is_active: bool = True


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    contact: str | None = None
    is_active: bool | None = None


class InstitutionOut(InstitutionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionOptionBase(BaseModel):
    text: str
    sort_order: int = 0


class QuestionOptionOut(QuestionOptionBase):
    id: int

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    text: str
    question_type: str = "text"
    category: str = "Общие"
    sort_order: int = 0
    is_required: bool = True
    is_active: bool = True


class QuestionCreate(QuestionBase):
    options: list[QuestionOptionBase] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    text: str | None = None
    question_type: str | None = None
    category: str | None = None
    sort_order: int | None = None
    is_required: bool | None = None
    is_active: bool | None = None
    options: list[QuestionOptionBase] | None = None


class QuestionOut(QuestionBase):
    id: int
    options: list[QuestionOptionOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ReferenceItemBase(BaseModel):
    category: str
    title: str
    content: str = ""
    sort_order: int = 0


class ReferenceItemCreate(ReferenceItemBase):
    pass


class ReferenceItemUpdate(BaseModel):
    category: str | None = None
    title: str | None = None
    content: str | None = None
    sort_order: int | None = None


class ReferenceItemOut(ReferenceItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ReportAnswerIn(BaseModel):
    question_id: int
    answer_text: str = ""


class ReportAnswerOut(ReportAnswerIn):
    id: int

    class Config:
        from_attributes = True


class ReportCreate(BaseModel):
    institution_id: int
    report_date: datetime
    status: str = "draft"
    notes: str = ""
    answers: list[ReportAnswerIn] = Field(default_factory=list)
    client_uuid: str | None = None


class ReportUpdate(BaseModel):
    institution_id: int | None = None
    report_date: datetime | None = None
    status: str | None = None
    notes: str | None = None
    answers: list[ReportAnswerIn] | None = None


class ReportOut(BaseModel):
    id: int
    institution_id: int
    author_id: int
    report_date: datetime
    status: str
    notes: str
    client_uuid: str | None
    created_at: datetime
    updated_at: datetime
    answers: list[ReportAnswerOut] = Field(default_factory=list)
    institution_name: str | None = None
    author_name: str | None = None

    class Config:
        from_attributes = True


class SyncReportPayload(BaseModel):
    client_uuid: str
    institution_id: int
    report_date: datetime
    status: str = "submitted"
    notes: str = ""
    answers: list[ReportAnswerIn] = Field(default_factory=list)


class AnalyticsSummary(BaseModel):
    total_reports: int
    reports_by_institution: list[dict]
    reports_by_month: list[dict]
    reports_by_status: list[dict]
    recent_reports: list[ReportOut]
