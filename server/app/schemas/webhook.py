"""
Webhook Schemas - Request/Response validation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, HttpUrl, field_validator
from app.models.webhook import WebhookEvent, WebhookStatus


class WebhookCreate(BaseModel):
    """Schema for creating a new webhook"""
    name: str
    url: HttpUrl
    events: List[str]

    @field_validator('events')
    @classmethod
    def validate_events(cls, v):
        valid_events = [e.value for e in WebhookEvent]
        for event in v:
            if event not in valid_events:
                raise ValueError(f"Invalid event type: {event}. Valid types: {valid_events}")
        return v

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 3:
            raise ValueError("Name must be at least 3 characters")
        if len(v) > 255:
            raise ValueError("Name must not exceed 255 characters")
        return v


class WebhookUpdate(BaseModel):
    """Schema for updating a webhook"""
    name: Optional[str] = None
    url: Optional[HttpUrl] = None
    events: Optional[List[str]] = None
    is_active: Optional[bool] = None

    @field_validator('events')
    @classmethod
    def validate_events(cls, v):
        if v is None:
            return v
        valid_events = [e.value for e in WebhookEvent]
        for event in v:
            if event not in valid_events:
                raise ValueError(f"Invalid event type: {event}. Valid types: {valid_events}")
        return v


class WebhookResponse(BaseModel):
    """Schema for webhook response"""
    id: int
    uuid: str
    name: str
    url: str
    events: List[str]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WebhookWithSecret(WebhookResponse):
    """Schema for webhook response with secret (only on creation)"""
    secret: str


class WebhookDeliveryResponse(BaseModel):
    """Schema for webhook delivery log response"""
    id: int
    uuid: str
    event_type: str
    status: WebhookStatus
    response_code: Optional[int] = None
    error_message: Optional[str] = None
    attempt_count: int
    created_at: datetime
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WebhookTestRequest(BaseModel):
    """Schema for testing a webhook"""
    webhook_uuid: str


class WebhookTestResponse(BaseModel):
    """Schema for webhook test response"""
    success: bool
    response_code: Optional[int] = None
    response_body: Optional[str] = None
    error_message: Optional[str] = None


class WebhookPayload(BaseModel):
    """Standard webhook payload structure"""
    event: str
    timestamp: datetime
    data: dict
    signature: str  # HMAC-SHA256 signature for verification
