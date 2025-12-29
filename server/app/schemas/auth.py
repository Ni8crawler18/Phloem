"""
Auth Schemas - Email verification and password reset
"""
from pydantic import BaseModel, EmailStr, Field


class VerifyEmailRequest(BaseModel):
    """Schema for email verification"""
    token: str


class ResendVerificationRequest(BaseModel):
    """Schema for resending verification email"""
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    """Schema for requesting password reset"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for resetting password with token"""
    token: str
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str


class VerificationStatusResponse(BaseModel):
    """Response showing verification status"""
    email_verified: bool
    message: str
