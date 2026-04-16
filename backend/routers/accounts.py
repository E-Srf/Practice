from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from backend.database import get_db
from backend.models.account import Account, AccountStatus, AccountPhase

router = APIRouter(prefix="/accounts", tags=["Accounts"])


# ---------- Schemas ----------

class AccountCreate(BaseModel):
    user_id: int
    account_number: str
    initial_balance: Decimal
    platform: str = "MT5"
    currency: str = "USD"
    phase: AccountPhase = AccountPhase.phase1
    challenge_id: Optional[int] = None


class AccountResponse(BaseModel):
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
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Routes ----------

@router.get("/", response_model=list[AccountResponse])
def list_accounts(
    status: Optional[AccountStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Account)
    if status:
        query = query.filter(Account.status == status)
    return query.all()


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("/user/{user_id}", response_model=list[AccountResponse])
def get_accounts_by_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(Account).filter(Account.user_id == user_id).all()


@router.post("/", response_model=AccountResponse, status_code=201)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    existing = db.query(Account).filter(Account.account_number == payload.account_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account number already exists")

    account = Account(
        **payload.model_dump(),
        balance=payload.initial_balance,
        equity=payload.initial_balance,
        peak_balance=payload.initial_balance,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.patch("/{account_id}/status", response_model=AccountResponse)
def update_account_status(
    account_id: int,
    status: AccountStatus,
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account.status = status
    db.commit()
    db.refresh(account)
    return account
