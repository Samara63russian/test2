from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_admin, get_current_user
from app.database import get_db
from app.models import Institution, User
from app.schemas import InstitutionCreate, InstitutionOut, InstitutionUpdate

router = APIRouter(prefix="/institutions", tags=["institutions"])


@router.get("/", response_model=list[InstitutionOut])
def list_institutions(
    active_only: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Institution)
    if active_only:
        query = query.filter(Institution.is_active.is_(True))
    return query.order_by(Institution.name).all()


@router.post("/", response_model=InstitutionOut)
def create_institution(
    body: InstitutionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    if db.query(Institution).filter(Institution.name == body.name).first():
        raise HTTPException(status_code=400, detail="Учреждение уже существует")
    inst = Institution(**body.model_dump())
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return inst


@router.put("/{institution_id}", response_model=InstitutionOut)
def update_institution(
    institution_id: int,
    body: InstitutionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(inst, key, value)
    db.commit()
    db.refresh(inst)
    return inst


@router.delete("/{institution_id}")
def delete_institution(
    institution_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Учреждение не найдено")
    db.delete(inst)
    db.commit()
    return {"ok": True}
