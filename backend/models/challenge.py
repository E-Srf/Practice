from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class Challenge(Base):
    __tablename__ = "challenges"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    description   = Column(String, nullable=True)
    account_size  = Column(Numeric, nullable=False)
    price         = Column(Numeric, nullable=False)
    currency      = Column(String, default="USD")
    phase         = Column(Integer, nullable=False, default=1)
    duration_days = Column(Integer, nullable=False, default=30)
    is_active     = Column(Boolean, default=True)
    rules         = Column(JSON, nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    accounts      = relationship("Account", back_populates="challenge")
