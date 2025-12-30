# Eigensparse API Documentation

## Overview

The Eigensparse API enables data fiduciaries to verify user consent before processing personal data. This documentation covers API authentication, available endpoints, and SDK integration.

**Base URL:** `https://eigensparse-api.onrender.com/api`

---

## Authentication

All SDK endpoints require authentication via API key. Include your API key in the `X-API-Key` header with every request.

### Getting Your API Key

1. Log in to the [Fiduciary Portal](https://eigensparse.vercel.app/login)
2. Navigate to **API Key** in the sidebar
3. Your masked API key is displayed
4. Click **Regenerate Key** to generate a new key (shown only once)

### Using Your API Key

```bash
curl -H "X-API-Key: your_api_key_here" \
     https://eigensparse-api.onrender.com/api/sdk/purposes
```

> **Security Note:** Store your API key securely. Never expose it in client-side code or public repositories.

---

## SDK Endpoints

### Check User Consent

Verify if a user has granted consent to your purposes.

```
POST /api/sdk/check-consent
```

#### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `X-API-Key` | string | Yes | Your fiduciary API key |
| `Content-Type` | string | Yes | Must be `application/json` |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_email` | string | Yes | Email address of the user to check |
| `purpose_uuid` | string | No | Filter by specific purpose UUID |

#### Example Request

```bash
curl -X POST "https://eigensparse-api.onrender.com/api/sdk/check-consent" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "user@example.com"
  }'
