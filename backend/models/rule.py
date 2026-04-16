from sqlalchemy import Column, Integer, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class Rule(Base):
    __tablename__ = "rules"

    id                       = Column(Integer, primary_key=True, index=True)
    account_id               = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    max_daily_loss_pct       = Column(Numeric, nullable=False)
    max_total_loss_pct       = Column(Numeric, nullable=False)
    profit_target_pct        = Column(Numeric, nullable=False)
    trailing_drawdown_pct    = Column(Numeric, nullable=True)
    max_lot_size             = Column(Numeric, nullable=True)
    max_open_lots            = Column(Numeric, nullable=True)
    max_open_trades          = Column(Integer, nullable=True)
    min_trading_days         = Column(Integer, default=0)
    news_trading_allowed     = Column(Boolean, default=False)
    weekend_holding_allowed  = Column(Boolean, default=False)
    ea_allowed               = Column(Boolean, default=True)
    created_at               = Column(DateTime(timezone=True), server_default=func.now())
    updated_at               = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    account                  = relationship("Account", back_populates="rule")
