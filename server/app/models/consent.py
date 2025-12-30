"""
Consent Models - Core of DPDP & GDPR Compliance
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base
from app.models.audit import ConsentStatus


class Consent(Base):
    """
    Consent Record - Core of DPDP & GDPR Compliance
    Tracks user consent for specific purposes.
    """
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    fiduciary_id = Column(Integer, ForeignKey("data_fiduciaries.id"), nullable=False, index=True)
    purpose_id = Column(Integer, ForeignKey("purposes.id"), nullable=False, index=True)
    status = Column(SQLEnum(ConsentStatus), default=ConsentStatus.GRANTED, index=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    consent_version = Column(String(20), default="1.0")
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="consents")
    fiduciary = relationship("DataFiduciary", back_populates="consents")
    purpose = relationship("Purpose", back_populates="consents")
    receipt = relationship("ConsentReceipt", back_populates="consent", uselist=False)


class ConsentReceipt(Base):
    """
    Consent Receipt - DPDP Section 6(3) Transparency Requirement
    Provides proof of consent with signature.
    """
    __tablename__ = "consent_receipts"

    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    consent_id = Column(Integer, ForeignKey("consents.id"), nullable=False)
    receipt_data = Column(Text, nullable=False)  # JSON with full consent details
    signature = Column(String(500), nullable=True)  # Digital signature
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    consent = relationship("Consent", back_populates="receipt")
