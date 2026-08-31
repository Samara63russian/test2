from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import schemas
from .auth import get_current_user, require_admin
from .database import get_db
from .models import AnswerOption, Question, User

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("", response_model=list[schemas.QuestionOut])
def list_questions(
    include_inactive: bool = False,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Question)
    if not include_inactive:
        q = q.filter(Question.is_active.is_(True))
    return q.order_by(Question.sort_order, Question.id).all()


@router.post("", response_model=schemas.QuestionOut)
def create_question(
    payload: schemas.QuestionCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = Question(
        text=payload.text,
        question_type=payload.question_type,
        sort_order=payload.sort_order,
        required=payload.required,
        is_active=payload.is_active,
        help_text=payload.help_text,
        created_at=datetime.utcnow(),
    )
    for opt in payload.options:
        question.options.append(
            AnswerOption(text=opt.text, sort_order=opt.sort_order)
        )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.put("/{question_id}", response_model=schemas.QuestionOut)
def update_question(
    question_id: int,
    payload: schemas.QuestionUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")

    data = payload.model_dump(exclude_unset=True)
    options = data.pop("options", None)
    for key, value in data.items():
        setattr(question, key, value)

    if options is not None:
        question.options.clear()
        db.flush()
        for opt in options:
            question.options.append(
                AnswerOption(text=opt["text"], sort_order=opt.get("sort_order", 0))
            )

    db.commit()
    db.refresh(question)
    return question


@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    if question.answers:
        question.is_active = False
        db.commit()
        return {"ok": True, "soft_deleted": True}
    db.delete(question)
    db.commit()
    return {"ok": True, "soft_deleted": False}
