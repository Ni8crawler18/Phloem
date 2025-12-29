# API Overview

The Eigensparse REST API reference.

---

## Base URL

```
https://eigensparse-api.onrender.com/api
```

---

## Interactive Documentation

Explore the API interactively at:

[https://eigensparse-api.onrender.com/docs](https://eigensparse-api.onrender.com/docs)

---

## Authentication

Most endpoints require authentication. See [Authentication](../getting-started/authentication.md) for details.

| Endpoint Type | Auth Method |
|--------------|-------------|
| User endpoints | JWT Bearer Token |
| Fiduciary endpoints | JWT Bearer Token (with fiduciary role) |
| SDK endpoints | API Key (`X-API-Key` header) |
| Public endpoints | None |

---

## Request Format

All requests should use:

- **Content-Type:** `application/json`
- **Accept:** `application/json`

```bash
curl -X POST https://eigensparse-api.onrender.com/api/consents/grant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"fiduciary_uuid": "...", "purpose_id": 1}'
```

---

## Response Format

All responses are JSON:

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response

```json
{
  "detail": "Error message here"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing/invalid auth |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `422` | Validation Error - Invalid data format |
| `429` | Rate Limited - Too many requests |
| `500` | Server Error |

---

## Rate Limiting

All API endpoints are rate limited to prevent abuse. Limits vary by endpoint sensitivity.

| Endpoint Type | Rate Limit |
|---------------|------------|
| Authentication | 5 requests/min |
| Consent operations | 10 requests/min |
| Data export | 5 requests/min |
| Profile updates | 10 requests/min |
| Password change | 5 requests/min |
| Account deletion | 3 requests/min |
| Webhook operations | 20 requests/min |
| SDK verification | 100 requests/min |

When rate limited, the API returns a `429 Too Many Requests` response.

---

## Endpoints Summary

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login and get token |
| `GET` | `/auth/me` | Get current user info |
| `POST` | `/auth/fiduciary/register` | Register new fiduciary |
| `POST` | `/auth/fiduciary/login` | Fiduciary login |
| `GET` | `/auth/fiduciary/me` | Get current fiduciary info |

### Consents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/consents` | List user's consents |
| `POST` | `/consents/grant` | Grant consent |
| `POST` | `/consents/revoke` | Revoke consent |
| `POST` | `/consents/renew` | Renew expiring consent |
| `GET` | `/consents/{uuid}/receipt` | Get consent receipt |
| `GET` | `/consents/{uuid}/receipt/pdf` | Download PDF receipt |

### Data Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/consents/export/json` | Export all user data as JSON |
| `GET` | `/consents/export/csv` | Export all user data as CSV |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settings/user/profile` | Get user profile |
| `PUT` | `/settings/user/profile` | Update user profile |
| `POST` | `/settings/user/change-password` | Change user password |
| `POST` | `/settings/user/delete-account` | Delete user account |
| `GET` | `/settings/fiduciary/profile` | Get fiduciary profile |
| `PUT` | `/settings/fiduciary/profile` | Update fiduciary profile |
| `POST` | `/settings/fiduciary/change-password` | Change fiduciary password |
| `POST` | `/settings/fiduciary/delete-account` | Delete fiduciary account |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/webhooks` | List all webhooks |
| `POST` | `/webhooks` | Create a new webhook |
| `PUT` | `/webhooks/{uuid}` | Update webhook |
| `DELETE` | `/webhooks/{uuid}` | Delete webhook |
| `POST` | `/webhooks/{uuid}/test` | Test webhook endpoint |
| `GET` | `/webhooks/{uuid}/deliveries` | Get webhook delivery logs |

### Purposes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/purposes` | List all purposes |
| `POST` | `/purposes` | Create new purpose |
| `GET` | `/purposes/{id}` | Get purpose details |

### Fiduciaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fiduciaries` | List all fiduciaries |
| `GET` | `/fiduciaries/{uuid}` | Get fiduciary details |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/stats` | Get fiduciary statistics |
| `GET` | `/dashboard/consents` | Get consents for fiduciary |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/audit-logs` | Get user audit logs |
| `GET` | `/audit-logs/fiduciary` | Get fiduciary audit logs |

### SDK

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sdk/verify-consent` | Verify user consent |
| `GET` | `/sdk/purposes` | Get fiduciary's purposes |
