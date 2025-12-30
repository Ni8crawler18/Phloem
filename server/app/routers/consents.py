"""
Consents Router
Consent grant, revoke, and management endpoints.

This module handles all consent lifecycle operations including:
- Granting new consents (DPDP Section 6)
- Revoking existing consents (DPDP Section 6(6))
- Listing user consents
- Generating consent receipts (DPDP Section 6(3))

All operations are logged for audit compliance.
"""
import json
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
import io

from app.database import get_db, safe_commit
from app.constants import ErrorMessages
from app.models import (
    User, DataFiduciary, Purpose, Consent, ConsentReceipt,
    ConsentStatus, AuditAction
)
from app.schemas import (
    ConsentGrantRequest, ConsentRevokeRequest, ConsentRenewRequest,
    ConsentResponse, ConsentDetailResponse, ConsentReceiptResponse,
    PurposeResponse, DataFiduciaryResponse
)
from app.services.consent import generate_consent_receipt
from app.services.audit import create_audit_log
from app.services.webhook import trigger_consent_webhooks
from app.services.pdf import generate_consent_receipt_pdf
from app.services.expiry import (
    check_and_update_expired_consent,
    get_user_expiring_consents,
    renew_consent as renew_consent_service,
    get_days_until_expiry,
    EXPIRING_SOON_DAYS
)
from app.services.export import get_user_export_data, export_to_json, export_to_csv
from app.dependencies.auth import get_current_user
from app.models.webhook import WebhookEvent

