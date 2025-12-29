"""
Purpose Model - DPDP Section 6 & GDPR Article 5 (Purpose Limitation)
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Purpose(Base):
    """
    Purpose - DPDP Section 6 & GDPR Article 5 (Purpose Limitation)
    Defines the specific purpose for which data is collected and processed.
    """
    __tablename__ = "purposes"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    fiduciary_id = Column(Integer, ForeignKey("data_fiduciaries.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    data_categories = Column(Text, nullable=False)  # JSON array of data types
    retention_period_days = Column(Integer, nullable=False)  # DPDP Section 8(7)
    legal_basis = Column(String(100), nullable=False)  # GDPR Article 6 basis
    is_mandatory = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    fiduciary = relationship("DataFiduciary", back_populates="purposes")
    consents = relationship("Consent", back_populates="purpose")
