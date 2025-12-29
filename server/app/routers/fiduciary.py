"""
Fiduciary Dashboard Router
Endpoints for fiduciary dashboard management
"""
import json
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import (
    DataFiduciary, Purpose, Consent, User,
    ConsentStatus, AuditAction
)
from app.schemas import (
    FiduciaryDashboardStats, PurposeCreate, PurposeResponse
)
from app.services.auth import generate_api_key
from app.services.audit import create_audit_log
from app.services.expiry import EXPIRING_SOON_DAYS
from app.dependencies.auth import get_current_fiduciary

router = APIRouter(prefix="/api/fiduciary", tags=["Fiduciary Dashboard"])

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@router.get("/dashboard/stats", response_model=FiduciaryDashboardStats)
@limiter.limit("60/minute")
def get_fiduciary_stats(
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Get fiduciary dashboard statistics"""
    total_purposes = db.query(Purpose).filter(
        Purpose.fiduciary_id == current_fiduciary.id
    ).count()

    active_purposes = db.query(Purpose).filter(
        Purpose.fiduciary_id == current_fiduciary.id,
        Purpose.is_active == True
    ).count()

    total_consents = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id
    ).count()

    active_consents = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id,
        Consent.status == ConsentStatus.GRANTED
    ).count()

    # Expiring consents (within EXPIRING_SOON_DAYS)
    expiry_threshold = datetime.utcnow() + timedelta(days=EXPIRING_SOON_DAYS)
    expiring_consents = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id,
        Consent.status == ConsentStatus.GRANTED,
        Consent.expires_at != None,
        Consent.expires_at <= expiry_threshold,
        Consent.expires_at > datetime.utcnow()
    ).count()

    # Expired consents
    expired_consents = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id,
        Consent.status == ConsentStatus.EXPIRED
    ).count()

    revoked_consents = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id,
        Consent.status == ConsentStatus.REVOKED
    ).count()

    unique_users = db.query(Consent.user_id).filter(
        Consent.fiduciary_id == current_fiduciary.id
    ).distinct().count()

    # Recent consents
    recent = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id
    ).order_by(Consent.granted_at.desc()).limit(10).all()

    recent_consents = []
    for c in recent:
        user = db.query(User).filter(User.id == c.user_id).first()
        purpose = db.query(Purpose).filter(Purpose.id == c.purpose_id).first()
        recent_consents.append({
            "consent_uuid": c.uuid,
            "user_email": user.email if user else "Unknown",
            "purpose_name": purpose.name if purpose else "Unknown",
            "status": c.status.value,
            "granted_at": c.granted_at.isoformat()
        })

    return FiduciaryDashboardStats(
        total_purposes=total_purposes,
        active_purposes=active_purposes,
        total_consents=total_consents,
        active_consents=active_consents,
        expiring_consents=expiring_consents,
        expired_consents=expired_consents,
        revoked_consents=revoked_consents,
        unique_users=unique_users,
        recent_consents=recent_consents
    )


@router.get("/purposes", response_model=List[PurposeResponse])
@limiter.limit("60/minute")
def get_fiduciary_purposes(
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Get all purposes for current fiduciary"""
    return db.query(Purpose).filter(
        Purpose.fiduciary_id == current_fiduciary.id
    ).all()


@router.post("/purposes", response_model=PurposeResponse)
@limiter.limit("20/minute")
def create_fiduciary_purpose(
    request: Request,
    data: PurposeCreate,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Create a new purpose for consent collection"""
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
    db.commit()
    db.refresh(purpose)

    create_audit_log(
        db, AuditAction.PURPOSE_CREATED, "purpose", purpose.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"name": purpose.name, "legal_basis": purpose.legal_basis}
    )

    return purpose


@router.put("/purposes/{uuid}", response_model=PurposeResponse)
@limiter.limit("20/minute")
def update_fiduciary_purpose(
    request: Request,
    uuid: str,
    data: PurposeCreate,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Update a purpose"""
    purpose = db.query(Purpose).filter(
        Purpose.uuid == uuid,
        Purpose.fiduciary_id == current_fiduciary.id
    ).first()

    if not purpose:
        raise HTTPException(status_code=404, detail="Purpose not found")

    purpose.name = data.name
    purpose.description = data.description
    purpose.data_categories = json.dumps(data.data_categories)
    purpose.retention_period_days = data.retention_period_days
    purpose.legal_basis = data.legal_basis
    purpose.is_mandatory = data.is_mandatory
    db.commit()
    db.refresh(purpose)
    return purpose


@router.delete("/purposes/{uuid}")
@limiter.limit("20/minute")
def delete_fiduciary_purpose(
    request: Request,
    uuid: str,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Deactivate a purpose (soft delete)"""
    purpose = db.query(Purpose).filter(
        Purpose.uuid == uuid,
        Purpose.fiduciary_id == current_fiduciary.id
    ).first()

    if not purpose:
        raise HTTPException(status_code=404, detail="Purpose not found")

    purpose.is_active = False
    db.commit()
    return {"message": "Purpose deactivated"}


@router.get("/consents")
@limiter.limit("60/minute")
def get_fiduciary_consents(
    request: Request,
    status: Optional[str] = None,
    purpose_uuid: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Get all consents for fiduciary's purposes"""
    query = db.query(Consent).filter(
        Consent.fiduciary_id == current_fiduciary.id
    )

    if status:
        query = query.filter(Consent.status == ConsentStatus(status))

    if purpose_uuid:
        purpose = db.query(Purpose).filter(Purpose.uuid == purpose_uuid).first()
        if purpose:
            query = query.filter(Consent.purpose_id == purpose.id)

    consents = query.order_by(
        Consent.granted_at.desc()
    ).offset(offset).limit(limit).all()

    result = []
    for c in consents:
        user = db.query(User).filter(User.id == c.user_id).first()
        purpose = db.query(Purpose).filter(Purpose.id == c.purpose_id).first()
        result.append({
            "consent_uuid": c.uuid,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "purpose_name": purpose.name if purpose else "Unknown",
            "purpose_uuid": purpose.uuid if purpose else None,
            "status": c.status.value,
            "granted_at": c.granted_at.isoformat(),
            "revoked_at": c.revoked_at.isoformat() if c.revoked_at else None,
            "expires_at": c.expires_at.isoformat() if c.expires_at else None
        })

    return result


@router.post("/api-key/regenerate")
@limiter.limit("3/minute")
def regenerate_api_key(
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Regenerate API key"""
    current_fiduciary.api_key = generate_api_key()
    db.commit()
    return {"api_key": current_fiduciary.api_key}
