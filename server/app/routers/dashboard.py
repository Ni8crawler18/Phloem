"""
Dashboard Router
User dashboard and health check endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User, DataFiduciary, Purpose, Consent, AuditLog, ConsentStatus
)
from app.schemas import DashboardStats, DataFiduciaryResponse
from app.dependencies.auth import get_current_user
from app.config import settings

router = APIRouter(tags=["Dashboard"])


@router.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    total_consents = db.query(Consent).filter(
        Consent.user_id == current_user.id
    ).count()

    active_consents = db.query(Consent).filter(
        Consent.user_id == current_user.id,
        Consent.status == ConsentStatus.GRANTED
    ).count()

    revoked_consents = db.query(Consent).filter(
        Consent.user_id == current_user.id,
        Consent.status == ConsentStatus.REVOKED
    ).count()

    # Recent activity
    recent = db.query(AuditLog).filter(
        AuditLog.user_id == current_user.id
    ).order_by(AuditLog.created_at.desc()).limit(10).all()

    recent_activity = [{
        "action": r.action.value,
        "resource_type": r.resource_type,
        "created_at": r.created_at.isoformat()
    } for r in recent]

    return DashboardStats(
        total_users=1,
        total_consents=total_consents,
        active_consents=active_consents,
        revoked_consents=revoked_consents,
        total_purposes=db.query(Purpose).filter(Purpose.is_active == True).count(),
        recent_activity=recent_activity
    )


# ========== Data Fiduciaries (Public Read-Only) ==========

@router.get("/api/fiduciaries", response_model=List[DataFiduciaryResponse])
def list_fiduciaries(db: Session = Depends(get_db)):
    """List all active data fiduciaries"""
    return db.query(DataFiduciary).filter(DataFiduciary.is_active == True).all()


@router.get("/api/fiduciaries/{uuid}", response_model=DataFiduciaryResponse)
def get_fiduciary(uuid: str, db: Session = Depends(get_db)):
    """Get fiduciary details by UUID"""
    fiduciary = db.query(DataFiduciary).filter(DataFiduciary.uuid == uuid).first()
    if not fiduciary:
        raise HTTPException(status_code=404, detail="Fiduciary not found")
    return fiduciary


# ========== Health Check ==========

@router.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@router.get("/")
def root():
    """Root endpoint"""
    return {
        "name": f"{settings.APP_NAME} - Consent Management System",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "compliance": ["DPDP Act 2023", "GDPR"]
    }
