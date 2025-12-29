# Webhooks API

Endpoints for managing webhook subscriptions and receiving real-time consent event notifications.

---

## Overview

Webhooks allow fiduciaries to receive real-time HTTP callbacks when consent events occur. All webhook payloads are signed using HMAC-SHA256 for security.

### Supported Events

| Event | Description |
|-------|-------------|
| `consent.granted` | User grants consent to a purpose |
| `consent.revoked` | User revokes consent |
| `consent.expired` | Consent has expired |
| `all` | Subscribe to all events |

---

## List Webhooks

Get all webhooks for the authenticated fiduciary.

```http
GET /api/webhooks
Authorization: Bearer {token}
```

### Response

```json
[
  {
    "uuid": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Production Server",
    "url": "https://your-server.com/webhooks/eigensparse",
    "events": ["consent.granted", "consent.revoked"],
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Create Webhook

Create a new webhook endpoint.

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Production Server",
  "url": "https://your-server.com/webhooks/eigensparse",
  "events": ["consent.granted", "consent.revoked"]
}
```

### Response

```json
{
  "uuid": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Production Server",
  "url": "https://your-server.com/webhooks/eigensparse",
  "events": ["consent.granted", "consent.revoked"],
  "secret": "whsec_abc123xyz789...",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

> **Important:** The `secret` is only returned once upon creation. Store it securely for signature verification.

### Errors

| Code | Detail |
|------|--------|
| `400` | Invalid URL format |
| `400` | Maximum 10 webhooks per fiduciary |
| `422` | Invalid event type |

---

## Update Webhook

Update an existing webhook.

```http
PUT /api/webhooks/{uuid}
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Updated Server Name",
  "url": "https://new-server.com/webhooks",
  "events": ["all"],
  "is_active": false
}
```

### Response

```json
{
  "uuid": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Updated Server Name",
  "url": "https://new-server.com/webhooks",
  "events": ["all"],
  "is_active": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Delete Webhook

Delete a webhook endpoint.

```http
DELETE /api/webhooks/{uuid}
Authorization: Bearer {token}
```

### Response

```json
{
  "message": "Webhook deleted successfully"
}
```

---

## Test Webhook

Send a test payload to verify your webhook endpoint.

```http
POST /api/webhooks/{uuid}/test
Authorization: Bearer {token}
```

### Response

```json
{
  "success": true,
  "response_code": 200,
  "response_time_ms": 245
}
```

### Error Response

```json
{
  "success": false,
  "response_code": 500,
  "error_message": "Connection timeout"
}
```

---

## Get Delivery Logs

Get recent webhook delivery attempts.

```http
GET /api/webhooks/{uuid}/deliveries?limit=20
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of deliveries to return (max 100) |

### Response

```json
[
  {
    "uuid": "880e8400-e29b-41d4-a716-446655440003",
    "event_type": "consent.granted",
    "status": "success",
    "response_code": 200,
    "response_time_ms": 156,
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "uuid": "880e8400-e29b-41d4-a716-446655440004",
    "event_type": "consent.revoked",
    "status": "failed",
    "response_code": 500,
    "error_message": "Internal server error",
    "created_at": "2024-01-15T09:15:00Z"
  }
]
```

---

## Webhook Payload Format

All webhook deliveries include the following structure:

```json
{
  "event": "consent.granted",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "consent_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "user_email": "user@example.com",
    "purpose_id": 1,
    "purpose_name": "Marketing Analytics",
    "granted_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Headers

Each webhook request includes these headers:

| Header | Description |
|--------|-------------|
| `X-Eigensparse-Signature` | HMAC-SHA256 signature of the payload |
| `X-Eigensparse-Event` | Event type (e.g., `consent.granted`) |
| `X-Eigensparse-Timestamp` | ISO 8601 timestamp |
| `X-Eigensparse-Delivery-ID` | Unique delivery identifier |
| `Content-Type` | `application/json` |

---

## Signature Verification

Verify webhook authenticity by computing the HMAC-SHA256 signature:

### Node.js Example

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler
app.post('/webhooks/eigensparse', (req, res) => {
  const signature = req.headers['x-eigensparse-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process the webhook
  const { event, data } = req.body;
  console.log(`Received ${event}:`, data);

  res.status(200).send('OK');
});
```

### Python Example

```python
import hmac
import hashlib

def verify_signature(payload: str, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

# In your webhook handler
@app.post("/webhooks/eigensparse")
async def handle_webhook(request: Request):
    signature = request.headers.get("X-Eigensparse-Signature")
    payload = await request.body()

    if not verify_signature(payload.decode(), signature, WEBHOOK_SECRET):
        raise HTTPException(status_code=401, detail="Invalid signature")

    data = await request.json()
    print(f"Received {data['event']}: {data['data']}")

    return {"status": "ok"}
```

---

## Best Practices

1. **Always verify signatures** - Never process webhooks without signature verification
2. **Respond quickly** - Return a 2xx response within 30 seconds
3. **Handle retries** - Eigensparse retries failed deliveries up to 3 times
4. **Use HTTPS** - Webhook URLs must use HTTPS in production
5. **Idempotency** - Use the `X-Eigensparse-Delivery-ID` header to handle duplicate deliveries
