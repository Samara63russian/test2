from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Question, QuestionCategory, User
from ..schemas import CategoryIn, CategoryOut, QuestionIn, QuestionOut
from ..security import get_current_user, require_admin

router = APIRouter(prefix="/api", tags=["questions"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(QuestionCategory).order_by(QuestionCategory.sort_order, QuestionCategory.id).all()


@router.post("/categories", response_model=CategoryOut)
def create_category(payload: CategoryIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = QuestionCategory(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/categories/{item_id}", response_model=CategoryOut)
def update_category(item_id: int, payload: CategoryIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.get(QuestionCategory, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/categories/{item_id}")
def delete_category(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.get(QuestionCategory, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    db.query(Question).filter(Question.category_id == item_id).delete()
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.get("/questions", response_model=list[QuestionOut])
def list_questions(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Question).order_by(Question.category_id, Question.sort_order, Question.id).all()


@router.post("/questions", response_model=QuestionOut)
def create_question(payload: QuestionIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = Question(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/questions/{item_id}", response_model=QuestionOut)
def update_question(item_id: int, payload: QuestionIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.get(Question, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/questions/{item_id}")
def delete_question(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.get(Question, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Вопрос не найден")
    db.delete(item)
    db.commit()
    return {"ok": True}
