"""
SDK Integration Router
Endpoints for SDK consent verification
"""
import json
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DataFiduciary, User, Purpose, Consent, ConsentStatus
from app.schemas import SDKConsentStatusRequest
from app.dependencies.auth import get_fiduciary_by_api_key

router = APIRouter(prefix="/api/sdk", tags=["SDK Integration"])


@router.post("/check-consent")
def sdk_check_consent(
    data: SDKConsentStatusRequest,
    fiduciary: DataFiduciary = Depends(get_fiduciary_by_api_key),
    db: Session = Depends(get_db)
):
    """Check consent status for a user (SDK endpoint)"""
    user = db.query(User).filter(User.email == data.user_email).first()
    if not user:
        return {"has_consent": False, "consents": []}

    query = db.query(Consent).filter(
        Consent.user_id == user.id,
        Consent.fiduciary_id == fiduciary.id,
        Consent.status == ConsentStatus.GRANTED
    )

    if data.purpose_uuid:
        purpose = db.query(Purpose).filter(
            Purpose.uuid == data.purpose_uuid
        ).first()
        if purpose:
            query = query.filter(Consent.purpose_id == purpose.id)

    consents = query.all()

    result = []
    for c in consents:
        purpose = db.query(Purpose).filter(Purpose.id == c.purpose_id).first()
        result.append({
            "consent_uuid": c.uuid,
            "purpose_uuid": purpose.uuid,
            "purpose_name": purpose.name,
            "granted_at": c.granted_at.isoformat(),
            "expires_at": c.expires_at.isoformat() if c.expires_at else None
        })

    return {
        "has_consent": len(result) > 0,
        "consents": result
    }


@router.get("/purposes")
def sdk_get_purposes(
    fiduciary: DataFiduciary = Depends(get_fiduciary_by_api_key),
    db: Session = Depends(get_db)
):
    """Get all purposes for SDK integration"""
    purposes = db.query(Purpose).filter(
        Purpose.fiduciary_id == fiduciary.id,
        Purpose.is_active == True
    ).all()

    return [{
        "uuid": p.uuid,
        "name": p.name,
        "description": p.description,
        "data_categories": json.loads(p.data_categories),
        "legal_basis": p.legal_basis,
        "is_mandatory": p.is_mandatory
    } for p in purposes]
