"""
Audit Service
DPDP Section 8 & GDPR Article 30 compliance
"""
import json
from typing import Optional
from sqlalchemy.orm import Session

from app.models import AuditLog, AuditAction


def create_audit_log(
    db: Session,
    action: AuditAction,
    resource_type: str,
    resource_id: Optional[str] = None,
    user_id: Optional[int] = None,
    fiduciary_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AuditLog:
    """
    Create an immutable audit log entry.
    All consent-related actions are logged for compliance.
    """
    log = AuditLog(
        user_id=user_id,
        fiduciary_id=fiduciary_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=json.dumps(details) if details else None,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(log)
    db.commit()
    return log
