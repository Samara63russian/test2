from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserIn, UserOut
from ..security import hash_password, require_admin

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(User).order_by(User.id).all()


@router.post("", response_model=UserOut)
def create_user(payload: UserIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if not payload.password:
        raise HTTPException(status_code=400, detail="Укажите пароль")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Логин уже занят")
    user = User(
        username=payload.username.strip(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role if payload.role in ("admin", "operator") else "operator",
        institution_id=payload.institution_id,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserIn, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    exists = db.query(User).filter(User.username == payload.username, User.id != user_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Логин уже занят")
    user.username = payload.username.strip()
    user.full_name = payload.full_name
    user.role = payload.role if payload.role in ("admin", "operator") else user.role
    user.institution_id = payload.institution_id
    user.is_active = payload.is_active
    if payload.password:
        user.password_hash = hash_password(payload.password)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить собственную учётную запись")
    db.delete(user)
    db.commit()
    return {"ok": True}
