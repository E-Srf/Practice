from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database import Base


class TradeDirection(str, enum.Enum):
    BUY  = "BUY"
    SELL = "SELL"


class TradeStatus(str, enum.Enum):
    open      = "open"
    closed    = "closed"
    cancelled = "cancelled"


class TradeType(str, enum.Enum):
    market = "market"
    limit  = "limit"
    stop   = "stop"


class Trade(Base):
    __tablename__ = "trades"

    id              = Column(Integer, primary_key=True, index=True)
    account_id      = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    broker_trade_id = Column(String, nullable=True)
    symbol          = Column(String, nullable=False)
    direction       = Column(PgEnum(TradeDirection, name="trade_direction"), nullable=False)
    trade_type      = Column(PgEnum(TradeType, name="trade_type"), default=TradeType.market)
    status          = Column(PgEnum(TradeStatus, name="trade_status"), default=TradeStatus.open)
    lot             = Column(Numeric, nullable=False)
    entry_price     = Column(Numeric, nullable=False)
    exit_price      = Column(Numeric, nullable=True)
    stop_loss       = Column(Numeric, nullable=True)
    take_profit     = Column(Numeric, nullable=True)
    commission      = Column(Numeric, default=0)
    swap            = Column(Numeric, default=0)
    gross_profit    = Column(Numeric, default=0)
    open_time       = Column(DateTime(timezone=True), server_default=func.now())
    close_time      = Column(DateTime(timezone=True), nullable=True)

    account         = relationship("Account", back_populates="trades")
    violations      = relationship("Violation", back_populates="trade")
