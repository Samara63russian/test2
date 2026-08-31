from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_admin, get_current_user
from app.database import get_db
from app.models import Question, QuestionOption, User
from app.schemas import QuestionCreate, QuestionOut, QuestionUpdate

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("/", response_model=list[QuestionOut])
def list_questions(
    active_only: bool = True,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Question)
    if active_only:
        query = query.filter(Question.is_active.is_(True))
    return query.order_by(Question.category, Question.sort_order, Question.id).all()


@router.post("/", response_model=QuestionOut)
def create_question(
    body: QuestionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    question = Question(**body.model_dump(exclude={"options"}))
    db.add(question)
    db.flush()
    for i, opt in enumerate(body.options):
        db.add(QuestionOption(question_id=question.id, text=opt.text, sort_order=opt.sort_order or i))
    db.commit()
    db.refresh(question)
    return question


@router.put("/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    body: QuestionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    data = body.model_dump(exclude_unset=True)
    options = data.pop("options", None)
    for key, value in data.items():
        setattr(question, key, value)
    if options is not None:
        db.query(QuestionOption).filter(QuestionOption.question_id == question_id).delete()
        for i, opt in enumerate(options):
            db.add(
                QuestionOption(
                    question_id=question_id,
                    text=opt["text"] if isinstance(opt, dict) else opt.text,
                    sort_order=opt.get("sort_order", i) if isinstance(opt, dict) else (opt.sort_order or i),
                )
            )
    db.commit()
    db.refresh(question)
    return question


@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    db.delete(question)
    db.commit()
    return {"ok": True}
