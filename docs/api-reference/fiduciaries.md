# Fiduciaries API

Endpoints for Data Fiduciary information.

---

## List Fiduciaries

Get all registered Data Fiduciaries.

```http
GET /api/fiduciaries
Authorization: Bearer {token}
```

### Response

```json
[
  {
    "uuid": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Demo Corp",
    "description": "A demo company for testing",
    "website": "https://democorp.com",
    "contact_email": "privacy@democorp.com",
    "privacy_policy_url": "https://democorp.com/privacy",
    "purposes_count": 3,
    "created_at": "2024-01-10T09:00:00Z"
  },
  {
    "uuid": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Acme Inc",
    "description": "Leading provider of everything",
    "website": "https://acme.com",
    "contact_email": "dpo@acme.com",
    "privacy_policy_url": "https://acme.com/privacy",
    "purposes_count": 5,
    "created_at": "2024-01-12T14:30:00Z"
  }
]
```

---

## Get Fiduciary

Get details of a specific fiduciary.

```http
GET /api/fiduciaries/{uuid}
Authorization: Bearer {token}
```

### Response

```json
{
  "uuid": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Demo Corp",
  "description": "A demo company for testing consent management",
  "website": "https://democorp.com",
  "contact_email": "privacy@democorp.com",
  "privacy_policy_url": "https://democorp.com/privacy",
  "created_at": "2024-01-10T09:00:00Z",
  "purposes": [
    {
      "id": 1,
      "name": "Marketing Analytics",
      "description": "Track user behavior for personalized marketing",
      "legal_basis": "consent",
      "is_mandatory": false
    },
    {
      "id": 2,
      "name": "Service Delivery",
      "description": "Process data to provide our core service",
      "legal_basis": "contract",
      "is_mandatory": true
    }
  ]
}
```

---

## Get Fiduciary Dashboard

Get dashboard data for the authenticated fiduciary.

```http
GET /api/fiduciaries/dashboard
Authorization: Bearer {token}
```

### Response

```json
{
  "fiduciary": {
    "uuid": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Demo Corp",
    "api_key": "fid_abc123..."
  },
  "stats": {
    "total_purposes": 3,
    "total_consents": 150,
    "active_consents": 120,
    "revoked_consents": 30
  },
  "purposes": [
    {
      "id": 1,
      "name": "Marketing Analytics",
      "consent_count": 85
    }
  ],
  "recent_consents": [
    {
      "user_email": "john@example.com",
      "purpose_name": "Marketing Analytics",
      "status": "granted",
      "granted_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Regenerate API Key

Generate a new API key. **Invalidates the old key immediately.**

```http
POST /api/fiduciaries/regenerate-api-key
Authorization: Bearer {token}
```

### Response

```json
{
  "api_key": "fid_new_key_xyz789...",
  "message": "API key regenerated successfully"
}
```

### Warning

After regenerating:
- The old API key stops working immediately
- Update all applications using the old key
- SDK calls with the old key will fail

---

## Fiduciary Registration

Fiduciaries register through the standard registration endpoint.

```http
POST /api/auth/register
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Demo Corp",
  "email": "admin@democorp.com",
  "password": "secure-password",
  "role": "fiduciary",
  "organization_name": "Demo Corp",
  "website": "https://democorp.com",
  "contact_email": "privacy@democorp.com"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@democorp.com",
    "name": "Demo Corp",
    "role": "fiduciary",
    "api_key": "fid_abc123..."
  }
}
```
