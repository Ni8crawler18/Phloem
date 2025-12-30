"""
Consent Expiry Service - Handle consent expiration and renewal
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Consent, ConsentStatus, Purpose

# Days before expiry to consider "expiring soon"
EXPIRING_SOON_DAYS = 14


def is_consent_expired(consent: Consent) -> bool:
    """Check if a consent has expired"""
    if consent.status == ConsentStatus.REVOKED:
        return False
    if consent.expires_at is None:
        return False
    return datetime.now(timezone.utc) > consent.expires_at


def is_consent_expiring_soon(consent: Consent, days: int = EXPIRING_SOON_DAYS) -> bool:
    """Check if a consent is expiring within X days"""
    if consent.status != ConsentStatus.GRANTED:
        return False
    if consent.expires_at is None:
        return False
    now = datetime.now(timezone.utc)
    expiry_threshold = now + timedelta(days=days)
    return consent.expires_at <= expiry_threshold and consent.expires_at > now


def get_days_until_expiry(consent: Consent) -> Optional[int]:
    """Get the number of days until consent expires"""
    if consent.expires_at is None:
        return None
    delta = consent.expires_at - datetime.now(timezone.utc)
    return max(0, delta.days)


def check_and_update_expired_consent(db: Session, consent: Consent) -> bool:
    """
    Check if consent has expired and update status if needed.
    Returns True if consent was marked as expired.
    """
    if consent.status == ConsentStatus.GRANTED and is_consent_expired(consent):
        consent.status = ConsentStatus.EXPIRED
        db.commit()
        return True
    return False


def get_user_expiring_consents(
    db: Session,
    user_id: int,
    days: int = EXPIRING_SOON_DAYS
) -> List[Consent]:
    """Get all consents expiring soon for a user"""
    now = datetime.now(timezone.utc)
    expiry_threshold = now + timedelta(days=days)

    return db.query(Consent).filter(
        Consent.user_id == user_id,
        Consent.status == ConsentStatus.GRANTED,
        Consent.expires_at != None,
        Consent.expires_at <= expiry_threshold,
        Consent.expires_at > now
    ).all()


def get_user_expired_consents(db: Session, user_id: int) -> List[Consent]:
    """Get all expired consents for a user"""
    return db.query(Consent).filter(
        Consent.user_id == user_id,
        Consent.status == ConsentStatus.EXPIRED
    ).all()


def get_fiduciary_expiring_consents(
    db: Session,
    fiduciary_id: int,
    days: int = EXPIRING_SOON_DAYS
) -> List[Consent]:
    """Get all consents expiring soon for a fiduciary"""
    now = datetime.now(timezone.utc)
    expiry_threshold = now + timedelta(days=days)

    return db.query(Consent).filter(
        Consent.fiduciary_id == fiduciary_id,
        Consent.status == ConsentStatus.GRANTED,
        Consent.expires_at != None,
        Consent.expires_at <= expiry_threshold,
        Consent.expires_at > now
    ).all()


def renew_consent(db: Session, consent: Consent, purpose: Purpose) -> Consent:
    """
    Renew a consent by extending its expiry date.
    Uses the purpose's retention period.
    """
    # Reset status if expired
    if consent.status == ConsentStatus.EXPIRED:
        consent.status = ConsentStatus.GRANTED

    # Extend expiry from now (not from previous expiry)
    consent.expires_at = datetime.now(timezone.utc) + timedelta(days=purpose.retention_period_days)

    db.commit()
    db.refresh(consent)
    return consent
