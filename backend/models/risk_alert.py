from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum as PgEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from backend.database import Base


class AlertType(str, enum.Enum):
    daily_loss        = "daily_loss"        # client exceeded daily loss limit
    total_drawdown    = "total_drawdown"    # total drawdown limit breached
    trailing_drawdown = "trailing_drawdown" # trailing drawdown from peak
    margin_call       = "margin_call"       # margin level too low
    lot_size          = "lot_size"          # oversized position opened
    overexposure      = "overexposure"      # too much open exposure on one symbol
    news_trading      = "news_trading"      # trade opened during restricted news window
    weekend_holding   = "weekend_holding"   # position held over weekend
    profit_target     = "profit_target"     # client hit profit target (phase pass)
    suspicious_activity = "suspicious_activity"  # manual flag by risk manager


class AlertSeverity(str, enum.Enum):
    low      = "low"
    medium   = "medium"
    high     = "high"
    critical = "critical"


class AlertStatus(str, enum.Enum):
    open       = "open"        # newly triggered, not yet reviewed
    reviewed   = "reviewed"    # seen by risk manager
    resolved   = "resolved"    # action taken, closed
    escalated  = "escalated"   # passed to senior/compliance
    dismissed  = "dismissed"   # false positive, ignored


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id               = Column(Integer, primary_key=True, index=True)

    # Who triggered it
    client_email     = Column(String, nullable=False, index=True)
    account_number   = Column(String, nullable=True, index=True)

    # What happened
    alert_type       = Column(PgEnum(AlertType, name="alert_type"), nullable=False)
    severity         = Column(PgEnum(AlertSeverity, name="alert_severity"), default=AlertSeverity.medium)
    description      = Column(Text, nullable=True)             # human-readable summary

    # Numbers
    value_triggered  = Column(Numeric, nullable=True)          # actual value at time of alert
    threshold        = Column(Numeric, nullable=True)          # the rule limit that was crossed
    symbol           = Column(String, nullable=True)           # relevant trading symbol if any

    # Workflow
    status           = Column(PgEnum(AlertStatus, name="alert_status"), default=AlertStatus.open)
    assigned_to      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes            = Column(Text, nullable=True)             # risk manager's notes

    # Timestamps
    created_at       = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    reviewed_at      = Column(DateTime(timezone=True), nullable=True)
    resolved_at      = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    assigned_user    = relationship("User", foreign_keys=[assigned_to])
