import logging
import bcrypt
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.database import get_db
from backend.models.user import User, UserRole
from backend.utils.responses import success, fail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/users", tags=["Users"])


# ---------- Schemas ----------

class UserIn(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    role: UserRole


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    email_verified: bool
    is_active: bool

    class Config:
        from_attributes = True


def _serialize(user: User) -> dict:
    return UserOut.model_validate(user).model_dump()


# ---------- GET all ----------

@router.get("")
def list_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).order_by(User.created_at.desc()).all()
        return JSONResponse(success([_serialize(u) for u in users]))
    except SQLAlchemyError as e:
        logger.error("list_users error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- POST ----------

@router.post("", status_code=201)
def create_user(payload: UserIn, db: Session = Depends(get_db)):
    if not payload.name.strip():
        return JSONResponse(fail("Field 'name' is required"), status_code=400)
    if not payload.email.strip():
        return JSONResponse(fail("Field 'email' is required"), status_code=400)

    try:
        if db.query(User).filter(User.email == payload.email.lower()).first():
            return JSONResponse(fail("Email already registered"), status_code=400)

        hashed = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode() if payload.password else None
        user = User(
            name=payload.name.strip(),
            email=payload.email.lower().strip(),
            password_hash=hashed,
            role=payload.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return JSONResponse(success(_serialize(user), "User created"), status_code=201)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("create_user error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- PUT ----------

@router.put("/{user_id}")
def update_user(user_id: int, payload: UserIn, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return JSONResponse(fail("Record not found"), status_code=404)

        user.name  = payload.name.strip()
        user.email = payload.email.lower().strip()
        user.role  = payload.role
        if payload.password:
            user.password_hash = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()

        db.commit()
        db.refresh(user)
        return JSONResponse(success(_serialize(user), "User updated"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("update_user error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- DELETE ----------

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return JSONResponse(fail("Record not found"), status_code=404)
        db.delete(user)
        db.commit()
        return JSONResponse(success(None, "User deleted"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("delete_user error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)
