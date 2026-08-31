from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from models import UserRole, QuestionType

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    full_name: str
    role: UserRole = UserRole.INSPECTOR
    position: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    position: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# --- Institution Schemas ---
class InstitutionBase(BaseModel):
    name: str
    category: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    head_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    head_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

class InstitutionOut(InstitutionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    reports_count: Optional[int] = 0
    last_inspection_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Question & Category Schemas ---
class QuestionCategoryBase(BaseModel):
    name: str
    code: Optional[str] = None
    order: int = 0

class QuestionCategoryCreate(QuestionCategoryBase):
    pass

class QuestionCategoryOut(QuestionCategoryBase):
    id: int
    questions_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class QuestionBase(BaseModel):
    category_id: Optional[int] = None
    code: Optional[str] = None
    text: str
    description: Optional[str] = None
    question_type: QuestionType = QuestionType.BOOLEAN
    options: Optional[List[str]] = None
    weight: float = 1.0
    is_required: bool = True
    is_active: bool = True
    order: int = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    category_id: Optional[int] = None
    code: Optional[str] = None
    text: Optional[str] = None
    description: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    weight: Optional[float] = None
    is_required: Optional[bool] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class QuestionOut(QuestionBase):
    id: int
    created_at: datetime
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Answer & Report Schemas ---
class AnswerItem(BaseModel):
    question_id: int
    value: Optional[str] = None
    is_compliant: Optional[bool] = None
    comment: Optional[str] = None

class AnswerOut(AnswerItem):
    id: int
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    question_category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ReportCreate(BaseModel):
    institution_id: int
    inspection_date: Optional[datetime] = None
    title: Optional[str] = None
    status: str = "completed"
    summary_text: Optional[str] = None
    recommendations: Optional[str] = None
    client_uuid: Optional[str] = None
    answers: List[AnswerItem] = []

class ReportUpdate(BaseModel):
    institution_id: Optional[int] = None
    inspection_date: Optional[datetime] = None
    title: Optional[str] = None
    status: Optional[str] = None
    summary_text: Optional[str] = None
    recommendations: Optional[str] = None
    answers: Optional[List[AnswerItem]] = None

class ReportOut(BaseModel):
    id: int
    institution_id: int
    institution_name: Optional[str] = None
    institution_category: Optional[str] = None
    inspector_id: Optional[int] = None
    inspector_name: Optional[str] = None
    inspection_date: datetime
    title: str
    status: str
    summary_text: Optional[str] = None
    recommendations: Optional[str] = None
    score: float
    client_uuid: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    answers: List[AnswerOut] = []

    model_config = ConfigDict(from_attributes=True)

class SyncBatchRequest(BaseModel):
    reports: List[ReportCreate]

class SyncBatchResponse(BaseModel):
    synced_count: int
    synced_reports: List[Dict[str, Any]]
    message: str

# --- Analytics Schemas ---
class AnalyticsOverview(BaseModel):
    total_institutions: int
    total_reports: int
    total_questions: int
    average_score: float
    inspections_by_category: Dict[str, int]
    compliance_by_category: Dict[str, float]
    recent_inspections: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]
    top_institutions: List[Dict[str, Any]]
    low_compliance_questions: List[Dict[str, Any]]
