"""
Audit Log Router
GDPR Article 30 compliance endpoints
"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, DataFiduciary, AuditLog, AuditAction
from app.schemas import AuditLogResponse
from app.dependencies.auth import get_current_user, get_fiduciary_by_api_key

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])


@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audit logs for current user (GDPR Article 30 compliance)"""
    query = db.query(AuditLog).filter(AuditLog.user_id == current_user.id)

    if action:
        query = query.filter(AuditLog.action == AuditAction(action))

    if start_date:
        query = query.filter(AuditLog.created_at >= datetime.fromisoformat(start_date))

    if end_date:
        query = query.filter(AuditLog.created_at <= datetime.fromisoformat(end_date))

    return query.order_by(
        AuditLog.created_at.desc()
    ).offset(offset).limit(limit).all()


@router.get("/fiduciary", response_model=List[AuditLogResponse])
def get_fiduciary_audit_logs(
    action: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    fiduciary: DataFiduciary = Depends(get_fiduciary_by_api_key),
    db: Session = Depends(get_db)
):
    """Get audit logs for fiduciary (requires API key)"""
    query = db.query(AuditLog).filter(AuditLog.fiduciary_id == fiduciary.id)

    if action:
        query = query.filter(AuditLog.action == AuditAction(action))

    return query.order_by(
        AuditLog.created_at.desc()
    ).offset(offset).limit(limit).all()
