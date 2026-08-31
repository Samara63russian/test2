from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255), default="")
    role: Mapped[str] = mapped_column(String(32), default="user")  # admin | user
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    institutions: Mapped[list["UserInstitution"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(64), default="")
    address: Mapped[str] = mapped_column(String(512), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    users: Mapped[list["UserInstitution"]] = relationship(
        back_populates="institution", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(back_populates="institution")


class UserInstitution(Base):
    __tablename__ = "user_institutions"
    __table_args__ = (UniqueConstraint("user_id", "institution_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    institution_id: Mapped[int] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE")
    )

    user: Mapped["User"] = relationship(back_populates="institutions")
    institution: Mapped["Institution"] = relationship(back_populates="users")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    text: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(128), default="Общие")
    answer_type: Mapped[str] = mapped_column(String(32), default="choice")
    # choice | text | number | boolean
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    answers: Mapped[list["AnswerOption"]] = relationship(
        back_populates="question", cascade="all, delete-orphan", order_by="AnswerOption.sort_order"
    )


class AnswerOption(Base):
    __tablename__ = "answer_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(String(512))
    value: Mapped[str] = mapped_column(String(128), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    question: Mapped["Question"] = relationship(back_populates="answers")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    institution_id: Mapped[int] = mapped_column(ForeignKey("institutions.id"))
    report_date: Mapped[str] = mapped_column(String(10), index=True)  # YYYY-MM-DD
    title: Mapped[str] = mapped_column(String(255), default="Сводная справка")
    status: Mapped[str] = mapped_column(String(32), default="draft")  # draft | submitted | synced
    client_uuid: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    institution: Mapped["Institution"] = relationship(back_populates="reports")
    answers: Mapped[list["ReportAnswer"]] = relationship(
        back_populates="report", cascade="all, delete-orphan"
    )


class ReportAnswer(Base):
    __tablename__ = "report_answers"
    __table_args__ = (UniqueConstraint("report_id", "question_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"))
    answer_option_id: Mapped[int | None] = mapped_column(
        ForeignKey("answer_options.id"), nullable=True
    )
    text_value: Mapped[str] = mapped_column(Text, default="")

    report: Mapped["Report"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship()
    answer_option: Mapped["AnswerOption | None"] = relationship()
