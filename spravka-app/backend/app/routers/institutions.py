from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_admin
from ..database import get_db
from ..models import Institution, User, UserInstitution
from ..schemas import InstitutionCreate, InstitutionOut, InstitutionUpdate

router = APIRouter(prefix="/api/institutions", tags=["institutions"])


@router.get("", response_model=list[InstitutionOut])
def list_institutions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    all_active: bool = False,
):
    q = db.query(Institution)
    if user.role != "admin":
        allowed = [
            ui.institution_id
            for ui in db.query(UserInstitution).filter(UserInstitution.user_id == user.id)
        ]
        q = q.filter(Institution.id.in_(allowed or [-1]))
    elif all_active:
        q = q.filter(Institution.is_active.is_(True))
    return q.order_by(Institution.name).all()


@router.post("", response_model=InstitutionOut)
def create_institution(
    payload: InstitutionCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if db.query(Institution).filter(Institution.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Учреждение уже существует")
    inst = Institution(**payload.model_dump())
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return inst


@router.put("/{institution_id}", response_model=InstitutionOut)
def update_institution(
    institution_id: int,
    payload: InstitutionUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(inst, key, value)
    db.commit()
    db.refresh(inst)
    return inst


@router.delete("/{institution_id}")
def delete_institution(
    institution_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    db.delete(inst)
    db.commit()
    return {"ok": True}
