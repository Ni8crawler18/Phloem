"""
Audit Log Model & Enums - DPDP Section 8 & GDPR Article 30
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class ConsentStatus(enum.Enum):
    """Consent status enum"""
    GRANTED = "granted"
    REVOKED = "revoked"
    EXPIRED = "expired"


class AuditAction(enum.Enum):
    """Audit action types"""
    CONSENT_GRANTED = "consent_granted"
    CONSENT_REVOKED = "consent_revoked"
    CONSENT_RENEWED = "consent_renewed"
    CONSENT_EXPIRED = "consent_expired"
    CONSENT_UPDATED = "consent_updated"
    PURPOSE_CREATED = "purpose_created"
    USER_REGISTERED = "user_registered"
    DATA_ACCESSED = "data_accessed"
    RECEIPT_GENERATED = "receipt_generated"


class AuditLog(Base):
    """
    Audit Log - DPDP Section 8 & GDPR Article 30 (Records of Processing)
    Immutable log of all consent-related actions.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    fiduciary_id = Column(Integer, ForeignKey("data_fiduciaries.id"), nullable=True)
    action = Column(SQLEnum(AuditAction), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=True)
    details = Column(Text, nullable=True)  # JSON with action details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="audit_logs")
