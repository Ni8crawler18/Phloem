"""
Webhook Model - Real-time notifications for consent events
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class WebhookEvent(str, enum.Enum):
    """Supported webhook event types"""
    CONSENT_GRANTED = "consent.granted"
    CONSENT_REVOKED = "consent.revoked"
    CONSENT_EXPIRED = "consent.expired"
    ALL = "all"


class WebhookStatus(str, enum.Enum):
    """Webhook delivery status"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    RETRYING = "retrying"


class Webhook(Base):
    """
    Webhook Configuration - Fiduciary notification endpoints
    """
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    fiduciary_id = Column(Integer, ForeignKey("data_fiduciaries.id"), nullable=False)

    # Webhook configuration
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    secret = Column(String(64), nullable=False)  # For HMAC signature verification
    events = Column(Text, nullable=False)  # JSON array of WebhookEvent values

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    fiduciary = relationship("DataFiduciary", back_populates="webhooks")
    deliveries = relationship("WebhookDelivery", back_populates="webhook", cascade="all, delete-orphan")


class WebhookDelivery(Base):
    """
    Webhook Delivery Log - Track delivery attempts
    """
    __tablename__ = "webhook_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    webhook_id = Column(Integer, ForeignKey("webhooks.id"), nullable=False)

    # Event details
    event_type = Column(String(50), nullable=False)
    payload = Column(Text, nullable=False)  # JSON payload sent

    # Delivery status
    status = Column(SQLEnum(WebhookStatus), default=WebhookStatus.PENDING)
    response_code = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    # Retry tracking
    attempt_count = Column(Integer, default=0)
    next_retry_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    webhook = relationship("Webhook", back_populates="deliveries")
