import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from typing import Optional, Any
from decimal import Decimal
from datetime import datetime
from backend.database import get_db
from backend.models.challenge import Challenge
from backend.utils.responses import success, fail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/challenges", tags=["Challenges"])


# ---------- Schemas ----------

class ChallengeIn(BaseModel):
    name: str
    account_size: Decimal
    price: Decimal
    description: Optional[str] = None
    currency: str = "USD"
    phase: int = 1
    duration_days: int = 30
    is_active: bool = True
    rules: Optional[Any] = None


class ChallengeOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    account_size: Decimal
    price: Decimal
    currency: str
    phase: int
    duration_days: int
    is_active: bool
    rules: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True


def _serialize(c: Challenge) -> dict:
    return ChallengeOut.model_validate(c).model_dump(mode="json")


# ---------- GET all ----------

@router.get("")
def list_challenges(db: Session = Depends(get_db)):
    try:
        challenges = db.query(Challenge).order_by(Challenge.created_at.desc()).all()
        return JSONResponse(success([_serialize(c) for c in challenges]))
    except SQLAlchemyError as e:
        logger.error("list_challenges error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- POST ----------

@router.post("", status_code=201)
def create_challenge(payload: ChallengeIn, db: Session = Depends(get_db)):
    if not payload.name.strip():
        return JSONResponse(fail("Field 'name' is required"), status_code=400)
    if payload.account_size <= 0:
        return JSONResponse(fail("Field 'account_size' must be greater than 0"), status_code=400)
    if payload.price < 0:
        return JSONResponse(fail("Field 'price' cannot be negative"), status_code=400)
    if payload.phase not in (1, 2):
        return JSONResponse(fail("Field 'phase' must be 1 or 2"), status_code=400)

    try:
        challenge = Challenge(**payload.model_dump())
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        return JSONResponse(success(_serialize(challenge), "Challenge created"), status_code=201)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("create_challenge error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- PUT ----------

@router.put("/{challenge_id}")
def update_challenge(challenge_id: int, payload: ChallengeIn, db: Session = Depends(get_db)):
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            return JSONResponse(fail("Record not found"), status_code=404)

        for field, value in payload.model_dump().items():
            setattr(challenge, field, value)

        db.commit()
        db.refresh(challenge)
        return JSONResponse(success(_serialize(challenge), "Challenge updated"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("update_challenge error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- DELETE ----------

@router.delete("/{challenge_id}")
def delete_challenge(challenge_id: int, db: Session = Depends(get_db)):
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            return JSONResponse(fail("Record not found"), status_code=404)
        db.delete(challenge)
        db.commit()
        return JSONResponse(success(None, "Challenge deleted"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("delete_challenge error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)
