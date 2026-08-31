from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import DictionaryItem, User
from ..schemas import DictionaryIn, DictionaryOut
from ..security import get_current_user, require_admin

router = APIRouter(prefix="/api/dictionary", tags=["dictionary"])


@router.get("", response_model=list[DictionaryOut])
def list_items(group: str | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(DictionaryItem).order_by(DictionaryItem.group_code, DictionaryItem.sort_order, DictionaryItem.id)
    if group:
        q = q.filter(DictionaryItem.group_code == group)
    return q.all()


@router.post("", response_model=DictionaryOut)
def create_item(payload: DictionaryIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = DictionaryItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=DictionaryOut)
def update_item(item_id: int, payload: DictionaryIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.get(DictionaryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.get(DictionaryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    db.delete(item)
    db.commit()
    return {"ok": True}
