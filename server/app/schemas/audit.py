"""
Audit Log Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class AuditActionEnum(str, Enum):
    """Audit action types"""
    consent_granted = "consent_granted"
    consent_revoked = "consent_revoked"
    consent_updated = "consent_updated"
    purpose_created = "purpose_created"
    user_registered = "user_registered"
    data_accessed = "data_accessed"
    receipt_generated = "receipt_generated"


class AuditLogResponse(BaseModel):
    """Schema for audit log response"""
    id: int
    uuid: str
    user_id: Optional[int]
    fiduciary_id: Optional[int]
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogFilter(BaseModel):
    """Schema for filtering audit logs"""
    user_id: Optional[int] = None
    fiduciary_id: Optional[int] = None
    action: Optional[AuditActionEnum] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)


class DashboardStats(BaseModel):
    """Schema for user dashboard statistics"""
    total_users: int
    total_consents: int
    active_consents: int
    revoked_consents: int
    total_purposes: int
    recent_activity: List[dict]
