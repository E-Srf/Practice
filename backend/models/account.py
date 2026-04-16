from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database import Base


class AccountStatus(str, enum.Enum):
    active    = "active"
    passed    = "passed"
    breached  = "breached"
    funded    = "funded"
    suspended = "suspended"
    expired   = "expired"


class AccountPhase(str, enum.Enum):
    phase1 = "phase1"
    phase2 = "phase2"
    funded = "funded"


class Account(Base):
    __tablename__ = "accounts"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id    = Column(Integer, ForeignKey("challenges.id", ondelete="SET NULL"), nullable=True)
    account_number  = Column(String, unique=True, nullable=False)
    platform        = Column(String, default="MT5")
    currency        = Column(String, default="USD")
    phase           = Column(PgEnum(AccountPhase, name="account_phase"), default=AccountPhase.phase1)
    status          = Column(PgEnum(AccountStatus, name="account_status"), default=AccountStatus.active)
    balance         = Column(Numeric, default=0)
    equity          = Column(Numeric, default=0)
    initial_balance = Column(Numeric, nullable=False)
    peak_balance    = Column(Numeric, nullable=True)
    expires_at      = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user            = relationship("User", back_populates="accounts")
    challenge       = relationship("Challenge", back_populates="accounts")
    trades          = relationship("Trade", back_populates="account")
    rule            = relationship("Rule", back_populates="account", uselist=False)
    violations      = relationship("Violation", back_populates="account")
    payouts         = relationship("Payout", back_populates="account")
    notifications   = relationship("Notification", back_populates="account")
