"""
Fiduciary Dashboard Router
API endpoints for data fiduciary dashboard and management.

This module provides endpoints for:
- Dashboard statistics and analytics
- Purpose management (CRUD operations)
- Consent overview and filtering
- API key regeneration

All operations require fiduciary authentication.
"""
import json
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db, safe_commit
from app.constants import (
    DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET,
    DASHBOARD_RECENT_LIMIT, ErrorMessages
)
from app.models import (
    DataFiduciary, Purpose, Consent, User,
    ConsentStatus, AuditAction
)
from app.schemas import (
    FiduciaryDashboardStats, PurposeCreate, PurposeResponse
)
from app.services.auth import generate_api_key
from app.services.audit import create_audit_log
from app.dependencies.auth import get_current_fiduciary

router = APIRouter(prefix="/api/fiduciary", tags=["Fiduciary Dashboard"])


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _build_consent_response(consent: Consent, user: User, purpose: Purpose) -> dict:
    """
    Build a standardized consent response dictionary.

    Args:
        consent: The consent record.
        user: The data principal (user) who gave consent.
        purpose: The purpose the consent was given for.

    Returns:
        Dictionary with consent details for API response.
    """
    return {
        "consent_uuid": consent.uuid,
        "user_name": user.name if user else "Unknown",
        "user_email": user.email if user else "Unknown",
        "purpose_name": purpose.name if purpose else "Unknown",
        "purpose_uuid": purpose.uuid if purpose else None,
        "status": consent.status.value,
        "granted_at": consent.granted_at.isoformat(),
        "revoked_at": consent.revoked_at.isoformat() if consent.revoked_at else None,
        "expires_at": consent.expires_at.isoformat() if consent.expires_at else None
    }


def _get_consent_counts(db: Session, fiduciary_id: int) -> dict:
    """
    Get consent statistics for a fiduciary in a single efficient query.

    Args:
        db: Database session.
        fiduciary_id: ID of the fiduciary.

    Returns:
        Dictionary with total, active, and revoked consent counts.
    """
    from sqlalchemy import func, case

    result = db.query(
        func.count(Consent.id).label('total'),
        func.sum(case((Consent.status == ConsentStatus.GRANTED, 1), else_=0)).label('active'),
        func.sum(case((Consent.status == ConsentStatus.REVOKED, 1), else_=0)).label('revoked')
    ).filter(
        Consent.fiduciary_id == fiduciary_id
    ).first()

    return {
        'total': result.total or 0,
        'active': int(result.active or 0),
        'revoked': int(result.revoked or 0)
    }


# =============================================================================
# DASHBOARD ENDPOINTS
# =============================================================================

