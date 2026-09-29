from datetime import datetime

from pydantic import BaseModel, Field

from app.models import RequestCategory, RequestStatus


class EmailInput(BaseModel):
    subject: str = Field(default="", max_length=500)
    sender: str = Field(default="", max_length=320)
    body: str = Field(min_length=1)


class EmailRequestOut(BaseModel):
    id: int
    subject: str
    sender: str
    body: str
    category: RequestCategory
    summary: str
    status: RequestStatus
    source: str
    ai_provider: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: RequestStatus


class StatsOut(BaseModel):
    total: int
    new: int
    in_progress: int
    completed: int
    commercial_proposal: int
    catalog: int
    general: int


class SettingsOut(BaseModel):
    groq_configured: bool
    imap_configured: bool
    ai_provider: str


class ImapFetchResult(BaseModel):
    fetched: int
    created: int
    skipped: int
