# Settings API

Endpoints for managing user and fiduciary profiles, passwords, and account deletion.

---

## User Settings

### Get User Profile

Get the current user's profile information.

```http
GET /api/settings/user/profile
Authorization: Bearer {token}
```

### Response

```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Update User Profile

Update user profile information. Email cannot be changed.

```http
PUT /api/settings/user/profile
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "name": "John Updated",
  "phone": "+0987654321"
}
```

All fields are optional. Only provided fields will be updated.

### Response

```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "name": "John Updated",
  "phone": "+0987654321",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Change User Password

Change the user's password. Requires current password verification.

```http
POST /api/settings/user/change-password
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "current_password": "OldPassword123",
  "new_password": "NewSecurePassword456"
}
```

### Response

```json
{
  "message": "Password changed successfully"
}
```

### Errors

| Code | Detail |
|------|--------|
| `400` | Current password is incorrect |
| `400` | New password must be different |
| `422` | Password must be at least 8 characters |

---

### Delete User Account

Permanently delete the user account. This action is irreversible.

```http
POST /api/settings/user/delete-account
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "password": "YourPassword123",
  "confirmation": "DELETE"
}
```

> **Important:** The `confirmation` field must be exactly `DELETE` (case-sensitive).

### Response

```json
{
  "message": "Account deleted successfully",
  "deleted_consents": 5,
  "deleted_audit_logs": 23
}
```

### What Gets Deleted

- User profile
- All consent records
- All consent receipts
- Audit logs are anonymized (not deleted) for compliance

### Errors

| Code | Detail |
|------|--------|
| `400` | Password is incorrect |
| `400` | Please type 'DELETE' to confirm account deletion |

---

## Fiduciary Settings

### Get Fiduciary Profile

Get the current fiduciary's profile information.

```http
GET /api/settings/fiduciary/profile
Authorization: Bearer {token}
```

### Response

```json
{
  "id": 1,
  "uuid": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Demo Corp",
  "description": "A demo company for consent management",
  "privacy_policy_url": "https://democorp.com/privacy",
  "contact_email": "privacy@democorp.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Update Fiduciary Profile

Update fiduciary organization profile. Contact email cannot be changed.

```http
PUT /api/settings/fiduciary/profile
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Demo Corporation",
  "description": "Updated company description",
  "privacy_policy_url": "https://democorp.com/privacy-policy"
}
```

All fields are optional. Only provided fields will be updated.

### Response

```json
{
  "id": 1,
  "uuid": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Demo Corporation",
  "description": "Updated company description",
  "privacy_policy_url": "https://democorp.com/privacy-policy",
  "contact_email": "privacy@democorp.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Change Fiduciary Password

Change the fiduciary account password. Requires current password verification.

```http
POST /api/settings/fiduciary/change-password
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "current_password": "OldPassword123",
  "new_password": "NewSecurePassword456"
}
```

### Response

```json
{
  "message": "Password changed successfully"
}
```

### Errors

| Code | Detail |
|------|--------|
| `400` | Current password is incorrect |
| `400` | New password must be different |
| `400` | Password not set for this account |
| `422` | Password must be at least 8 characters |

---

### Delete Fiduciary Account

Permanently delete the fiduciary account and all associated data. This action is irreversible.

```http
POST /api/settings/fiduciary/delete-account
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "password": "YourPassword123",
  "confirmation": "DELETE"
}
```

> **Important:** The `confirmation` field must be exactly `DELETE` (case-sensitive).

### Response

```json
{
  "message": "Account deleted successfully",
  "deleted_consents": 150,
  "deleted_audit_logs": 500
}
```

### What Gets Deleted

- Fiduciary organization profile
- All purposes created by the fiduciary
- All webhook configurations
- All webhook delivery logs
- All user consents to this fiduciary's purposes
- All consent receipts
- Audit logs are anonymized (not deleted) for compliance

### Errors

| Code | Detail |
|------|--------|
| `400` | Password is incorrect |
| `400` | Password not set for this account |
| `400` | Please type 'DELETE' to confirm account deletion |

---

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| Get profile | 30 requests/min |
| Update profile | 10 requests/min |
| Change password | 5 requests/min |
| Delete account | 3 requests/min |

---

## GDPR Compliance

The Settings API supports GDPR Article 17 (Right to Erasure):

- Users can request complete deletion of their data
- Fiduciaries can delete their organization and all associated data
- Audit logs are anonymized to maintain compliance records while removing PII
- All deletions are logged before execution for audit purposes
