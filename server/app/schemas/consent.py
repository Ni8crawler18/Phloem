"""
Consent Schemas
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

from app.schemas.purpose import PurposeResponse
from app.schemas.fiduciary import DataFiduciaryResponse


class ConsentGrantRequest(BaseModel):
    """Schema for granting consent"""
    purpose_id: int
    fiduciary_uuid: str


class ConsentRevokeRequest(BaseModel):
    """Schema for revoking consent"""
    consent_uuid: str
    reason: Optional[str] = None


class ConsentResponse(BaseModel):
    """Schema for consent response"""
    id: int
    uuid: str
    user_id: int
    fiduciary_id: int
    purpose_id: int
    status: str
    granted_at: datetime
    revoked_at: Optional[datetime]
    expires_at: Optional[datetime]
    consent_version: str

    class Config:
        from_attributes = True


class ConsentDetailResponse(BaseModel):
    """Schema for consent with full details"""
    consent: ConsentResponse
    purpose: PurposeResponse
    fiduciary: DataFiduciaryResponse


class ConsentReceiptResponse(BaseModel):
    """Schema for consent receipt"""
    receipt_id: str
    consent_uuid: str
    user_name: str
    user_email: str
    fiduciary_name: str
    purpose_name: str
    purpose_description: str
    data_categories: List[str]
    legal_basis: str
    retention_period_days: int
    granted_at: datetime
    expires_at: Optional[datetime]
    status: str
    signature: Optional[str]
