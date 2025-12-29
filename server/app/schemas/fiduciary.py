"""
Data Fiduciary Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class DataFiduciaryCreate(BaseModel):
    """Schema for creating a data fiduciary (API key only)"""
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    privacy_policy_url: Optional[str] = None
    contact_email: EmailStr


class FiduciaryRegister(BaseModel):
    """Schema for fiduciary registration (with password)"""
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    privacy_policy_url: Optional[str] = None
    contact_email: EmailStr
    password: str = Field(..., min_length=8)


class DataFiduciaryResponse(BaseModel):
    """Schema for fiduciary response (public info)"""
    id: int
    uuid: str
    name: str
    description: Optional[str]
    privacy_policy_url: Optional[str]
    contact_email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DataFiduciaryWithKey(DataFiduciaryResponse):
    """Schema for fiduciary response with full API key (only for key generation/regeneration)"""
    api_key: str


class DataFiduciaryWithMaskedKey(DataFiduciaryResponse):
    """Schema for fiduciary response with masked API key (for /me endpoint)"""
    api_key_prefix: str  # First 8 characters
    api_key_suffix: str  # Last 4 characters
    api_key_hint: str    # Display format: "es_abc1****xyz9"


class AuthResponse(BaseModel):
    """Unified auth response for user and fiduciary"""
    access_token: str
    token_type: str = "bearer"
    role: str  # "user" or "fiduciary"
    name: str
    email: str


class FiduciaryDashboardStats(BaseModel):
    """Schema for fiduciary dashboard statistics"""
    total_purposes: int
    active_purposes: int
    total_consents: int
    active_consents: int
    expiring_consents: int
    expired_consents: int
    revoked_consents: int
    unique_users: int
    recent_consents: List[dict]
