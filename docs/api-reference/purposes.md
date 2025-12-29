# Purposes API

Endpoints for managing data processing purposes.

---

## List Purposes

Get all purposes (optionally filtered by fiduciary).

```http
GET /api/purposes
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fiduciary_uuid` | string | Filter by fiduciary UUID |

### Response

```json
[
  {
    "id": 1,
    "uuid": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Marketing Analytics",
    "description": "Track user behavior for personalized marketing",
    "data_categories": ["Usage Data", "Device Info"],
    "retention_period_days": 365,
    "legal_basis": "consent",
    "is_mandatory": false,
    "is_active": true,
    "created_at": "2024-01-10T09:00:00Z"
  },
  {
    "id": 2,
    "uuid": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Service Delivery",
    "description": "Process data to provide our core service",
    "data_categories": ["Email", "Name"],
    "retention_period_days": 730,
    "legal_basis": "contract",
    "is_mandatory": true,
    "is_active": true,
    "created_at": "2024-01-10T09:00:00Z"
  }
]
```

---

## Create Purpose

Create a new data processing purpose. **Fiduciary only.**

```http
POST /api/purposes
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Marketing Analytics",
  "description": "Track user behavior for personalized marketing campaigns",
  "data_categories": ["Usage Data", "Device Info", "Location"],
  "retention_period_days": 365,
  "legal_basis": "consent",
  "is_mandatory": false
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Purpose name (max 100 chars) |
| `description` | string | Yes | Detailed description |
| `data_categories` | array | Yes | List of data types collected |
| `retention_period_days` | integer | Yes | Days data will be retained |
| `legal_basis` | string | Yes | Legal justification |
| `is_mandatory` | boolean | No | Default: `false` |

### Legal Basis Values

| Value | Description |
|-------|-------------|
| `consent` | User explicitly agrees |
| `contract` | Required for service delivery |
| `legal_obligation` | Required by law |
| `vital_interests` | Protect someone's life |
| `public_task` | Public authority function |
| `legitimate_interests` | Business necessity |

### Response

```json
{
  "id": 3,
  "uuid": "990e8400-e29b-41d4-a716-446655440004",
  "name": "Marketing Analytics",
  "description": "Track user behavior for personalized marketing campaigns",
  "data_categories": ["Usage Data", "Device Info", "Location"],
  "retention_period_days": 365,
  "legal_basis": "consent",
  "is_mandatory": false,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Get Purpose

Get details of a specific purpose.

```http
GET /api/purposes/{id}
Authorization: Bearer {token}
```

### Response

```json
{
  "id": 1,
  "uuid": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Marketing Analytics",
  "description": "Track user behavior for personalized marketing",
  "data_categories": ["Usage Data", "Device Info"],
  "retention_period_days": 365,
  "legal_basis": "consent",
  "is_mandatory": false,
  "is_active": true,
  "fiduciary": {
    "uuid": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Demo Corp"
  },
  "created_at": "2024-01-10T09:00:00Z"
}
```

---

## Update Purpose

Update an existing purpose. **Fiduciary only.**

```http
PUT /api/purposes/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "description": "Updated description",
  "retention_period_days": 180,
  "is_active": true
}
```

### Note

Updating a purpose does not affect existing consents. Users who already consented will retain their original consent terms until they revoke and re-grant.

---

## Common Data Categories

Suggested categories for the `data_categories` field:

| Category | Examples |
|----------|----------|
| `Personal Info` | Name, email, phone |
| `Usage Data` | Pages visited, clicks, time on site |
| `Device Info` | Browser, OS, screen size |
| `Location` | IP address, GPS coordinates |
| `Financial` | Payment info, transaction history |
| `Health` | Medical records, fitness data |
| `Biometric` | Fingerprints, face recognition |
| `Social` | Friends list, posts, messages |
