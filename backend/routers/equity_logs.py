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
from backend.models.equity_log import EquityLog
from backend.utils.responses import success, fail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/equity-logs", tags=["Equity Logs"])


# ---------- Schemas ----------

class EquityLogIn(BaseModel):
    account_id: int
    balance: Decimal
    equity: Decimal
    drawdown: Optional[Decimal] = None
    peak_balance: Optional[Decimal] = None


class EquityLogOut(BaseModel):
    id: int
    account_id: int
    balance: Decimal
    equity: Decimal
    drawdown: Optional[Decimal]
    peak_balance: Optional[Decimal]
    logged_at: datetime

    class Config:
        from_attributes = True


def _serialize(e: EquityLog) -> dict:
    return EquityLogOut.model_validate(e).model_dump(mode="json")


# ---------- GET all ----------

@router.get("")
def list_equity_logs(db: Session = Depends(get_db)):
    try:
        logs = db.query(EquityLog).order_by(EquityLog.logged_at.desc()).all()
        return JSONResponse(success([_serialize(e) for e in logs]))
    except SQLAlchemyError as e:
        logger.error("list_equity_logs error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- POST ----------

@router.post("", status_code=201)
def create_equity_log(payload: EquityLogIn, db: Session = Depends(get_db)):
    if payload.balance < 0:
        return JSONResponse(fail("Field 'balance' cannot be negative"), status_code=400)
    if payload.equity < 0:
        return JSONResponse(fail("Field 'equity' cannot be negative"), status_code=400)

    try:
        log = EquityLog(**payload.model_dump())
        db.add(log)
        db.commit()
        db.refresh(log)
        return JSONResponse(success(_serialize(log), "Equity log created"), status_code=201)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("create_equity_log error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- PUT ----------

@router.put("/{log_id}")
def update_equity_log(log_id: int, payload: EquityLogIn, db: Session = Depends(get_db)):
    try:
        log = db.query(EquityLog).filter(EquityLog.id == log_id).first()
        if not log:
            return JSONResponse(fail("Record not found"), status_code=404)

        for field, value in payload.model_dump().items():
            setattr(log, field, value)

        db.commit()
        db.refresh(log)
        return JSONResponse(success(_serialize(log), "Equity log updated"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("update_equity_log error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- DELETE ----------

@router.delete("/{log_id}")
def delete_equity_log(log_id: int, db: Session = Depends(get_db)):
    try:
        log = db.query(EquityLog).filter(EquityLog.id == log_id).first()
        if not log:
            return JSONResponse(fail("Record not found"), status_code=404)
        db.delete(log)
        db.commit()
        return JSONResponse(success(None, "Equity log deleted"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("delete_equity_log error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)
