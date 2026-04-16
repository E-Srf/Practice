from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class EquityLog(Base):
    __tablename__ = "equity_logs"

    id           = Column(Integer, primary_key=True, index=True)
    account_id   = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    balance      = Column(Numeric, nullable=False)
    equity       = Column(Numeric, nullable=False)
    drawdown     = Column(Numeric, nullable=True)
    peak_balance = Column(Numeric, nullable=True)
    logged_at    = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    account      = relationship("Account", backref="equity_logs")
