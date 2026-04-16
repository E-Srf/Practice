from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database import Base


class PayoutStatus(str, enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"
    paid     = "paid"


class Payout(Base):
    __tablename__ = "payouts"

    id             = Column(Integer, primary_key=True, index=True)
    account_id     = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    amount         = Column(Numeric, nullable=False)
    currency       = Column(String, default="USD")
    status         = Column(PgEnum(PayoutStatus, name="payout_status"), default=PayoutStatus.pending)
    payment_method = Column(String, nullable=True)
    payment_ref    = Column(String, nullable=True)
    note           = Column(String, nullable=True)
    requested_at   = Column(DateTime(timezone=True), server_default=func.now())
    processed_at   = Column(DateTime(timezone=True), nullable=True)
    processed_by   = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    account        = relationship("Account", back_populates="payouts")
