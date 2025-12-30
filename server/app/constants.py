"""
Application Constants
Centralized configuration values for the Eigensparse Consent Management System.

This module contains all magic numbers, limits, and configuration constants
to ensure consistency across the application and easy modification.
"""

# =============================================================================
# PAGINATION DEFAULTS
# =============================================================================

DEFAULT_PAGE_LIMIT = 100
"""Default number of items per page for list endpoints."""

DEFAULT_PAGE_OFFSET = 0
"""Default starting offset for pagination."""

DASHBOARD_RECENT_LIMIT = 10
"""Number of recent items to show on dashboard."""

WEBHOOK_DELIVERY_LIMIT = 50
"""Default limit for webhook delivery logs."""

MAX_PAGE_LIMIT = 500
"""Maximum allowed page limit to prevent excessive queries."""


# =============================================================================
# RATE LIMITS
# =============================================================================

RATE_LIMIT_AUTH = "10/minute"
"""Rate limit for authentication endpoints (login)."""

RATE_LIMIT_REGISTER = "5/minute"
"""Rate limit for registration endpoints."""

RATE_LIMIT_SDK = "100/minute"
"""Rate limit for SDK API endpoints."""

RATE_LIMIT_WEBHOOK_CREATE = "10/minute"
"""Rate limit for webhook creation."""

RATE_LIMIT_WEBHOOK_TEST = "5/minute"
"""Rate limit for webhook testing."""


# =============================================================================
# RESOURCE LIMITS
# =============================================================================

MAX_WEBHOOKS_PER_FIDUCIARY = 10
"""Maximum number of webhooks a fiduciary can create."""

MAX_PURPOSES_PER_FIDUCIARY = 50
"""Maximum number of purposes a fiduciary can create."""

MIN_NAME_LENGTH = 3
"""Minimum length for name fields."""

MAX_NAME_LENGTH = 255
"""Maximum length for name fields."""


# =============================================================================
# WEBHOOK CONFIGURATION
# =============================================================================

WEBHOOK_TIMEOUT_SECONDS = 30
"""Timeout for webhook HTTP requests."""

WEBHOOK_MAX_RETRIES = 3
"""Maximum retry attempts for failed webhook deliveries."""

WEBHOOK_RETRY_DELAYS = [60, 300, 900]
"""Retry delay in seconds for each attempt (1min, 5min, 15min)."""


# =============================================================================
# PDF STYLING CONSTANTS
# =============================================================================

class PDFStyle:
    """PDF generation styling constants."""

    # Page layout
    TOP_MARGIN_INCHES = 0.5

    # Colors (hex)
    PRIMARY_COLOR = '#1e40af'
    HEADER_BG_COLOR = '#f1f5f9'
    BORDER_COLOR = '#e2e8f0'
    FOOTER_COLOR = '#64748b'
    CODE_BG_COLOR = '#f8fafc'

    # Font sizes
    TITLE_FONT_SIZE = 18
    HEADING_FONT_SIZE = 14
    BODY_FONT_SIZE = 10
    SIGNATURE_FONT_SIZE = 8
    FOOTER_FONT_SIZE = 8

    # Spacing
    SECTION_SPACING = 20
    TITLE_SPACING = 20

    # Table dimensions (in inches)
    LABEL_COL_WIDTH = 2
    VALUE_COL_WIDTH = 4

    # Padding
    CELL_PADDING = 8
    CODE_BORDER_PADDING = 10


# =============================================================================
# API KEY CONFIGURATION
# =============================================================================

API_KEY_LENGTH = 64
"""Length of generated API keys (in hex characters)."""

API_KEY_PREFIX_LENGTH = 8
"""Number of characters to show at start of masked API key."""

API_KEY_SUFFIX_LENGTH = 4
"""Number of characters to show at end of masked API key."""


# =============================================================================
# SESSION & SECURITY
# =============================================================================

SESSION_TIMEOUT_MINUTES = 15
"""Session inactivity timeout in minutes."""

VERIFICATION_TOKEN_EXPIRE_MINUTES = 15
"""Email verification token expiry in minutes."""

ACCESS_TOKEN_EXPIRE_MINUTES = 60
"""JWT access token expiry in minutes."""


# =============================================================================
# ERROR MESSAGES
# =============================================================================

class ErrorMessages:
    """Standardized error messages for consistent API responses."""

    # Authentication errors
    INVALID_CREDENTIALS = "Invalid email or password"
    REGISTRATION_FAILED = "Registration failed. Please try again or contact support."
    UNAUTHORIZED = "Authentication required"
    FORBIDDEN = "You don't have permission to access this resource"
    SESSION_EXPIRED = "Session expired. Please login again."

    # Resource errors
    NOT_FOUND = "{resource} not found"
    ALREADY_EXISTS = "{resource} already exists"

    # Consent errors
    CONSENT_NOT_FOUND = "Consent not found"
    CONSENT_ALREADY_GRANTED = "Consent already granted for this purpose"
    CONSENT_ALREADY_REVOKED = "Consent already revoked"

    # Fiduciary errors
    FIDUCIARY_NOT_FOUND = "Fiduciary not found"
    PURPOSE_NOT_FOUND = "Purpose not found"

    # Webhook errors
    WEBHOOK_NOT_FOUND = "Webhook not found"
    WEBHOOK_LIMIT_REACHED = f"Maximum webhook limit reached ({MAX_WEBHOOKS_PER_FIDUCIARY})"
    WEBHOOK_URL_INVALID = "Webhook URL cannot point to private or internal networks"

    # Validation errors
    INVALID_INPUT = "Invalid input provided"
    FIELD_REQUIRED = "{field} is required"
    FIELD_TOO_SHORT = "{field} must be at least {min} characters"
    FIELD_TOO_LONG = "{field} must not exceed {max} characters"

    # Database errors
    DATABASE_ERROR = "Database error occurred. Please try again."

    @classmethod
    def not_found(cls, resource: str) -> str:
        """Generate a not found message for a resource."""
        return cls.NOT_FOUND.format(resource=resource)

    @classmethod
    def already_exists(cls, resource: str) -> str:
        """Generate an already exists message for a resource."""
        return cls.ALREADY_EXISTS.format(resource=resource)