router = APIRouter(prefix="/api/consents", tags=["Consents"])

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@router.post("/grant", response_model=ConsentReceiptResponse)
@limiter.limit("30/minute")
def grant_consent(
    data: ConsentGrantRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Grant consent for a specific purpose (DPDP Section 6)"""
    # Get fiduciary
    fiduciary = db.query(DataFiduciary).filter(
        DataFiduciary.uuid == data.fiduciary_uuid
    ).first()
    if not fiduciary:
        raise HTTPException(status_code=404, detail="Fiduciary not found")

    # Get purpose
    purpose = db.query(Purpose).filter(
        Purpose.id == data.purpose_id,
        Purpose.fiduciary_id == fiduciary.id
    ).first()
    if not purpose:
        raise HTTPException(status_code=404, detail="Purpose not found")

    # Check for existing active consent
    existing = db.query(Consent).filter(
        Consent.user_id == current_user.id,
        Consent.purpose_id == purpose.id,
        Consent.status == ConsentStatus.GRANTED
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Consent already granted for this purpose"
        )

    # Create consent
    consent = Consent(
        user_id=current_user.id,
        fiduciary_id=fiduciary.id,
        purpose_id=purpose.id,
        status=ConsentStatus.GRANTED,
        expires_at=datetime.utcnow() + timedelta(days=purpose.retention_period_days),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    db.add(consent)
    safe_commit(db, "grant consent")
    db.refresh(consent)

    # Generate receipt
    receipt = generate_consent_receipt(db, consent, current_user, purpose, fiduciary)

    # Audit log
    create_audit_log(
        db, AuditAction.CONSENT_GRANTED, "consent", consent.uuid,
        user_id=current_user.id, fiduciary_id=fiduciary.id,
        details={"purpose": purpose.name},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    # Trigger webhooks
    trigger_consent_webhooks(
        db=db,
        fiduciary_id=fiduciary.id,
        event_type=WebhookEvent.CONSENT_GRANTED.value,
        consent_data={
            "consent_uuid": consent.uuid,
            "user_email": current_user.email,
            "purpose_id": purpose.id,
            "purpose_name": purpose.name,
            "granted_at": consent.granted_at.isoformat(),
            "expires_at": consent.expires_at.isoformat() if consent.expires_at else None
        }
    )

    return ConsentReceiptResponse(
        receipt_id=receipt.receipt_id,
        consent_uuid=consent.uuid,
        user_name=current_user.name,
        user_email=current_user.email,
        fiduciary_name=fiduciary.name,
        purpose_name=purpose.name,
        purpose_description=purpose.description,
        data_categories=json.loads(purpose.data_categories),
        legal_basis=purpose.legal_basis,
        retention_period_days=purpose.retention_period_days,
        granted_at=consent.granted_at,
        expires_at=consent.expires_at,
        status="granted",
        signature=receipt.signature
    )


@router.post("/revoke", response_model=ConsentResponse)
@limiter.limit("30/minute")
def revoke_consent(
    data: ConsentRevokeRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke consent (DPDP Section 6(6) - Right to Withdraw)"""
    consent = db.query(Consent).filter(
        Consent.uuid == data.consent_uuid,
        Consent.user_id == current_user.id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    if consent.status == ConsentStatus.REVOKED:
        raise HTTPException(status_code=400, detail="Consent already revoked")

    consent.status = ConsentStatus.REVOKED
    consent.revoked_at = datetime.utcnow()
    safe_commit(db, "revoke consent")
    db.refresh(consent)

    create_audit_log(
        db, AuditAction.CONSENT_REVOKED, "consent", consent.uuid,
        user_id=current_user.id, fiduciary_id=consent.fiduciary_id,
        details={"reason": data.reason},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    # Trigger webhooks
    purpose = db.query(Purpose).filter(Purpose.id == consent.purpose_id).first()
    trigger_consent_webhooks(
        db=db,
        fiduciary_id=consent.fiduciary_id,
        event_type=WebhookEvent.CONSENT_REVOKED.value,
        consent_data={
            "consent_uuid": consent.uuid,
            "user_email": current_user.email,
            "purpose_id": consent.purpose_id,
            "purpose_name": purpose.name if purpose else None,
            "revoked_at": consent.revoked_at.isoformat(),
            "reason": data.reason
        }
    )

    return consent


@router.get("", response_model=List[ConsentDetailResponse])
@limiter.limit("60/minute")
def list_my_consents(
    request: Request,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all consents for current user"""
    query = db.query(Consent).filter(Consent.user_id == current_user.id)

    if status:
        query = query.filter(Consent.status == ConsentStatus(status))

    consents = query.order_by(Consent.granted_at.desc()).all()

    # Check and update expired consents on-demand
    for c in consents:
        check_and_update_expired_consent(db, c)

    result = []
    for c in consents:
        purpose = db.query(Purpose).filter(Purpose.id == c.purpose_id).first()
        fiduciary = db.query(DataFiduciary).filter(
            DataFiduciary.id == c.fiduciary_id
        ).first()
        result.append(ConsentDetailResponse(
            consent=ConsentResponse.model_validate(c),
            purpose=PurposeResponse.model_validate(purpose),
            fiduciary=DataFiduciaryResponse.model_validate(fiduciary)
        ))

    return result


@router.get("/{uuid}/receipt", response_model=ConsentReceiptResponse)
@limiter.limit("60/minute")
def get_consent_receipt(
    request: Request,
    uuid: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get consent receipt (DPDP Section 6(3) Transparency)"""
    consent = db.query(Consent).filter(
        Consent.uuid == uuid,
        Consent.user_id == current_user.id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    receipt = db.query(ConsentReceipt).filter(
        ConsentReceipt.consent_id == consent.id
    ).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")

    purpose = db.query(Purpose).filter(Purpose.id == consent.purpose_id).first()
    fiduciary = db.query(DataFiduciary).filter(
        DataFiduciary.id == consent.fiduciary_id
    ).first()

    return ConsentReceiptResponse(
        receipt_id=receipt.receipt_id,
        consent_uuid=consent.uuid,
        user_name=current_user.name,
        user_email=current_user.email,
        fiduciary_name=fiduciary.name,
        purpose_name=purpose.name,
        purpose_description=purpose.description,
        data_categories=json.loads(purpose.data_categories),
        legal_basis=purpose.legal_basis,
        retention_period_days=purpose.retention_period_days,
        granted_at=consent.granted_at,
        expires_at=consent.expires_at,
        status=consent.status.value,
        signature=receipt.signature
    )


@router.get("/{uuid}/receipt/pdf")
@limiter.limit("20/minute")
def download_consent_receipt_pdf(
    request: Request,
    uuid: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download consent receipt as PDF document.

    Generates a legally compliant PDF receipt containing:
    - Consent details and timestamps
    - Data principal information
    - Data fiduciary information
    - Purpose and data categories
    - HMAC cryptographic signature

    Args:
        uuid: Consent UUID to generate receipt for.
        current_user: Authenticated user (must own the consent).
        db: Database session.

    Returns:
        StreamingResponse with PDF file attachment.

    Raises:
        HTTPException 404: If consent or receipt not found.
    """
    # Fetch consent with ownership verification
    consent = db.query(Consent).filter(
        Consent.uuid == uuid,
        Consent.user_id == current_user.id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail=ErrorMessages.CONSENT_NOT_FOUND)

    # Fetch related receipt
    receipt = db.query(ConsentReceipt).filter(
        ConsentReceipt.consent_id == consent.id
    ).first()
    if not receipt:
        raise HTTPException(status_code=404, detail=ErrorMessages.not_found("Receipt"))

    # Fetch related entities
    purpose = db.query(Purpose).filter(Purpose.id == consent.purpose_id).first()
    fiduciary = db.query(DataFiduciary).filter(
        DataFiduciary.id == consent.fiduciary_id
    ).first()

    # Generate PDF using service
    pdf_buffer = generate_consent_receipt_pdf(
        receipt_id=receipt.receipt_id,
        consent_uuid=consent.uuid,
        status=consent.status.value,
        granted_at=consent.granted_at,
        expires_at=consent.expires_at,
        user_name=current_user.name,
        user_email=current_user.email,
        fiduciary_name=fiduciary.name,
        fiduciary_email=fiduciary.contact_email,
        purpose_name=purpose.name,
        purpose_description=purpose.description,
        legal_basis=purpose.legal_basis,
        data_categories=json.loads(purpose.data_categories),
        retention_days=purpose.retention_period_days,
        signature=receipt.signature
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=consent-receipt-{consent.uuid}.pdf"
        }
    )


@router.get("/expiring/list", response_model=List[ConsentDetailResponse])
@limiter.limit("60/minute")
def list_expiring_consents(
    request: Request,
    days: int = EXPIRING_SOON_DAYS,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List consents expiring within X days (default 14 days)"""
    expiring = get_user_expiring_consents(db, current_user.id, days)

    result = []
    for c in expiring:
        purpose = db.query(Purpose).filter(Purpose.id == c.purpose_id).first()
        fiduciary = db.query(DataFiduciary).filter(
            DataFiduciary.id == c.fiduciary_id
        ).first()
        result.append(ConsentDetailResponse(
            consent=ConsentResponse.model_validate(c),
            purpose=PurposeResponse.model_validate(purpose),
            fiduciary=DataFiduciaryResponse.model_validate(fiduciary)
        ))

    return result


@router.post("/renew", response_model=ConsentReceiptResponse)
@limiter.limit("30/minute")
def renew_consent(
    data: ConsentRenewRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Renew an expiring or expired consent (DPDP Section 6(7))"""
    consent = db.query(Consent).filter(
        Consent.uuid == data.consent_uuid,
        Consent.user_id == current_user.id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")

    if consent.status == ConsentStatus.REVOKED:
        raise HTTPException(
            status_code=400,
            detail="Cannot renew a revoked consent. Please grant a new consent."
        )

    purpose = db.query(Purpose).filter(Purpose.id == consent.purpose_id).first()
    if not purpose:
        raise HTTPException(status_code=404, detail="Purpose not found")

    fiduciary = db.query(DataFiduciary).filter(
        DataFiduciary.id == consent.fiduciary_id
    ).first()

    # Renew the consent
    consent = renew_consent_service(db, consent, purpose)

    # Generate new receipt
    receipt = generate_consent_receipt(db, consent, current_user, purpose, fiduciary)

    # Audit log
    create_audit_log(
        db, AuditAction.CONSENT_RENEWED, "consent", consent.uuid,
        user_id=current_user.id, fiduciary_id=fiduciary.id,
        details={
            "purpose": purpose.name,
            "new_expires_at": consent.expires_at.isoformat()
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    return ConsentReceiptResponse(
        receipt_id=receipt.receipt_id,
        consent_uuid=consent.uuid,
        user_name=current_user.name,
        user_email=current_user.email,
        fiduciary_name=fiduciary.name,
        purpose_name=purpose.name,
        purpose_description=purpose.description,
        data_categories=json.loads(purpose.data_categories),
        legal_basis=purpose.legal_basis,
        retention_period_days=purpose.retention_period_days,
        granted_at=consent.granted_at,
        expires_at=consent.expires_at,
        status="granted",
        signature=receipt.signature
    )


@router.get("/export/json")
@limiter.limit("5/minute")
def export_data_json(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all user data as JSON (GDPR Article 20 - Right to Portability)
    """
    data = get_user_export_data(db, current_user)
    json_content = export_to_json(data)

    # Audit log
    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "export", current_user.uuid,
        user_id=current_user.id,
        details={"format": "json", "consents_count": len(data["consents"])},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    return StreamingResponse(
        io.BytesIO(json_content.encode('utf-8')),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=eigensparse-export-{current_user.uuid}.json"
        }
    )


@router.get("/export/csv")
@limiter.limit("5/minute")
def export_data_csv(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export consent data as CSV (GDPR Article 20 - Right to Portability)
    """
    data = get_user_export_data(db, current_user)
    csv_content = export_to_csv(data)

    # Audit log
    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "export", current_user.uuid,
        user_id=current_user.id,
        details={"format": "csv", "consents_count": len(data["consents"])},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    return StreamingResponse(
        io.BytesIO(csv_content.encode('utf-8')),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=eigensparse-consents-{current_user.uuid}.csv"
        }
    )
