# Consents API

Endpoints for managing consent grants and revocations.

---

## List Consents

Get all consents for the authenticated user.

```http
GET /api/consents
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `granted`, `revoked`, `expired` |

### Response

```json
[
  {
    "consent": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "status": "granted",
      "granted_at": "2024-01-15T10:30:00Z",
      "expires_at": "2025-01-15T10:30:00Z",
      "revoked_at": null
    },
    "purpose": {
      "id": 1,
      "name": "Marketing Analytics",
      "description": "Track user behavior for personalized marketing",
      "data_categories": ["Usage Data", "Device Info"],
      "retention_period_days": 365,
      "legal_basis": "consent"
    },
    "fiduciary": {
      "uuid": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Demo Corp",
      "contact_email": "privacy@democorp.com"
    }
  }
]
```

---

## Grant Consent

Grant consent for a specific purpose.

```http
POST /api/consents/grant
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "fiduciary_uuid": "660e8400-e29b-41d4-a716-446655440001",
  "purpose_id": 1
}
```

### Response

```json
{
  "receipt_id": "RCP-2024-001",
  "consent_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "fiduciary_name": "Demo Corp",
  "purpose_name": "Marketing Analytics",
  "purpose_description": "Track user behavior for personalized marketing",
  "data_categories": ["Usage Data", "Device Info"],
  "legal_basis": "consent",
  "retention_period_days": 365,
  "granted_at": "2024-01-15T10:30:00Z",
  "expires_at": "2025-01-15T10:30:00Z",
  "status": "granted",
  "signature": "sha256:a1b2c3d4e5f6..."
}
```

### Errors

| Code | Detail |
|------|--------|
| `404` | Fiduciary not found |
| `404` | Purpose not found |
| `400` | Consent already granted for this purpose |

---

## Revoke Consent

Revoke a previously granted consent.

```http
POST /api/consents/revoke
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "consent_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "No longer want to receive marketing emails"
}
```

### Response

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "status": "revoked",
  "granted_at": "2024-01-15T10:30:00Z",
  "revoked_at": "2024-02-01T15:45:00Z"
}
```

### Errors

| Code | Detail |
|------|--------|
| `404` | Consent not found |
| `400` | Consent already revoked |

---

## Get Consent Receipt

Retrieve the receipt for a specific consent.

```http
GET /api/consents/{uuid}/receipt
Authorization: Bearer {token}
```

### Response

```json
{
  "receipt_id": "RCP-2024-001",
  "consent_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "fiduciary_name": "Demo Corp",
  "purpose_name": "Marketing Analytics",
  "purpose_description": "Track user behavior for personalized marketing",
  "data_categories": ["Usage Data", "Device Info"],
  "legal_basis": "consent",
  "retention_period_days": 365,
  "granted_at": "2024-01-15T10:30:00Z",
  "expires_at": "2025-01-15T10:30:00Z",
  "status": "granted",
  "signature": "sha256:a1b2c3d4e5f6..."
}
```

---

## Download Receipt PDF

Download the consent receipt as a PDF document.

```http
GET /api/consents/{uuid}/receipt/pdf
Authorization: Bearer {token}
```

### Response

Returns a PDF file with:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename=consent-receipt-{uuid}.pdf`

### PDF Contents

- Receipt ID and Consent UUID
- Data Principal information
- Data Fiduciary information
- Purpose details
- Grant/expiration dates
- Cryptographic signature
- Compliance footer (DPDP Act & GDPR)
