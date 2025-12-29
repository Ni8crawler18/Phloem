"""
Webhooks Router
Webhook management endpoints for fiduciaries
"""
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import DataFiduciary, Webhook, AuditAction
from app.schemas import (
    WebhookCreate,
    WebhookUpdate,
    WebhookResponse,
    WebhookWithSecret,
    WebhookDeliveryResponse,
    WebhookTestResponse,
)
from app.services.webhook import (
    create_webhook,
    update_webhook,
    delete_webhook,
    regenerate_webhook_secret,
    get_fiduciary_webhooks,
    get_webhook_by_uuid,
    get_webhook_deliveries,
    test_webhook,
)
from app.services.audit import create_audit_log
from app.dependencies.auth import get_current_fiduciary

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

limiter = Limiter(key_func=get_remote_address)


def webhook_to_response(webhook: Webhook) -> WebhookResponse:
    """Convert webhook model to response schema"""
    return WebhookResponse(
        id=webhook.id,
        uuid=webhook.uuid,
        name=webhook.name,
        url=webhook.url,
        events=json.loads(webhook.events),
        is_active=webhook.is_active,
        created_at=webhook.created_at,
        updated_at=webhook.updated_at
    )


@router.post("", response_model=WebhookWithSecret)
@limiter.limit("10/minute")
def create_new_webhook(
    request: Request,
    data: WebhookCreate,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Create a new webhook endpoint"""
    # Check webhook limit (max 10 per fiduciary)
    existing = get_fiduciary_webhooks(db, current_fiduciary.id)
    if len(existing) >= 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum webhook limit reached (10)"
        )

    webhook = create_webhook(
        db=db,
        fiduciary_id=current_fiduciary.id,
        name=data.name,
        url=str(data.url),
        events=data.events
    )

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "webhook", webhook.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"action": "created", "name": webhook.name},
        ip_address=request.client.host if request.client else None
    )

    return WebhookWithSecret(
        id=webhook.id,
        uuid=webhook.uuid,
        name=webhook.name,
        url=webhook.url,
        events=json.loads(webhook.events),
        is_active=webhook.is_active,
        created_at=webhook.created_at,
        updated_at=webhook.updated_at,
        secret=webhook.secret
    )


@router.get("", response_model=List[WebhookResponse])
def list_webhooks(
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """List all webhooks for the current fiduciary"""
    webhooks = get_fiduciary_webhooks(db, current_fiduciary.id)
    return [webhook_to_response(w) for w in webhooks]


@router.get("/{webhook_uuid}", response_model=WebhookResponse)
def get_webhook(
    webhook_uuid: str,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Get a specific webhook"""
    webhook = get_webhook_by_uuid(db, webhook_uuid, current_fiduciary.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    return webhook_to_response(webhook)


@router.put("/{webhook_uuid}", response_model=WebhookResponse)
def update_existing_webhook(
    webhook_uuid: str,
    data: WebhookUpdate,
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Update a webhook configuration"""
    webhook = get_webhook_by_uuid(db, webhook_uuid, current_fiduciary.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    updated = update_webhook(
        db=db,
        webhook=webhook,
        name=data.name,
        url=str(data.url) if data.url else None,
        events=data.events,
        is_active=data.is_active
    )

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "webhook", webhook.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"action": "updated"},
        ip_address=request.client.host if request.client else None
    )

    return webhook_to_response(updated)


@router.delete("/{webhook_uuid}")
def delete_existing_webhook(
    webhook_uuid: str,
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Delete a webhook"""
    webhook = get_webhook_by_uuid(db, webhook_uuid, current_fiduciary.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    webhook_name = webhook.name
    delete_webhook(db, webhook)

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "webhook", webhook_uuid,
        fiduciary_id=current_fiduciary.id,
        details={"action": "deleted", "name": webhook_name},
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Webhook deleted successfully"}


@router.post("/{webhook_uuid}/regenerate-secret")
def regenerate_secret(
    webhook_uuid: str,
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Regenerate webhook secret"""
    webhook = get_webhook_by_uuid(db, webhook_uuid, current_fiduciary.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    new_secret = regenerate_webhook_secret(db, webhook)

    create_audit_log(
        db, AuditAction.DATA_ACCESSED, "webhook", webhook.uuid,
        fiduciary_id=current_fiduciary.id,
        details={"action": "secret_regenerated"},
        ip_address=request.client.host if request.client else None
    )

    return {"secret": new_secret}


@router.post("/{webhook_uuid}/test", response_model=WebhookTestResponse)
@limiter.limit("5/minute")
def test_webhook_endpoint(
    webhook_uuid: str,
    request: Request,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Send a test event to the webhook"""
    webhook = get_webhook_by_uuid(db, webhook_uuid, current_fiduciary.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    result = test_webhook(db, webhook)
    return WebhookTestResponse(**result)


@router.get("/{webhook_uuid}/deliveries", response_model=List[WebhookDeliveryResponse])
def list_webhook_deliveries(
    webhook_uuid: str,
    limit: int = 50,
    current_fiduciary: DataFiduciary = Depends(get_current_fiduciary),
    db: Session = Depends(get_db)
):
    """Get recent delivery logs for a webhook"""
    webhook = get_webhook_by_uuid(db, webhook_uuid, current_fiduciary.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    deliveries = get_webhook_deliveries(db, webhook.id, min(limit, 100))
    return deliveries
