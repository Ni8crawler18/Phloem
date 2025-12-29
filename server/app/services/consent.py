"""
Consent Service
Business logic for consent management
"""
import json
import hashlib
from sqlalchemy.orm import Session

from app.models import Consent, ConsentReceipt, User, Purpose, DataFiduciary


def generate_consent_receipt(
    db: Session,
    consent: Consent,
    user: User,
    purpose: Purpose,
    fiduciary: DataFiduciary
) -> ConsentReceipt:
    """
    Generate a consent receipt with SHA-256 signature.
    DPDP Section 6(3) Transparency Requirement.
    """
    receipt_data = {
        "consent_uuid": consent.uuid,
        "user": {
            "name": user.name,
            "email": user.email
        },
        "fiduciary": {
            "name": fiduciary.name,
            "contact": fiduciary.contact_email
        },
        "purpose": {
            "name": purpose.name,
            "description": purpose.description,
            "data_categories": json.loads(purpose.data_categories),
            "legal_basis": purpose.legal_basis,
            "retention_days": purpose.retention_period_days
        },
        "granted_at": consent.granted_at.isoformat(),
        "expires_at": consent.expires_at.isoformat() if consent.expires_at else None,
        "version": consent.consent_version
    }

    # Create SHA-256 signature
    signature = hashlib.sha256(
        json.dumps(receipt_data, sort_keys=True).encode()
    ).hexdigest()

    receipt = ConsentReceipt(
        consent_id=consent.id,
        receipt_data=json.dumps(receipt_data),
        signature=signature
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt


def check_consent_exists(
    db: Session,
    user_id: int,
    purpose_id: int
) -> bool:
    """
    Check if an active consent exists for user and purpose.
    """
    from app.models.audit import ConsentStatus

    existing = db.query(Consent).filter(
        Consent.user_id == user_id,
        Consent.purpose_id == purpose_id,
        Consent.status == ConsentStatus.GRANTED
    ).first()
    return existing is not None
