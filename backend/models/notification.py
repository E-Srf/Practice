from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database import Base


class NotifType(str, enum.Enum):
    warning = "warning"
    breach  = "breach"
    payout  = "payout"
    system  = "system"
    info    = "info"


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=True)
    type       = Column(PgEnum(NotifType, name="notif_type"), default=NotifType.info)
    title      = Column(String, nullable=False)
    message    = Column(String, nullable=False)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="notifications")
    account    = relationship("Account", back_populates="notifications")
