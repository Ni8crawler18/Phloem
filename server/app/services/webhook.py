"""
Webhook Service - Delivery and management
"""
import json
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
import httpx
from sqlalchemy.orm import Session

from app.models import Webhook, WebhookDelivery, WebhookStatus, WebhookEvent, DataFiduciary


def generate_webhook_secret() -> str:
    """Generate a secure webhook secret"""
    return f"whsec_{secrets.token_urlsafe(32)}"


def generate_signature(payload: str, secret: str) -> str:
    """Generate HMAC-SHA256 signature for payload verification"""
    return hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


def verify_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify webhook signature"""
    expected = generate_signature(payload, secret)
    return hmac.compare_digest(expected, signature)


def create_webhook(
    db: Session,
    fiduciary_id: int,
    name: str,
    url: str,
    events: List[str]
) -> Webhook:
    """Create a new webhook for a fiduciary"""
    webhook = Webhook(
        fiduciary_id=fiduciary_id,
        name=name,
        url=str(url),
        secret=generate_webhook_secret(),
        events=json.dumps(events),
        is_active=True
    )
    db.add(webhook)
    db.commit()
    db.refresh(webhook)
    return webhook


def update_webhook(
    db: Session,
    webhook: Webhook,
    name: Optional[str] = None,
    url: Optional[str] = None,
    events: Optional[List[str]] = None,
    is_active: Optional[bool] = None
) -> Webhook:
    """Update webhook configuration"""
    if name is not None:
        webhook.name = name
    if url is not None:
        webhook.url = str(url)
    if events is not None:
        webhook.events = json.dumps(events)
    if is_active is not None:
        webhook.is_active = is_active

    db.commit()
    db.refresh(webhook)
    return webhook


def delete_webhook(db: Session, webhook: Webhook) -> None:
    """Delete a webhook"""
    db.delete(webhook)
    db.commit()


def regenerate_webhook_secret(db: Session, webhook: Webhook) -> str:
    """Regenerate webhook secret"""
    new_secret = generate_webhook_secret()
    webhook.secret = new_secret
    db.commit()
    return new_secret


def get_fiduciary_webhooks(db: Session, fiduciary_id: int) -> List[Webhook]:
    """Get all webhooks for a fiduciary"""
    return db.query(Webhook).filter(
        Webhook.fiduciary_id == fiduciary_id
    ).order_by(Webhook.created_at.desc()).all()


def get_webhook_by_uuid(db: Session, uuid: str, fiduciary_id: int) -> Optional[Webhook]:
    """Get a specific webhook by UUID"""
    return db.query(Webhook).filter(
        Webhook.uuid == uuid,
        Webhook.fiduciary_id == fiduciary_id
    ).first()


def get_webhook_deliveries(
    db: Session,
    webhook_id: int,
    limit: int = 50
) -> List[WebhookDelivery]:
    """Get recent deliveries for a webhook"""
    return db.query(WebhookDelivery).filter(
        WebhookDelivery.webhook_id == webhook_id
    ).order_by(WebhookDelivery.created_at.desc()).limit(limit).all()


def should_trigger_webhook(webhook: Webhook, event_type: str) -> bool:
    """Check if webhook should be triggered for an event"""
    if not webhook.is_active:
        return False

    events = json.loads(webhook.events)
    return WebhookEvent.ALL.value in events or event_type in events


def deliver_webhook(
    db: Session,
    webhook: Webhook,
    event_type: str,
    data: dict
) -> WebhookDelivery:
    """Deliver a webhook payload to the endpoint"""
    timestamp = datetime.utcnow()

    payload_dict = {
        "event": event_type,
        "timestamp": timestamp.isoformat(),
        "data": data
    }
    payload = json.dumps(payload_dict, default=str)
    signature = generate_signature(payload, webhook.secret)

    # Create delivery record
    delivery = WebhookDelivery(
        webhook_id=webhook.id,
        event_type=event_type,
        payload=payload,
        status=WebhookStatus.PENDING,
        attempt_count=1
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    # Attempt delivery
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(
                webhook.url,
                content=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-Eigensparse-Signature": signature,
                    "X-Eigensparse-Event": event_type,
                    "X-Eigensparse-Timestamp": timestamp.isoformat(),
                    "X-Eigensparse-Delivery-ID": delivery.uuid
                }
            )

            delivery.response_code = response.status_code
            delivery.response_body = response.text[:1000] if response.text else None

            if 200 <= response.status_code < 300:
                delivery.status = WebhookStatus.SUCCESS
                delivery.delivered_at = datetime.utcnow()
            else:
                delivery.status = WebhookStatus.FAILED
                delivery.error_message = f"HTTP {response.status_code}"
                # Schedule retry
                delivery.next_retry_at = datetime.utcnow() + timedelta(minutes=5)

    except httpx.TimeoutException:
        delivery.status = WebhookStatus.FAILED
        delivery.error_message = "Request timed out"
        delivery.next_retry_at = datetime.utcnow() + timedelta(minutes=5)

    except httpx.RequestError as e:
        delivery.status = WebhookStatus.FAILED
        delivery.error_message = str(e)[:500]
        delivery.next_retry_at = datetime.utcnow() + timedelta(minutes=5)

    except Exception as e:
        delivery.status = WebhookStatus.FAILED
        delivery.error_message = f"Unexpected error: {str(e)[:500]}"

    db.commit()
    db.refresh(delivery)
    return delivery


def test_webhook(db: Session, webhook: Webhook) -> dict:
    """Send a test event to webhook"""
    test_data = {
        "test": True,
        "message": "This is a test webhook delivery from Eigensparse",
        "webhook_name": webhook.name,
        "webhook_uuid": webhook.uuid
    }

    delivery = deliver_webhook(
        db=db,
        webhook=webhook,
        event_type="test",
        data=test_data
    )

    return {
        "success": delivery.status == WebhookStatus.SUCCESS,
        "response_code": delivery.response_code,
        "response_body": delivery.response_body,
        "error_message": delivery.error_message
    }


def trigger_consent_webhooks(
    db: Session,
    fiduciary_id: int,
    event_type: str,
    consent_data: dict
) -> List[WebhookDelivery]:
    """Trigger all relevant webhooks for a consent event"""
    webhooks = db.query(Webhook).filter(
        Webhook.fiduciary_id == fiduciary_id,
        Webhook.is_active == True
    ).all()

    deliveries = []
    for webhook in webhooks:
        if should_trigger_webhook(webhook, event_type):
            delivery = deliver_webhook(
                db=db,
                webhook=webhook,
                event_type=event_type,
                data=consent_data
            )
            deliveries.append(delivery)

    return deliveries