@router.get("/dashboard/stats", response_model=FiduciaryDashboardStats)
def get_fiduciary_stats(
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Get fiduciary dashboard statistics.

    Provides an overview of the fiduciary's consent management metrics
    including purpose counts, consent statistics, and recent activity.

    Args:
        current_fiduciary: Authenticated fiduciary.
        db: Database session.

    Returns:
        FiduciaryDashboardStats with all dashboard metrics.
    """
    from sqlalchemy import func

    fiduciary_id = current_fiduciary.id

    # Purpose counts (single query with conditional aggregation)
    purpose_stats = db.query(
        func.count(Purpose.id).label('total'),
        func.sum(func.cast(Purpose.is_active, db.bind.dialect.type_compiler.process(
            Purpose.is_active.type
        ) if hasattr(Purpose.is_active.type, 'impl') else 1)).label('active')
    ).filter(
        Purpose.fiduciary_id == fiduciary_id
    ).first()

    total_purposes = purpose_stats.total or 0
    active_purposes = db.query(Purpose).filter(
        Purpose.fiduciary_id == fiduciary_id,
        Purpose.is_active == True
    ).count()

    # Consent counts using helper
    consent_counts = _get_consent_counts(db, fiduciary_id)

    # Unique users count
    unique_users = db.query(Consent.user_id).filter(
        Consent.fiduciary_id == fiduciary_id
    ).distinct().count()

    # Recent consents with eager loading (fixes N+1)
    recent_consents_query = db.query(Consent).filter(
        Consent.fiduciary_id == fiduciary_id
    ).order_by(
        Consent.granted_at.desc()
    ).limit(DASHBOARD_RECENT_LIMIT).all()

    # Batch load related users and purposes to avoid N+1
    user_ids = [c.user_id for c in recent_consents_query]
    purpose_ids = [c.purpose_id for c in recent_consents_query]

    users_map = {
        u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()
    } if user_ids else {}

    purposes_map = {
        p.id: p for p in db.query(Purpose).filter(Purpose.id.in_(purpose_ids)).all()
    } if purpose_ids else {}

    recent_consents = [
        {
            "consent_uuid": c.uuid,
            "user_email": users_map.get(c.user_id, User(email="Unknown")).email,
            "purpose_name": purposes_map.get(c.purpose_id, Purpose(name="Unknown")).name,
            "status": c.status.value,
            "granted_at": c.granted_at.isoformat()
        }
        for c in recent_consents_query
    ]

    return FiduciaryDashboardStats(
        total_purposes=total_purposes,
        active_purposes=active_purposes,
        total_consents=consent_counts['total'],
        active_consents=consent_counts['active'],
        revoked_consents=consent_counts['revoked'],
        unique_users=unique_users,
        recent_consents=recent_consents
    )


# =============================================================================
# PURPOSE MANAGEMENT
# =============================================================================

@router.get("/purposes", response_model=List[PurposeResponse])
def get_fiduciary_purposes(
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Get all purposes defined by the current fiduciary.

    Args:
        current_fiduciary: Authenticated fiduciary.
        db: Database session.

    Returns:
        List of purposes belonging to the fiduciary.
    """
    return db.query(Purpose).filter(
        Purpose.fiduciary_id == current_fiduciary.id
    ).order_by(Purpose.created_at.desc()).all()


@router.post("/purposes", response_model=PurposeResponse)
def create_fiduciary_purpose(
    data: PurposeCreate,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Create a new purpose for consent collection.

    Defines a new data processing purpose that users can consent to.
    Each purpose must specify legal basis per DPDP/GDPR requirements.

    Args:
        data: Purpose creation data including name, description, legal basis.
        current_fiduciary: Authenticated fiduciary.
        db: Database session.

    Returns:
        The created purpose.
    """
    purpose = Purpose(
        fiduciary_id=current_fiduciary.id,
        name=data.name,
        description=data.description,
        data_categories=json.dumps(data.data_categories),
        retention_period_days=data.retention_period_days,
        legal_basis=data.legal_basis,
        is_mandatory=data.is_mandatory
    )
    db.add(purpose)
    safe_commit(db, "create purpose")
    db.refresh(purpose)

    create_audit_log(
        db, AuditAction.PURPOSE_CREATED, "purpose", purpose.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"name": purpose.name, "legal_basis": purpose.legal_basis}
    )

    return purpose


@router.put("/purposes/{uuid}", response_model=PurposeResponse)
def update_fiduciary_purpose(
    uuid: str,
    data: PurposeCreate,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Update an existing purpose.

    Modifies purpose details. Note: Changes may affect existing consents.

    Args:
        uuid: UUID of the purpose to update.
        data: Updated purpose data.
        current_fiduciary: Authenticated fiduciary (must own the purpose).
        db: Database session.

    Returns:
        The updated purpose.

    Raises:
        HTTPException 404: If purpose not found or not owned by fiduciary.
    """
    purpose = db.query(Purpose).filter(
        Purpose.uuid == uuid,
        Purpose.fiduciary_id == current_fiduciary.id
    ).first()

    if not purpose:
        raise HTTPException(status_code=404, detail=ErrorMessages.PURPOSE_NOT_FOUND)

    purpose.name = data.name
    purpose.description = data.description
    purpose.data_categories = json.dumps(data.data_categories)
    purpose.retention_period_days = data.retention_period_days
    purpose.legal_basis = data.legal_basis
    purpose.is_mandatory = data.is_mandatory

    safe_commit(db, "update purpose")
    db.refresh(purpose)
    return purpose


@router.delete("/purposes/{uuid}")
def delete_fiduciary_purpose(
    uuid: str,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Deactivate a purpose (soft delete).

    Purposes are soft-deleted to preserve consent history integrity.
    Deactivated purposes won't appear in consent collection flows.

    Args:
        uuid: UUID of the purpose to deactivate.
        current_fiduciary: Authenticated fiduciary (must own the purpose).
        db: Database session.

    Returns:
        Success message.

    Raises:
        HTTPException 404: If purpose not found or not owned by fiduciary.
    """
    purpose = db.query(Purpose).filter(
        Purpose.uuid == uuid,
        Purpose.fiduciary_id == current_fiduciary.id
    ).first()

    if not purpose:
        raise HTTPException(status_code=404, detail=ErrorMessages.PURPOSE_NOT_FOUND)

    purpose.is_active = False
    safe_commit(db, "deactivate purpose")
    return {"message": "Purpose deactivated successfully"}


# =============================================================================
# CONSENT MANAGEMENT
# =============================================================================

@router.get("/consents")
def get_fiduciary_consents(
    status: Optional[str] = None,
    purpose_uuid: Optional[str] = None,
    limit: int = DEFAULT_PAGE_LIMIT,
    offset: int = DEFAULT_PAGE_OFFSET,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Get all consents for fiduciary's purposes.

    Provides a paginated list of consents with optional filtering
    by status and purpose.

    Args:
        status: Filter by consent status ('granted', 'revoked').
        purpose_uuid: Filter by specific purpose UUID.
        limit: Maximum number of results (default: 100, max: 500).
        offset: Number of results to skip for pagination.
        current_fiduciary: Authenticated fiduciary.
        db: Database session.

    Returns:
        List of consent records with user and purpose details.
    """
    # Build base query
    query = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id
    )

    # Apply filters
    if status:
        query = query.filter(Consent.status == ConsentStatus(status))

    if purpose_uuid:
        purpose = db.query(Purpose).filter(Purpose.uuid == purpose_uuid).first()
        if purpose:
            query = query.filter(Consent.purpose_id == purpose.id)

    # Execute paginated query
    consents = query.order_by(
        Consent.granted_at.desc()
    ).offset(offset).limit(min(limit, 500)).all()

    # Batch load related entities (fixes N+1 query problem)
    user_ids = list(set(c.user_id for c in consents))
    purpose_ids = list(set(c.purpose_id for c in consents))

    users_map = {
        u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()
    } if user_ids else {}

    purposes_map = {
        p.id: p for p in db.query(Purpose).filter(Purpose.id.in_(purpose_ids)).all()
    } if purpose_ids else {}

    # Build response
    return [
        _build_consent_response(
            c,
            users_map.get(c.user_id),
            purposes_map.get(c.purpose_id)
        )
        for c in consents
    ]


# =============================================================================
# API KEY MANAGEMENT
# =============================================================================

@router.post("/api-key/regenerate")
def regenerate_fiduciary_api_key(
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """
    Regenerate the fiduciary's API key.

    Generates a new API key and invalidates the previous one.
    The new key should be stored securely as it cannot be retrieved again.

    Args:
        current_fiduciary: Authenticated fiduciary.
        db: Database session.

    Returns:
        The new API key (only shown once).
    """
    current_fiduciary.api_key = generate_api_key()
    safe_commit(db, "regenerate API key")

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "api_key", current_fiduciary.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"action": "regenerated"}
    )

    return {"api_key": current_fiduciary.api_key}
