import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class RequestCategory(str, enum.Enum):
    COMMERCIAL_PROPOSAL = "commercial_proposal"
    CATALOG = "catalog"
    GENERAL = "general"


class RequestStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Base(DeclarativeBase):
    pass


class EmailRequest(Base):
    __tablename__ = "email_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    subject: Mapped[str] = mapped_column(String(500), default="")
    sender: Mapped[str] = mapped_column(String(320), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[RequestCategory] = mapped_column(
        Enum(RequestCategory), default=RequestCategory.GENERAL
    )
    summary: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.NEW)
    source: Mapped[str] = mapped_column(String(50), default="manual")
    message_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    ai_provider: Mapped[str] = mapped_column(String(50), default="local")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
