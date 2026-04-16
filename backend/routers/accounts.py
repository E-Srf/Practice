import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from backend.database import get_db
from backend.models.account import Account, AccountStatus, AccountPhase
from backend.utils.responses import success, fail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


# ---------- Schemas ----------

class AccountIn(BaseModel):
    user_id: int
    account_number: str
    initial_balance: Decimal
    platform: str = "MT5"
    currency: str = "USD"
    phase: AccountPhase = AccountPhase.phase1
    status: AccountStatus = AccountStatus.active
    challenge_id: Optional[int] = None
    balance: Optional[Decimal] = None
    equity: Optional[Decimal] = None
    expires_at: Optional[datetime] = None


class AccountOut(BaseModel):
    id: int
    user_id: int
    account_number: str
    platform: str
    currency: str
    phase: AccountPhase
    status: AccountStatus
    balance: Decimal
    equity: Decimal
    initial_balance: Decimal
    peak_balance: Optional[Decimal]
    challenge_id: Optional[int]
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


def _serialize(a: Account) -> dict:
    return AccountOut.model_validate(a).model_dump(mode="json")


# ---------- GET all ----------

@router.get("")
def list_accounts(db: Session = Depends(get_db)):
    try:
        accounts = db.query(Account).order_by(Account.created_at.desc()).all()
        return JSONResponse(success([_serialize(a) for a in accounts]))
    except SQLAlchemyError as e:
        logger.error("list_accounts error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- POST ----------

@router.post("", status_code=201)
def create_account(payload: AccountIn, db: Session = Depends(get_db)):
    if not payload.account_number.strip():
        return JSONResponse(fail("Field 'account_number' is required"), status_code=400)
    if payload.initial_balance <= 0:
        return JSONResponse(fail("Field 'initial_balance' must be greater than 0"), status_code=400)

    try:
        if db.query(Account).filter(Account.account_number == payload.account_number).first():
            return JSONResponse(fail("Account number already exists"), status_code=400)

        account = Account(
            user_id=payload.user_id,
            account_number=payload.account_number.strip(),
            initial_balance=payload.initial_balance,
            balance=payload.balance if payload.balance is not None else payload.initial_balance,
            equity=payload.equity if payload.equity is not None else payload.initial_balance,
            peak_balance=payload.initial_balance,
            platform=payload.platform,
            currency=payload.currency,
            phase=payload.phase,
            status=payload.status,
            challenge_id=payload.challenge_id,
            expires_at=payload.expires_at,
        )
        db.add(account)
        db.commit()
        db.refresh(account)
        return JSONResponse(success(_serialize(account), "Account created"), status_code=201)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("create_account error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- PUT ----------

@router.put("/{account_id}")
def update_account(account_id: int, payload: AccountIn, db: Session = Depends(get_db)):
    try:
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return JSONResponse(fail("Record not found"), status_code=404)

        account.platform        = payload.platform
        account.currency        = payload.currency
        account.phase           = payload.phase
        account.status          = payload.status
        account.challenge_id    = payload.challenge_id
        account.expires_at      = payload.expires_at
        if payload.balance is not None:
            account.balance = payload.balance
        if payload.equity is not None:
            account.equity = payload.equity

        db.commit()
        db.refresh(account)
        return JSONResponse(success(_serialize(account), "Account updated"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("update_account error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- DELETE ----------

@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    try:
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account:
            return JSONResponse(fail("Record not found"), status_code=404)
        db.delete(account)
        db.commit()
        return JSONResponse(success(None, "Account deleted"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("delete_account error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)
