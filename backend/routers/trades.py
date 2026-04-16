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
from backend.models.trade import Trade, TradeDirection, TradeStatus, TradeType
from backend.utils.responses import success, fail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/trades", tags=["Trades"])


# ---------- Schemas ----------

class TradeIn(BaseModel):
    account_id: int
    symbol: str
    direction: TradeDirection
    lot: Decimal
    entry_price: Decimal
    trade_type: TradeType = TradeType.market
    status: TradeStatus = TradeStatus.open
    exit_price: Optional[Decimal] = None
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    commission: Decimal = Decimal("0")
    swap: Decimal = Decimal("0")
    gross_profit: Decimal = Decimal("0")
    broker_trade_id: Optional[str] = None
    close_time: Optional[datetime] = None


class TradeOut(BaseModel):
    id: int
    account_id: int
    broker_trade_id: Optional[str]
    symbol: str
    direction: TradeDirection
    trade_type: TradeType
    status: TradeStatus
    lot: Decimal
    entry_price: Decimal
    exit_price: Optional[Decimal]
    stop_loss: Optional[Decimal]
    take_profit: Optional[Decimal]
    commission: Decimal
    swap: Decimal
    gross_profit: Decimal
    open_time: datetime
    close_time: Optional[datetime]

    class Config:
        from_attributes = True


def _serialize(t: Trade) -> dict:
    return TradeOut.model_validate(t).model_dump(mode="json")


# ---------- GET all ----------

@router.get("")
def list_trades(db: Session = Depends(get_db)):
    try:
        trades = db.query(Trade).order_by(Trade.open_time.desc()).all()
        return JSONResponse(success([_serialize(t) for t in trades]))
    except SQLAlchemyError as e:
        logger.error("list_trades error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- POST ----------

@router.post("", status_code=201)
def create_trade(payload: TradeIn, db: Session = Depends(get_db)):
    if not payload.symbol.strip():
        return JSONResponse(fail("Field 'symbol' is required"), status_code=400)
    if payload.lot <= 0:
        return JSONResponse(fail("Field 'lot' must be greater than 0"), status_code=400)
    if payload.entry_price <= 0:
        return JSONResponse(fail("Field 'entry_price' must be greater than 0"), status_code=400)

    try:
        trade = Trade(**payload.model_dump())
        db.add(trade)
        db.commit()
        db.refresh(trade)
        return JSONResponse(success(_serialize(trade), "Trade created"), status_code=201)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("create_trade error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- PUT ----------

@router.put("/{trade_id}")
def update_trade(trade_id: int, payload: TradeIn, db: Session = Depends(get_db)):
    try:
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if not trade:
            return JSONResponse(fail("Record not found"), status_code=404)

        for field, value in payload.model_dump().items():
            setattr(trade, field, value)

        db.commit()
        db.refresh(trade)
        return JSONResponse(success(_serialize(trade), "Trade updated"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("update_trade error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- DELETE ----------

@router.delete("/{trade_id}")
def delete_trade(trade_id: int, db: Session = Depends(get_db)):
    try:
        trade = db.query(Trade).filter(Trade.id == trade_id).first()
        if not trade:
            return JSONResponse(fail("Record not found"), status_code=404)
        db.delete(trade)
        db.commit()
        return JSONResponse(success(None, "Trade deleted"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("delete_trade error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)
