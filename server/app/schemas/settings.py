"""
Settings Schemas
Profile updates and account management
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class PasswordConfirmation(BaseModel):
    """Schema for password confirmation (security check)"""
    current_password: str = Field(..., min_length=1)


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class UserPasswordChange(BaseModel):
    """Schema for changing user password"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


class FiduciaryProfileUpdate(BaseModel):
    """Schema for updating fiduciary profile"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    privacy_policy_url: Optional[str] = Field(None, max_length=500)


class FiduciaryPasswordChange(BaseModel):
    """Schema for changing fiduciary password"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


class AccountDeleteRequest(BaseModel):
    """Schema for account deletion request"""
    password: str = Field(..., min_length=1, description="Current password for verification")
    confirmation: str = Field(..., description="Must be 'DELETE' to confirm")


class AccountDeleteResponse(BaseModel):
    """Schema for account deletion response"""
    message: str
    deleted_consents: int
    deleted_audit_logs: int
