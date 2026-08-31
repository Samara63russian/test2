from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Institution, Report, User
from ..schemas import InstitutionIn, InstitutionOut
from ..security import get_current_user, require_admin

router = APIRouter(prefix="/api/institutions", tags=["institutions"])


@router.get("", response_model=list[InstitutionOut])
def list_institutions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Institution).order_by(Institution.name)
    if user.role != "admin" and user.institution_id:
        q = q.filter(Institution.id == user.institution_id)
    return q.all()


@router.post("", response_model=InstitutionOut)
def create_institution(payload: InstitutionIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = Institution(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=InstitutionOut)
def update_institution(
    item_id: int, payload: InstitutionIn, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    item = db.get(Institution, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_institution(item_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    item = db.get(Institution, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    db.query(Report).filter(Report.institution_id == item_id).delete()
    db.query(User).filter(User.institution_id == item_id).update({User.institution_id: None})
    db.delete(item)
    db.commit()
    return {"ok": True}
