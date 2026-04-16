from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database import Base


class UserRole(str, enum.Enum):
    admin          = "admin"
    support        = "support"
    sales          = "sales"
    finance        = "finance"
    risk_manager   = "risk_manager"
    account_manager = "account_manager"
    marketing      = "marketing"


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String, nullable=False)
    email          = Column(String, unique=True, nullable=False, index=True)
    password_hash  = Column(String, nullable=True)
    role           = Column(PgEnum(UserRole, name="user_role"), default=UserRole.support)
    email_verified = Column(Boolean, default=False)
    is_active      = Column(Boolean, default=True)
    last_login     = Column(DateTime(timezone=True), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    accounts       = relationship("Account", back_populates="user")
    notifications  = relationship("Notification", back_populates="user")
