<div align="center">

# Eigensparse SDK

**Consent Management for the Modern Web**

[![npm version](https://img.shields.io/npm/v/eigensparse-sdk.svg?style=flat-square)](https://www.npmjs.com/package/eigensparse-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![DPDP Compliant](https://img.shields.io/badge/DPDP%202023-Compliant-green?style=flat-square)](https://www.meity.gov.in/data-protection-framework)
[![GDPR Compliant](https://img.shields.io/badge/GDPR-Compliant-green?style=flat-square)](https://gdpr.eu/)

[Documentation](https://eigensparse.com) · [Dashboard](https://eigensparse.com) · [Report Bug](https://github.com/Ni8crawler18/Phloem/issues)

</div>

---

## Overview

Eigensparse SDK enables developers to integrate **privacy-first consent management** into any application. Built for compliance with **DPDP Act 2023 (India)** and **GDPR (EU)**.

### Why Eigensparse?

- **Legal Compliance** — Stay compliant with Indian and EU data protection laws
- **Cryptographic Receipts** — SHA-256 signed consent receipts for audit trails
- **Simple Integration** — Add consent checks with just a few lines of code
- **Purpose Binding** — Granular control over data processing purposes
- **Works Everywhere** — Browser, Node.js, and any JavaScript environment

---

## Installation

```bash
npm install eigensparse-sdk
```

**Or via CDN:**

```html
<script src="https://unpkg.com/eigensparse-sdk/dist/eigensparse.min.js"></script>
```

---

## Quick Start

### 1. Get Your API Key

Sign up at [eigensparse.com](https://eigensparse.com) as a Data Fiduciary and get your API key from the dashboard.

### 2. Initialize the Client

```javascript
const Eigensparse = require('eigensparse-sdk');

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});
```

### 3. Check Consent Before Processing Data

```javascript
async function processUserData(userEmail) {
  const hasConsent = await client.hasConsent(userEmail, 'marketing-purpose-uuid');

  if (!hasConsent) {
    throw new Error('User consent required for this operation');
  }

  // Safe to process user data
}
```

---

## Usage Examples

### Browser Integration

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/eigensparse-sdk/dist/eigensparse.min.js"></script>
</head>
<body>
  <div id="consent-widget"></div>

  <script>
    const client = Eigensparse.createClient({
      baseUrl: 'https://eigensparse-api.onrender.com/api',
      apiKey: 'your-api-key'
    });

    // Check if user has consented
    async function checkAndShowWidget(userEmail) {
      const hasConsent = await client.hasConsent(userEmail, 'analytics-uuid');

      if (!hasConsent) {
        // Show consent widget
        client.renderWidget('#consent-widget', {
          theme: 'light',
          onConsent: (purposeIds) => {
            console.log('User consented to:', purposeIds);
            location.reload();
          }
        });
      }
    }
  </script>
</body>
</html>
```

### Express.js Middleware

```javascript
const express = require('express');
const Eigensparse = require('eigensparse-sdk');

const app = express();
const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

// Middleware to require consent
function requireConsent(purposeUuid) {
  return async (req, res, next) => {
    try {
      const hasConsent = await client.hasConsent(req.user.email, purposeUuid);

      if (!hasConsent) {
        return res.status(403).json({
          error: 'Consent required',
          purpose_uuid: purposeUuid,
          consent_url: 'https://eigensparse.com/consent'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Protected route - requires marketing consent
app.get('/api/recommendations', requireConsent('marketing-uuid'), (req, res) => {
  res.json({ recommendations: [...] });
});

// Protected route - requires analytics consent
app.post('/api/track', requireConsent('analytics-uuid'), (req, res) => {
  // Track user behavior
});
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';
import Eigensparse from 'eigensparse-sdk';

const client = Eigensparse.createClient({
  baseUrl: process.env.REACT_APP_EIGENSPARSE_URL,
  apiKey: process.env.REACT_APP_EIGENSPARSE_KEY
});

function useConsent(userEmail, purposeUuid) {
  const [hasConsent, setHasConsent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.hasConsent(userEmail, purposeUuid)
      .then(setHasConsent)
      .catch(() => setHasConsent(false))
      .finally(() => setLoading(false));
  }, [userEmail, purposeUuid]);

  return { hasConsent, loading };
}

// Usage
function MarketingBanner({ userEmail }) {
  const { hasConsent, loading } = useConsent(userEmail, 'marketing-uuid');

  if (loading) return <Spinner />;
  if (!hasConsent) return <ConsentRequest />;

  return <PersonalizedBanner />;
}
```

---

## API Reference

### Initialization

```javascript
const client = Eigensparse.createClient(config);
```

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `baseUrl` | `string` | Yes | Eigensparse API URL |
| `apiKey` | `string` | Yes | Your Data Fiduciary API key |
| `debug` | `boolean` | No | Enable debug logging |

---

### Consent Methods

#### `checkConsent(email)`
Get full consent status for a user.

```javascript
const status = await client.checkConsent('user@example.com');
// Returns: { has_consent: true, consents: [...] }
```

#### `hasConsent(email, purposeUuid)`
Check if user has consented to a specific purpose.

```javascript
const allowed = await client.hasConsent('user@example.com', 'purpose-uuid');
// Returns: true | false
```

#### `getUserConsents(email)`
Get all consents for a user.

```javascript
const consents = await client.getUserConsents('user@example.com');
// Returns: Array of consent objects
```

---

### Purpose Methods

#### `getPurposes()`
Get all purposes defined by your organization.

```javascript
const purposes = await client.getPurposes();
```

#### `createPurpose(data)`
Create a new data processing purpose.

```javascript
const purpose = await client.createPurpose({
  name: 'Marketing Analytics',
  description: 'Track user behavior for personalized marketing',
  data_categories: ['Usage Data', 'Device Info'],
  retention_period_days: 365,
  legal_basis: 'consent',
  is_mandatory: false
});
```

---

### UI Components

#### `renderWidget(selector, options)`
Render a consent management widget.

```javascript
client.renderWidget('#container', {
  theme: 'light',      // 'light' | 'dark'
  locale: 'en',        // 'en' | 'hi'
  onConsent: (ids) => console.log('Consented:', ids),
  onDeny: () => console.log('Denied')
});
```

#### `showBanner(options)` / `hideBanner()`
Show or hide a consent banner.

```javascript
client.showBanner({
  onAccept: () => console.log('Accepted'),
  onManage: () => client.renderWidget('#modal')
});
```

---

## Legal Basis Options

| Value | Use Case |
|-------|----------|
| `consent` | User explicitly agrees (marketing, analytics) |
| `contract` | Required to deliver a service |
| `legal_obligation` | Required by law (tax records) |
| `vital_interests` | Protect someone's life |
| `public_task` | Government/public authority |
| `legitimate_interests` | Business necessity (fraud prevention) |

---

## Error Handling

```javascript
try {
  await client.checkConsent('user@example.com');
} catch (error) {
  if (error instanceof Eigensparse.EigensparseError) {
    console.error('Eigensparse Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Error Code:', error.code);
  }
}
```

---

## TypeScript Support

Full TypeScript definitions are included.

```typescript
import Eigensparse, {
  EigensparseClient,
  ConsentStatus,
  Purpose
} from 'eigensparse-sdk';

const client: EigensparseClient = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});

const status: ConsentStatus = await client.checkConsent('user@example.com');
const purposes: Purpose[] = await client.getPurposes();
```

---

## Resources

- **Platform**: [eigensparse.com](https://eigensparse.com)
- **API Docs**: [eigensparse-api.onrender.com/docs](https://eigensparse-api.onrender.com/docs)
- **GitHub**: [github.com/Ni8crawler18/Phloem](https://github.com/Ni8crawler18/Phloem)

---

## License

MIT © [Ni8crawler18](https://github.com/Ni8crawler18)