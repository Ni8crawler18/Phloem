# Eigensparse SDK

JavaScript SDK for Eigensparse Consent Management System.

**DPDP Act 2023 (India) & GDPR (EU) Compliant**

## Installation

### npm
```bash
npm install @eigensparse/sdk
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@eigensparse/sdk/dist/eigensparse.min.js"></script>
```

## Quick Start

### Browser
```html
<script src="eigensparse.min.js"></script>
<script>
  const client = Eigensparse.createClient({
    baseUrl: 'https://api.your-domain.com',
    apiKey: 'your-fiduciary-api-key'
  });

  // Check consent before processing
  const hasConsent = await client.hasConsent('user@example.com', 'purpose-uuid');

  if (!hasConsent) {
    client.renderWidget('#consent-container', {
      theme: 'light',
      onConsent: (purposeUuids) => console.log('Consented:', purposeUuids)
    });
  }
</script>
```

### Node.js
```javascript
const Eigensparse = require('@eigensparse/sdk');

const client = Eigensparse.createClient({
  baseUrl: process.env.API_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

// Verify consent before processing
async function processUserData(userEmail) {
  const hasConsent = await client.hasConsent(userEmail, 'data-processing-uuid');
  if (!hasConsent) {
    throw new Error('User consent required');
  }
  // Process data...
}
```

## API Reference

### `createClient(config)`

| Option | Type | Description |
|--------|------|-------------|
| `baseUrl` | string | API base URL |
| `apiKey` | string | Data Fiduciary API key |
| `debug` | boolean | Enable console logging |

### Consent Verification

```javascript
// Full consent status
const status = await client.checkConsent('user@example.com');
// { has_consent: true, consents: [...] }

// Boolean check for specific purpose
const hasConsent = await client.hasConsent('user@example.com', 'purpose-uuid');

// Get all user consents
const consents = await client.getUserConsents('user@example.com');
```

### Purpose Management

```javascript
// Get all purposes for your organization
const purposes = await client.getPurposes();

// Create a new purpose
const purpose = await client.createPurpose({
  name: 'Marketing Analytics',
  description: 'Track user behavior for marketing',
  data_categories: ['Usage Data', 'Device Info'],
  retention_period_days: 365,
  legal_basis: 'consent',
  is_mandatory: false
});
```

### UI Components

```javascript
// Render consent widget
await client.renderWidget('#container', {
  theme: 'light',        // or 'dark'
  locale: 'en',          // or 'hi'
  onConsent: (ids) => {},
  onDeny: () => {}
});

// Show consent banner
client.showBanner({
  onAccept: () => {},
  onManage: () => client.renderWidget('#modal')
});

// Hide banner
client.hideBanner();
```

## Express.js Middleware

```javascript
const Eigensparse = require('@eigensparse/sdk');
const client = Eigensparse.createClient({ apiKey: process.env.API_KEY });

function requireConsent(purposeUuid) {
  return async (req, res, next) => {
    const hasConsent = await client.hasConsent(req.user.email, purposeUuid);
    if (!hasConsent) {
      return res.status(403).json({ error: 'Consent required', purpose_uuid: purposeUuid });
    }
    next();
  };
}

// Usage
app.get('/analytics', requireConsent('analytics-uuid'), (req, res) => {
  // Process analytics...
});
```

## Legal Basis Options

| Value | Description |
|-------|-------------|
| `consent` | User explicitly agrees |
| `contract` | Required for service delivery |
| `legal_obligation` | Required by law |
| `vital_interests` | Protect someone's life |
| `public_task` | Public authority function |
| `legitimate_interests` | Business necessity |

## Error Handling

```javascript
try {
  await client.checkConsent('user@example.com');
} catch (error) {
  if (error instanceof Eigensparse.EigensparseError) {
    console.error(`Error: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
    console.error(`Code: ${error.code}`);
  }
}
```

## TypeScript

Full type definitions included:

```typescript
import Eigensparse, { EigensparseClient, ConsentStatus, Purpose } from '@eigensparse/sdk';

const client: EigensparseClient = Eigensparse.createClient({ apiKey: 'key' });
const status: ConsentStatus = await client.checkConsent('user@example.com');
const purposes: Purpose[] = await client.getPurposes();
```

## License

MIT
