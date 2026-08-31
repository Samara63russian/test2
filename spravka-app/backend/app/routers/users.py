from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, hash_password, require_admin
from ..database import get_db
from ..models import User, UserInstitution
from ..schemas import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/api/users", tags=["users"])


def _user_out(db: Session, user: User) -> UserOut:
    inst_ids = [
        ui.institution_id
        for ui in db.query(UserInstitution).filter(UserInstitution.user_id == user.id)
    ]
    return UserOut(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        institution_ids=inst_ids,
        created_at=user.created_at,
    )


def _set_institutions(db: Session, user: User, institution_ids: list[int]) -> None:
    db.query(UserInstitution).filter(UserInstitution.user_id == user.id).delete()
    for iid in institution_ids:
        db.add(UserInstitution(user_id=user.id, institution_id=iid))


@router.get("", response_model=list[UserOut])
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.username).all()
    return [_user_out(db, u) for u in users]


@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Логин уже существует")
    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(user)
    db.flush()
    _set_institutions(db, user, payload.institution_ids)
    db.commit()
    db.refresh(user)
    return _user_out(db, user)


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.password:
        user.password_hash = hash_password(payload.password)
    if payload.institution_ids is not None:
        _set_institutions(db, user, payload.institution_ids)
    db.commit()
    db.refresh(user)
    return _user_out(db, user)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
    db.delete(user)
    db.commit()
    return {"ok": True}
