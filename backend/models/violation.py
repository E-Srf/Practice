from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database import Base


class ViolationType(str, enum.Enum):
    daily_loss        = "daily_loss"
    total_loss        = "total_loss"
    lot_size          = "lot_size"
    trailing_drawdown = "trailing_drawdown"
    news_trading      = "news_trading"
    weekend_holding   = "weekend_holding"
    open_trades_limit = "open_trades_limit"


class Violation(Base):
    __tablename__ = "violations"

    id               = Column(Integer, primary_key=True, index=True)
    account_id       = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    trade_id         = Column(Integer, ForeignKey("trades.id", ondelete="SET NULL"), nullable=True)
    violation_type   = Column(PgEnum(ViolationType, name="violation_type"), nullable=False)
    description      = Column(String, nullable=True)
    value_at_breach  = Column(Numeric, nullable=True)
    rule_limit       = Column(Numeric, nullable=True)
    breached_at      = Column(DateTime(timezone=True), server_default=func.now())

    account          = relationship("Account", back_populates="violations")
    trade            = relationship("Trade", back_populates="violations")