```

#### Example Response (Consent Granted)

```json
{
  "has_consent": true,
  "consents": [
    {
      "consent_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "purpose_uuid": "p1q2r3s4-t5u6-7890-wxyz-123456789abc",
      "purpose_name": "Marketing Communications",
      "granted_at": "2025-01-15T10:30:00.000Z",
      "expires_at": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Example Response (No Consent)

```json
{
  "has_consent": false,
  "consents": []
}
```

---

### Get Purposes

Retrieve all active purposes registered by your fiduciary account.

```
GET /api/sdk/purposes
```

#### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `X-API-Key` | string | Yes | Your fiduciary API key |

#### Example Request

```bash
curl "https://eigensparse-api.onrender.com/api/sdk/purposes" \
  -H "X-API-Key: your_api_key_here"
```

#### Example Response

```json
[
  {
    "uuid": "p1q2r3s4-t5u6-7890-wxyz-123456789abc",
    "name": "Marketing Communications",
    "description": "Send promotional emails and newsletters",
    "data_categories": ["email", "name"],
    "legal_basis": "consent",
    "is_mandatory": false
  },
  {
    "uuid": "x9y8z7w6-v5u4-3210-mnop-987654321fed",
    "name": "Analytics",
    "description": "Track usage patterns to improve our service",
    "data_categories": ["usage_data", "device_info"],
    "legal_basis": "legitimate_interest",
    "is_mandatory": false
  }
]
```

---

## JavaScript SDK

### Installation

```bash
npm install @eigensparse/sdk
```

### Basic Usage

```javascript
import Eigensparse from '@eigensparse/sdk';

// Initialize the client
const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your_api_key_here'
});

// Check consent before processing data
async function processUserData(userEmail) {
  const result = await client.checkConsent(userEmail);

  if (result.has_consent) {
    // User has consented - proceed with data processing
    console.log('Consent granted:', result.consents);
    await performDataProcessing(userEmail);
  } else {
    // No consent - show consent widget or block processing
    console.log('No consent found');
    client.renderWidget('#consent-container');
  }
}
```

### Check Consent for Specific Purpose

```javascript
// Check if user consented to a specific purpose
const result = await client.checkConsent('user@example.com', {
  purposeUuid: 'p1q2r3s4-t5u6-7890-wxyz-123456789abc'
});

if (result.has_consent) {
  // User consented to this specific purpose
}
```

### Get Available Purposes

```javascript
// Fetch all your registered purposes
const purposes = await client.getPurposes();

purposes.forEach(purpose => {
  console.log(`${purpose.name}: ${purpose.description}`);
  console.log(`Data categories: ${purpose.data_categories.join(', ')}`);
});
```

### Render Consent Widget

```javascript
// Display consent widget for users to grant consent
client.renderWidget('#consent-container', {
  theme: 'light',           // 'light' or 'dark'
  onConsentGranted: (consent) => {
    console.log('User granted consent:', consent);
  },
  onConsentDenied: () => {
    console.log('User denied consent');
  }
});
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Invalid API key"
}
```

### Handling Errors in JavaScript

```javascript
try {
  const result = await client.checkConsent('user@example.com');
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('API Error:', error.response.status, error.response.data);

    if (error.response.status === 401) {
      console.error('Invalid API key - check your configuration');
    } else if (error.response.status === 429) {
      console.error('Rate limit exceeded - slow down requests');
    }
  } else {
    // Network error
    console.error('Network Error:', error.message);
  }
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/sdk/check-consent` | 100 requests/minute |
| `/api/sdk/purposes` | 100 requests/minute |
| `/api/fiduciary/api-key/regenerate` | 3 requests/minute |

When rate limited, you'll receive a `429 Too Many Requests` response.

---

## Integration Examples

### Express.js Middleware

```javascript
import Eigensparse from '@eigensparse/sdk';

const consentClient = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_API_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

// Middleware to check consent before processing
async function requireConsent(purposeUuid) {
  return async (req, res, next) => {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const result = await consentClient.checkConsent(userEmail, { purposeUuid });

      if (result.has_consent) {
        req.consentData = result.consents[0];
        next();
      } else {
        res.status(403).json({
          error: 'Consent required',
          consent_url: `/consent?purpose=${purposeUuid}`
        });
      }
    } catch (error) {
      console.error('Consent check failed:', error);
      res.status(500).json({ error: 'Failed to verify consent' });
    }
  };
}

// Usage
app.post('/api/send-marketing-email',
  requireConsent('marketing-purpose-uuid'),
  async (req, res) => {
    // User has consented - safe to process
    await sendMarketingEmail(req.user.email);
    res.json({ success: true });
  }
);
```

### React Integration

```jsx
import { useState, useEffect } from 'react';
import Eigensparse from '@eigensparse/sdk';

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your_api_key_here'
});

function ConsentGate({ userEmail, purposeUuid, children }) {
  const [hasConsent, setHasConsent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConsent() {
      try {
        const result = await client.checkConsent(userEmail, { purposeUuid });
        setHasConsent(result.has_consent);
      } catch (error) {
        console.error('Failed to check consent:', error);
        setHasConsent(false);
      } finally {
        setLoading(false);
      }
    }

    checkConsent();
  }, [userEmail, purposeUuid]);

  if (loading) {
    return <div>Checking consent...</div>;
  }

  if (!hasConsent) {
    return (
      <div>
        <p>We need your consent to proceed.</p>
        <div id="consent-widget" ref={(el) => {
          if (el) client.renderWidget('#consent-widget');
        }} />
      </div>
    );
  }

  return children;
}

// Usage
function MarketingPreferences({ user }) {
  return (
    <ConsentGate
      userEmail={user.email}
      purposeUuid="marketing-purpose-uuid"
    >
      <MarketingSettings />
    </ConsentGate>
  );
}
```

---

## Best Practices

### 1. Cache Consent Status

```javascript
// Cache consent for a reasonable period to reduce API calls
const consentCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function checkConsentCached(userEmail, purposeUuid) {
  const cacheKey = `${userEmail}:${purposeUuid}`;
  const cached = consentCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const result = await client.checkConsent(userEmail, { purposeUuid });
  consentCache.set(cacheKey, { result, timestamp: Date.now() });

  return result;
}
```

### 2. Environment Variables

```bash
# .env
EIGENSPARSE_API_KEY=your_api_key_here
EIGENSPARSE_API_URL=https://eigensparse-api.onrender.com/api
```

```javascript
// Never hardcode API keys
const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_API_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});
```

### 3. Handle Consent Expiry

```javascript
async function checkConsentWithExpiry(userEmail) {
  const result = await client.checkConsent(userEmail);

  if (result.has_consent) {
    const consent = result.consents[0];

    if (consent.expires_at) {
      const expiresAt = new Date(consent.expires_at);
      const daysUntilExpiry = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 14) {
        // Consent expiring soon - prompt user to renew
        notifyConsentExpiring(userEmail, daysUntilExpiry);
      }
    }

    return true;
  }

  return false;
}
```

---

## Legal Compliance

Eigensparse helps you comply with:

| Regulation | Requirement | How Eigensparse Helps |
|------------|-------------|----------------------|
| **GDPR** (EU) | Explicit consent for data processing | Consent receipts with cryptographic signatures |
| **DPDP Act 2023** (India) | Purpose limitation | Purpose-bound consent management |
| **Both** | Right to withdraw consent | One-click revocation with audit trail |
| **Both** | Records of processing | Immutable audit logs |

---

## Support

- **Documentation:** [https://eigensparse.vercel.app/docs](https://eigensparse.vercel.app/docs)
- **GitHub Issues:** [https://github.com/Ni8crawler18/Phloem/issues](https://github.com/Ni8crawler18/Phloem/issues)
- **API Status:** Check the Fiduciary Portal dashboard

---

*Last updated: December 2025*
