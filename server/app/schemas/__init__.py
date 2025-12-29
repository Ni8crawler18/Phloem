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
    ConsentRenewRequest,
    ConsentResponse,
    ConsentDetailResponse,
    ConsentReceiptResponse,
)
from app.schemas.audit import AuditLogResponse, AuditLogFilter, DashboardStats
from app.schemas.sdk import SDKConsentRequest, SDKConsentStatusRequest, SDKConsentStatusResponse
from app.schemas.webhook import (
    WebhookCreate,
    WebhookUpdate,
    WebhookResponse,
    WebhookWithSecret,
    WebhookDeliveryResponse,
    WebhookTestRequest,
    WebhookTestResponse,
    WebhookPayload,
)
from app.schemas.settings import (
    PasswordConfirmation,
    UserProfileUpdate,
    UserPasswordChange,
    FiduciaryProfileUpdate,
    FiduciaryPasswordChange,
    AccountDeleteRequest,
    AccountDeleteResponse,
)

__all__ = [
    # User
    "UserCreate", "UserLogin", "UserResponse", "Token",
    # Fiduciary
    "DataFiduciaryCreate", "DataFiduciaryResponse", "DataFiduciaryWithKey",
    "DataFiduciaryWithMaskedKey", "FiduciaryRegister", "AuthResponse", "FiduciaryDashboardStats",
    # Purpose
    "PurposeCreate", "PurposeResponse",
    # Consent
    "ConsentGrantRequest", "ConsentRevokeRequest", "ConsentRenewRequest",
    "ConsentResponse", "ConsentDetailResponse", "ConsentReceiptResponse",
    # Audit
    "AuditLogResponse", "AuditLogFilter", "DashboardStats",
    # SDK
    "SDKConsentRequest", "SDKConsentStatusRequest", "SDKConsentStatusResponse",
    # Webhook
    "WebhookCreate", "WebhookUpdate", "WebhookResponse", "WebhookWithSecret",
    "WebhookDeliveryResponse", "WebhookTestRequest", "WebhookTestResponse", "WebhookPayload",
    # Settings
    "PasswordConfirmation", "UserProfileUpdate", "UserPasswordChange",
    "FiduciaryProfileUpdate", "FiduciaryPasswordChange",
    "AccountDeleteRequest", "AccountDeleteResponse",
]
