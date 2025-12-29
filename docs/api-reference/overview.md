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
| `500` | Server Error |

---

## Rate Limiting

Currently, there are no rate limits. This may change in the future.

---

## Endpoints Summary

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login and get token |

### Consents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/consents` | List user's consents |
| `POST` | `/consents/grant` | Grant consent |
| `POST` | `/consents/revoke` | Revoke consent |
| `GET` | `/consents/{uuid}/receipt` | Get consent receipt |
| `GET` | `/consents/{uuid}/receipt/pdf` | Download PDF receipt |

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

### SDK

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sdk/verify-consent` | Verify user consent |
| `GET` | `/sdk/purposes` | Get fiduciary's purposes |
