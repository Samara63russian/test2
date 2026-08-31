from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_admin, get_current_user
from app.database import get_db
from app.models import ReferenceItem, User
from app.schemas import ReferenceItemCreate, ReferenceItemOut, ReferenceItemUpdate

router = APIRouter(prefix="/reference", tags=["reference"])


@router.get("/", response_model=list[ReferenceItemOut])
def list_reference(
    category: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(ReferenceItem)
    if category:
        query = query.filter(ReferenceItem.category == category)
    return query.order_by(ReferenceItem.category, ReferenceItem.sort_order, ReferenceItem.id).all()


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(ReferenceItem.category).distinct().order_by(ReferenceItem.category).all()
    return [r[0] for r in rows]


@router.post("/", response_model=ReferenceItemOut)
def create_reference(
    body: ReferenceItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    item = ReferenceItem(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=ReferenceItemOut)
def update_reference(
    item_id: int,
    body: ReferenceItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    item = db.query(ReferenceItem).filter(ReferenceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_reference(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    item = db.query(ReferenceItem).filter(ReferenceItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    db.delete(item)
    db.commit()
    return {"ok": True}
