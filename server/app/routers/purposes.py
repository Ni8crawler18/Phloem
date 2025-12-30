"""
Purposes Router
Public API endpoints for purpose management.

This module provides:
- Purpose creation via API key authentication
- Public purpose listing (with optional fiduciary filter)
- Purpose details retrieval

Purposes define the legal basis and scope for data processing
as required by DPDP Act and GDPR.
"""
import json
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db, safe_commit
from app.constants import ErrorMessages
from app.models import DataFiduciary, Purpose, AuditAction
from app.schemas import PurposeCreate, PurposeResponse
from app.services.audit import create_audit_log
from app.dependencies.auth import get_fiduciary_by_api_key

router = APIRouter(prefix="/api/purposes", tags=["Purposes"])


@router.post("", response_model=PurposeResponse)
def create_purpose(
    data: PurposeCreate,
    fiduciary: DataFiduciary = Depends(get_fiduciary_by_api_key),
    db: Session = Depends(get_db)
):
    """
    Create a new purpose for consent collection.

    Requires API key authentication. Each purpose defines:
    - What data will be collected (data_categories)
    - Why it's being collected (legal_basis)
    - How long it will be retained (retention_period_days)

    Args:
        data: Purpose creation data.
        fiduciary: Authenticated fiduciary (via API key).
        db: Database session.

    Returns:
        The created purpose.
    """
    purpose = Purpose(
        fiduciary_id=fiduciary.id,
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
        fiduciary_id=fiduciary.id,
        details={"name": purpose.name, "legal_basis": purpose.legal_basis}
    )

    return purpose


@router.get("", response_model=List[PurposeResponse])
def list_purposes(
    fiduciary_uuid: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all active purposes.

    Public endpoint for retrieving available purposes.
    Can be filtered by fiduciary UUID.

    Args:
        fiduciary_uuid: Optional fiduciary UUID to filter by.
        db: Database session.

    Returns:
        List of active purposes.
    """
    query = db.query(Purpose).filter(Purpose.is_active == True)

    if fiduciary_uuid:
        fiduciary = db.query(DataFiduciary).filter(
            DataFiduciary.uuid == fiduciary_uuid
        ).first()
        if fiduciary:
            query = query.filter(Purpose.fiduciary_id == fiduciary.id)

    return query.order_by(Purpose.created_at.desc()).all()


@router.get("/{uuid}", response_model=PurposeResponse)
def get_purpose(uuid: str, db: Session = Depends(get_db)):
    """
    Get purpose details by UUID.

    Public endpoint for retrieving a specific purpose's details.

    Args:
        uuid: Purpose UUID.
        db: Database session.

    Returns:
        Purpose details.

    Raises:
        HTTPException 404: If purpose not found.
    """
    purpose = db.query(Purpose).filter(Purpose.uuid == uuid).first()
    if not purpose:
        raise HTTPException(status_code=404, detail=ErrorMessages.PURPOSE_NOT_FOUND)
    return purpose
