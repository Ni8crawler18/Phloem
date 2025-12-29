"""
Purpose Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


class PurposeCreate(BaseModel):
    """Schema for creating a purpose"""
    name: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=10)
    data_categories: List[str] = Field(..., min_length=1)
    retention_period_days: int = Field(..., ge=1, le=3650)
    legal_basis: str = Field(..., description="GDPR Article 6 legal basis")
    is_mandatory: bool = False


class PurposeResponse(BaseModel):
    """Schema for purpose response"""
    id: int
    uuid: str
    fiduciary_id: int
    name: str
    description: str
    data_categories: str  # JSON string
    retention_period_days: int
    legal_basis: str
    is_mandatory: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
