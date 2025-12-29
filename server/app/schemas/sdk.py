"""
SDK Integration Schemas
"""
from pydantic import BaseModel
from typing import Optional, List


class SDKConsentRequest(BaseModel):
    """Schema for SDK consent request"""
    user_email: str
    purpose_uuids: List[str]


class SDKConsentStatusRequest(BaseModel):
    """Schema for SDK consent status check"""
    user_email: str
    purpose_uuid: Optional[str] = None


class SDKConsentStatusResponse(BaseModel):
    """Schema for SDK consent status response"""
    user_email: str
    consents: List[dict]
