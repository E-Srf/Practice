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
from backend.models.rule import Rule
from backend.utils.responses import success, fail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/rules", tags=["Rules"])


# ---------- Schemas ----------

class RuleIn(BaseModel):
    account_id: int
    max_daily_loss_pct: Decimal
    max_total_loss_pct: Decimal
    profit_target_pct: Decimal
    trailing_drawdown_pct: Optional[Decimal] = None
    max_lot_size: Optional[Decimal] = None
    max_open_lots: Optional[Decimal] = None
    max_open_trades: Optional[int] = None
    min_trading_days: int = 0
    news_trading_allowed: bool = False
    weekend_holding_allowed: bool = False
    ea_allowed: bool = True


class RuleOut(BaseModel):
    id: int
    account_id: int
    max_daily_loss_pct: Decimal
    max_total_loss_pct: Decimal
    profit_target_pct: Decimal
    trailing_drawdown_pct: Optional[Decimal]
    max_lot_size: Optional[Decimal]
    max_open_lots: Optional[Decimal]
    max_open_trades: Optional[int]
    min_trading_days: int
    news_trading_allowed: bool
    weekend_holding_allowed: bool
    ea_allowed: bool
    created_at: datetime

    class Config:
        from_attributes = True


def _serialize(r: Rule) -> dict:
    return RuleOut.model_validate(r).model_dump(mode="json")


# ---------- GET all ----------

@router.get("")
def list_rules(db: Session = Depends(get_db)):
    try:
        rules = db.query(Rule).order_by(Rule.created_at.desc()).all()
        return JSONResponse(success([_serialize(r) for r in rules]))
    except SQLAlchemyError as e:
        logger.error("list_rules error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- POST ----------

@router.post("", status_code=201)
def create_rule(payload: RuleIn, db: Session = Depends(get_db)):
    if payload.max_daily_loss_pct <= 0:
        return JSONResponse(fail("Field 'max_daily_loss_pct' must be greater than 0"), status_code=400)
    if payload.max_total_loss_pct <= 0:
        return JSONResponse(fail("Field 'max_total_loss_pct' must be greater than 0"), status_code=400)
    if payload.profit_target_pct <= 0:
        return JSONResponse(fail("Field 'profit_target_pct' must be greater than 0"), status_code=400)

    try:
        if db.query(Rule).filter(Rule.account_id == payload.account_id).first():
            return JSONResponse(fail("Rules already exist for this account"), status_code=400)

        rule = Rule(**payload.model_dump())
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return JSONResponse(success(_serialize(rule), "Rule created"), status_code=201)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("create_rule error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- PUT ----------

@router.put("/{rule_id}")
def update_rule(rule_id: int, payload: RuleIn, db: Session = Depends(get_db)):
    try:
        rule = db.query(Rule).filter(Rule.id == rule_id).first()
        if not rule:
            return JSONResponse(fail("Record not found"), status_code=404)

        for field, value in payload.model_dump().items():
            setattr(rule, field, value)

        db.commit()
        db.refresh(rule)
        return JSONResponse(success(_serialize(rule), "Rule updated"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("update_rule error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- DELETE ----------

@router.delete("/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    try:
        rule = db.query(Rule).filter(Rule.id == rule_id).first()
        if not rule:
            return JSONResponse(fail("Record not found"), status_code=404)
        db.delete(rule)
        db.commit()
        return JSONResponse(success(None, "Rule deleted"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("delete_rule error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)
