from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import schemas
from .auth import get_current_user, require_admin
from .database import get_db
from .models import Institution, User

router = APIRouter(prefix="/api/institutions", tags=["institutions"])


@router.get("", response_model=list[schemas.InstitutionOut])
def list_institutions(
    include_inactive: bool = False,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Institution)
    if not include_inactive:
        q = q.filter(Institution.is_active.is_(True))
    return q.order_by(Institution.name).all()


@router.post("", response_model=schemas.InstitutionOut)
def create_institution(
    payload: schemas.InstitutionCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if db.query(Institution).filter(Institution.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Учреждение с таким названием уже есть")
    item = Institution(**payload.model_dump(), created_at=datetime.utcnow())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{institution_id}", response_model=schemas.InstitutionOut)
def update_institution(
    institution_id: int,
    payload: schemas.InstitutionUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    item = db.query(Institution).filter(Institution.id == institution_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{institution_id}")
def delete_institution(
    institution_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    item = db.query(Institution).filter(Institution.id == institution_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    if item.reports:
        item.is_active = False
        db.commit()
        return {"ok": True, "soft_deleted": True}
    db.delete(item)
    db.commit()
    return {"ok": True, "soft_deleted": False}
