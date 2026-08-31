import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Enum, JSON
)
from sqlalchemy.orm import relationship
from database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    INSPECTOR = "inspector"
    VIEWER = "viewer"

class QuestionType(str, enum.Enum):
    BOOLEAN = "boolean"      # Да / Нет / Не применимо
    CHOICE = "choice"        # Выбор из списка вариантов
    SCALE = "scale"          # Оценка (например 1-5 или 1-10)
    NUMBER = "number"        # Числовое значение
    TEXT = "text"            # Текстовый ответ

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.INSPECTOR, nullable=False)
    position = Column(String(128), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reports = relationship("InspectionReport", back_populates="inspector")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True) # например: Здравоохранение, Образование, Соцзащита, Культура, Госадминистрация
    code = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    head_name = Column(String(128), nullable=True)
    phone = Column(String(64), nullable=True)
    email = Column(String(128), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reports = relationship("InspectionReport", back_populates="institution", cascade="all, delete-orphan")

class QuestionCategory(Base):
    __tablename__ = "question_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    code = Column(String(64), unique=True, nullable=True)
    order = Column(Integer, default=0)

    questions = relationship("Question", back_populates="category", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("question_categories.id"), nullable=True)
    code = Column(String(32), index=True, nullable=True) # напр. ВОП-01
    text = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    question_type = Column(Enum(QuestionType), default=QuestionType.BOOLEAN, nullable=False)
    options = Column(JSON, nullable=True) # список вариантов для choice или мин/макс для scale
    weight = Column(Float, default=1.0) # весовой коэффициент
    is_required = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("QuestionCategory", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class InspectionReport(Base):
    __tablename__ = "inspection_reports"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    inspection_date = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(32), default="completed") # draft, completed, verified
    summary_text = Column(Text, nullable=True) # Итоговое заключение/сводка
    recommendations = Column(Text, nullable=True) # Рекомендации
    score = Column(Float, default=0.0) # Итоговый балл/процент соответствия
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    client_uuid = Column(String(64), unique=True, nullable=True) # для офлайн-синхронизации с Android

    institution = relationship("Institution", back_populates="reports")
    inspector = relationship("User", back_populates="reports")
    answers = relationship("Answer", back_populates="report", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("inspection_reports.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    value = Column(Text, nullable=True) # Значение: "true", "false", "Да", "Нет", "4", "Текст"
    is_compliant = Column(Boolean, nullable=True) # Соответствует ли норме (для расчета сводного балла)
    comment = Column(Text, nullable=True) # Комментарий/замечание инспектора

    report = relationship("InspectionReport", back_populates="answers")
    question = relationship("Question", back_populates="answers")
