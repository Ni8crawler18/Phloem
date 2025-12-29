# Users API

Endpoints for user (Data Principal) management.

---

## Register User

Create a new Data Principal account.

```http
POST /api/auth/register
Content-Type: application/json
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure-password",
  "role": "user"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name |
| `email` | string | Yes | Email address |
| `password` | string | Yes | Min 8 characters |
| `role` | string | Yes | Must be `"user"` |

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Errors

| Code | Detail |
|------|--------|
| `400` | Email already registered |
| `422` | Invalid email format |
| `422` | Password too short |

---

## Login

Authenticate and get access token.

```http
POST /api/auth/login
Content-Type: application/json
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "secure-password"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Errors

| Code | Detail |
|------|--------|
| `401` | Invalid credentials |

---

## Get Current User

Get the authenticated user's profile.

```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Response

```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## User Dashboard

Get dashboard data for Data Principals.

```http
GET /api/users/dashboard
Authorization: Bearer {token}
```

### Response

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "stats": {
    "total_consents": 5,
    "active_consents": 3,
    "revoked_consents": 2
  },
  "consents": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "fiduciary_name": "Demo Corp",
      "purpose_name": "Marketing Analytics",
      "status": "granted",
      "granted_at": "2024-01-15T10:30:00Z",
      "expires_at": "2025-01-15T10:30:00Z"
    }
  ],
  "fiduciaries": [
    {
      "uuid": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Demo Corp",
      "purposes_count": 3
    }
  ]
}
```

---

## User Rights (DPDP Act Section 6)

As a Data Principal, users have the right to:

### 1. Access

View all consents and their status.

```http
GET /api/consents
```

### 2. Rectification

Update personal information.

```http
PUT /api/users/profile
```

### 3. Erasure

Request deletion of personal data (contact fiduciary directly).

### 4. Portability

Download consent receipts.

```http
GET /api/consents/{uuid}/receipt/pdf
```

### 5. Withdrawal

Revoke consent at any time.

```http
POST /api/consents/revoke
```

---

## Password Requirements

- Minimum 8 characters
- Stored using bcrypt hashing
- Never logged or exposed in responses
