"""
Pydantic Schemas
"""
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.schemas.fiduciary import (
    DataFiduciaryCreate,
    DataFiduciaryResponse,
    DataFiduciaryWithKey,
    DataFiduciaryWithMaskedKey,
    FiduciaryRegister,
    AuthResponse,
    FiduciaryDashboardStats,
)
from app.schemas.purpose import PurposeCreate, PurposeResponse
from app.schemas.consent import (
    ConsentGrantRequest,
    ConsentRevokeRequest,
    ConsentResponse,
    ConsentDetailResponse,
    ConsentReceiptResponse,
)
from app.schemas.audit import AuditLogResponse, AuditLogFilter, DashboardStats
from app.schemas.sdk import SDKConsentRequest, SDKConsentStatusRequest, SDKConsentStatusResponse

__all__ = [
    # User
    "UserCreate", "UserLogin", "UserResponse", "Token",
    # Fiduciary
    "DataFiduciaryCreate", "DataFiduciaryResponse", "DataFiduciaryWithKey",
    "DataFiduciaryWithMaskedKey", "FiduciaryRegister", "AuthResponse", "FiduciaryDashboardStats",
    # Purpose
    "PurposeCreate", "PurposeResponse",
    # Consent
    "ConsentGrantRequest", "ConsentRevokeRequest", "ConsentResponse",
    "ConsentDetailResponse", "ConsentReceiptResponse",
    # Audit
    "AuditLogResponse", "AuditLogFilter", "DashboardStats",
    # SDK
    "SDKConsentRequest", "SDKConsentStatusRequest", "SDKConsentStatusResponse",
]
