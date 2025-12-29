"""
Purposes Router
Purpose management endpoints (API key authenticated)
"""
import json
from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
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
    """Create a new purpose for consent collection (requires API key)"""
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
    db.commit()
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
    """List all purposes, optionally filtered by fiduciary"""
    query = db.query(Purpose).filter(Purpose.is_active == True)

    if fiduciary_uuid:
        fiduciary = db.query(DataFiduciary).filter(
            DataFiduciary.uuid == fiduciary_uuid
        ).first()
        if fiduciary:
            query = query.filter(Purpose.fiduciary_id == fiduciary.id)

    return query.all()


@router.get("/{uuid}", response_model=PurposeResponse)
def get_purpose(uuid: str, db: Session = Depends(get_db)):
    """Get purpose details by UUID"""
    from fastapi import HTTPException

    purpose = db.query(Purpose).filter(Purpose.uuid == uuid).first()
    if not purpose:
        raise HTTPException(status_code=404, detail="Purpose not found")
    return purpose
