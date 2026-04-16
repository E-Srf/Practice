from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from backend.database import get_db
from backend.models.trade import Trade, TradeDirection, TradeStatus, TradeType

router = APIRouter(prefix="/trades", tags=["Trades"])


# ---------- Schemas ----------

class TradeCreate(BaseModel):
    account_id: int
    symbol: str
    direction: TradeDirection
    trade_type: TradeType = TradeType.market
    lot: Decimal
    entry_price: Decimal
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    broker_trade_id: Optional[str] = None


class TradeClose(BaseModel):
    exit_price: Decimal
    gross_profit: Decimal
    commission: Decimal = Decimal("0")
    swap: Decimal = Decimal("0")


class TradeResponse(BaseModel):
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


# ---------- Routes ----------

@router.get("/", response_model=list[TradeResponse])
def list_trades(
    account_id: Optional[int] = None,
    status: Optional[TradeStatus] = None,
    symbol: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Trade)
    if account_id:
        query = query.filter(Trade.account_id == account_id)
    if status:
        query = query.filter(Trade.status == status)
    if symbol:
        query = query.filter(Trade.symbol == symbol.upper())
    return query.order_by(Trade.open_time.desc()).all()


@router.get("/{trade_id}", response_model=TradeResponse)
def get_trade(trade_id: int, db: Session = Depends(get_db)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade


@router.post("/", response_model=TradeResponse, status_code=201)
def open_trade(payload: TradeCreate, db: Session = Depends(get_db)):
    trade = Trade(**payload.model_dump())
    db.add(trade)
    db.commit()
    db.refresh(trade)
    return trade


@router.patch("/{trade_id}/close", response_model=TradeResponse)
def close_trade(trade_id: int, payload: TradeClose, db: Session = Depends(get_db)):
    trade = db.query(Trade).filter(Trade.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    if trade.status != TradeStatus.open:
        raise HTTPException(status_code=400, detail="Trade is not open")

    trade.exit_price  = payload.exit_price
    trade.gross_profit = payload.gross_profit
    trade.commission  = payload.commission
    trade.swap        = payload.swap
    trade.status      = TradeStatus.closed
    trade.close_time  = datetime.utcnow()

    db.commit()
    db.refresh(trade)
    return trade


@router.get("/account/{account_id}/open", response_model=list[TradeResponse])
def get_open_trades(account_id: int, db: Session = Depends(get_db)):
    return db.query(Trade).filter(
        Trade.account_id == account_id,
        Trade.status == TradeStatus.open
    ).all()
