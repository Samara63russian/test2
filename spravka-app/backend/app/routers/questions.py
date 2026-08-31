from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from ..auth import get_current_user, require_admin
from ..database import get_db
from ..models import AnswerOption, Question, User
from ..schemas import QuestionCreate, QuestionOut, QuestionUpdate

router = APIRouter(prefix="/api/questions", tags=["questions"])


def _load_question(db: Session, question_id: int) -> Question | None:
    return (
        db.query(Question)
        .options(joinedload(Question.answers))
        .filter(Question.id == question_id)
        .first()
    )


@router.get("", response_model=list[QuestionOut])
def list_questions(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    active_only: bool = False,
):
    q = db.query(Question).options(joinedload(Question.answers))
    if active_only:
        q = q.filter(Question.is_active.is_(True))
    return q.order_by(Question.sort_order, Question.id).all()


@router.post("", response_model=QuestionOut)
def create_question(
    payload: QuestionCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = Question(
        text=payload.text,
        category=payload.category,
        answer_type=payload.answer_type,
        sort_order=payload.sort_order,
        is_required=payload.is_required,
        is_active=payload.is_active,
    )
    db.add(question)
    db.flush()
    for ans in payload.answers:
        db.add(
            AnswerOption(
                question_id=question.id,
                text=ans.text,
                value=ans.value or ans.text,
                sort_order=ans.sort_order,
                is_active=ans.is_active,
            )
        )
    db.commit()
    return _load_question(db, question.id)


@router.put("/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    payload: QuestionUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    data = payload.model_dump(exclude_unset=True, exclude={"answers"})
    for key, value in data.items():
        setattr(question, key, value)
    if payload.answers is not None:
        db.query(AnswerOption).filter(AnswerOption.question_id == question_id).delete()
        for ans in payload.answers:
            db.add(
                AnswerOption(
                    question_id=question.id,
                    text=ans.text,
                    value=ans.value or ans.text,
                    sort_order=ans.sort_order,
                    is_active=ans.is_active,
                )
            )
    db.commit()
    return _load_question(db, question_id)


@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    db.delete(question)
    db.commit()
    return {"ok": True}
