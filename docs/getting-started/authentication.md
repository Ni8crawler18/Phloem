# Authentication

How authentication works in Eigensparse.

---

## Overview

Eigensparse uses two authentication methods:

| Method | Use Case |
|--------|----------|
| **JWT Tokens** | User/Fiduciary dashboard access |
| **API Keys** | Server-to-server SDK calls |

---

## JWT Authentication

Used for web dashboard access.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Using the Token

Include in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- Tokens expire after **24 hours**
- Refresh by logging in again

---

## API Key Authentication

Used for SDK and server-to-server communication.

### Getting Your API Key

1. Log in to your Fiduciary dashboard
2. Your API key is displayed on the main dashboard
3. Click **Copy** to copy it
4. Click **Regenerate** if you need a new key

### Using the API Key

**With SDK:**

```javascript
const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});
```

**Direct API calls:**

```http
GET /api/sdk/verify-consent?email=user@example.com
X-API-Key: your-api-key
```

---

## Security Best Practices

### Do

- Store API keys in environment variables
- Use HTTPS for all API calls
- Rotate API keys periodically
- Use separate keys for development/production

### Don't

- Commit API keys to version control
- Expose API keys in client-side code
- Share API keys between applications
- Use the same key for all environments

---

## Environment Variables

```bash
# .env file
EIGENSPARSE_API_URL=https://eigensparse-api.onrender.com/api
EIGENSPARSE_API_KEY=your-api-key
```

```javascript
// Usage
const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_API_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});
```

---

## Regenerating API Keys

If your API key is compromised:

1. Log in to your Fiduciary dashboard
2. Click **Regenerate API Key**
3. Confirm the action
4. Update your applications with the new key

**Note:** The old key is immediately invalidated.
