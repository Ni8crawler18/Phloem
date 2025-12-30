"""
Data Fiduciary Model - Organization/Data Controller (DPDP/GDPR)
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class DataFiduciary(Base):
    """
    Data Fiduciary (Organization/Data Controller under DPDP/GDPR)
    """
    __tablename__ = "data_fiduciaries"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    privacy_policy_url = Column(String(500), nullable=True)
    contact_email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    api_key = Column(String(64), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Email verification
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String(100), nullable=True)
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)

    # Password reset
    reset_token = Column(String(100), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    purposes = relationship("Purpose", back_populates="fiduciary")
    consents = relationship("Consent", back_populates="fiduciary")
    webhooks = relationship("Webhook", back_populates="fiduciary", cascade="all, delete-orphan")
