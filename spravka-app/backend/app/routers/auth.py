from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..auth import authenticate_user, create_access_token, get_current_user
from ..database import get_db
from ..models import User, UserInstitution
from ..schemas import Token, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    token = create_access_token({"sub": user.username, "role": user.role})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
