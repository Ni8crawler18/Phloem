"""
Audit Service
Compliance logging for DPDP Section 8 and GDPR Article 30.

This module provides immutable audit logging for all consent-related
actions. Audit logs are critical for:
- Regulatory compliance (DPDP, GDPR)
- Security incident investigation
- Data access tracking
- Consent lifecycle documentation

All logs are append-only and include:
- Timestamp (UTC)
- Actor identification (user or fiduciary)
- Action performed
- Resource affected
- IP address and user agent for traceability
"""
import json
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session

from app.models import AuditLog, AuditAction
from app.database import safe_commit


def create_audit_log(
    db: Session,
    action: AuditAction,
    resource_type: str,
    resource_id: Optional[str] = None,
    user_id: Optional[int] = None,
    fiduciary_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AuditLog:
    """
    Create an immutable audit log entry.

    Records an action for compliance and security auditing.
    All consent-related actions should be logged using this function.

    Args:
        db: Database session for persistence.
        action: The type of action performed (from AuditAction enum).
        resource_type: Type of resource affected (e.g., 'consent', 'purpose', 'user').
        resource_id: Optional UUID of the affected resource.
        user_id: Optional ID of the user who performed the action.
        fiduciary_id: Optional ID of the fiduciary who performed the action.
        details: Optional dictionary of additional context (will be JSON serialized).
        ip_address: Optional client IP address for traceability.
        user_agent: Optional client user agent string.

    Returns:
        The created AuditLog entry.

    Example:
        >>> create_audit_log(
        ...     db=db,
        ...     action=AuditAction.CONSENT_GRANTED,
        ...     resource_type="consent",
        ...     resource_id="abc-123-uuid",
        ...     user_id=1,
        ...     fiduciary_id=1,
        ...     details={"purpose": "Marketing"},
        ...     ip_address="192.168.1.1"
        ... )

    Note:
        Audit logs are append-only. Once created, they cannot be
        modified or deleted to maintain compliance integrity.
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
    safe_commit(db, "create audit log")

    return log


def get_user_audit_trail(
    db: Session,
    user_id: int,
    limit: int = 100,
    offset: int = 0
) -> list:
    """
    Retrieve audit trail for a specific user.

    Fetches all audit logs related to a user's actions,
    ordered by most recent first.

    Args:
        db: Database session.
        user_id: ID of the user to get audit trail for.
        limit: Maximum number of entries to return.
        offset: Number of entries to skip (for pagination).

    Returns:
        List of AuditLog entries for the user.
    """
    return db.query(AuditLog).filter(
        AuditLog.user_id == user_id
    ).order_by(
        AuditLog.created_at.desc()
    ).offset(offset).limit(limit).all()


def get_fiduciary_audit_trail(
    db: Session,
    fiduciary_id: int,
    limit: int = 100,
    offset: int = 0
) -> list:
    """
    Retrieve audit trail for a specific fiduciary.

    Fetches all audit logs related to a fiduciary's actions
    and consents given to them, ordered by most recent first.

    Args:
        db: Database session.
        fiduciary_id: ID of the fiduciary to get audit trail for.
        limit: Maximum number of entries to return.
        offset: Number of entries to skip (for pagination).

    Returns:
        List of AuditLog entries for the fiduciary.
    """
    return db.query(AuditLog).filter(
        AuditLog.fiduciary_id == fiduciary_id
    ).order_by(
        AuditLog.created_at.desc()
    ).offset(offset).limit(limit).all()
