import logging
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime
from backend.database import get_db
from backend.models.risk_alert import RiskAlert, AlertType, AlertSeverity, AlertStatus
from backend.utils.responses import success, fail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/risk-alerts", tags=["Risk Alerts"])


# ---------- Schemas ----------

class RiskAlertIn(BaseModel):
    client_email: str
    account_number: Optional[str] = None
    alert_type: AlertType
    severity: AlertSeverity = AlertSeverity.medium
    status: AlertStatus = AlertStatus.open
    description: Optional[str] = None
    value_triggered: Optional[Decimal] = None
    threshold: Optional[Decimal] = None
    symbol: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[int] = None


class RiskAlertOut(BaseModel):
    id: int
    client_email: str
    account_number: Optional[str]
    alert_type: AlertType
    severity: AlertSeverity
    status: AlertStatus
    description: Optional[str]
    value_triggered: Optional[Decimal]
    threshold: Optional[Decimal]
    symbol: Optional[str]
    notes: Optional[str]
    assigned_to: Optional[int]
    created_at: datetime
    reviewed_at: Optional[datetime]
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


def _serialize(r: RiskAlert) -> dict:
    return RiskAlertOut.model_validate(r).model_dump(mode="json")


# ---------- GET all ----------

@router.get("")
def list_risk_alerts(db: Session = Depends(get_db)):
    try:
        alerts = db.query(RiskAlert).order_by(RiskAlert.created_at.desc()).all()
        return JSONResponse(success([_serialize(a) for a in alerts]))
    except SQLAlchemyError as e:
        logger.error("list_risk_alerts error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- POST ----------

@router.post("", status_code=201)
def create_risk_alert(payload: RiskAlertIn, db: Session = Depends(get_db)):
    if not payload.client_email.strip():
        return JSONResponse(fail("Field 'client_email' is required"), status_code=400)

    try:
        alert = RiskAlert(**payload.model_dump())
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return JSONResponse(success(_serialize(alert), "Risk alert created"), status_code=201)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("create_risk_alert error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- PUT ----------

@router.put("/{alert_id}")
def update_risk_alert(alert_id: int, payload: RiskAlertIn, db: Session = Depends(get_db)):
    try:
        alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
        if not alert:
            return JSONResponse(fail("Record not found"), status_code=404)

        for field, value in payload.model_dump().items():
            setattr(alert, field, value)

        db.commit()
        db.refresh(alert)
        return JSONResponse(success(_serialize(alert), "Risk alert updated"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("update_risk_alert error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)


# ---------- DELETE ----------

@router.delete("/{alert_id}")
def delete_risk_alert(alert_id: int, db: Session = Depends(get_db)):
    try:
        alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
        if not alert:
            return JSONResponse(fail("Record not found"), status_code=404)
        db.delete(alert)
        db.commit()
        return JSONResponse(success(None, "Risk alert deleted"))
    except SQLAlchemyError as e:
        db.rollback()
        logger.error("delete_risk_alert error: %s", e)
        return JSONResponse(fail("Database error, please try again"), status_code=500)
