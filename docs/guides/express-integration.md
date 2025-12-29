# Express.js Integration Guide

Complete guide for integrating Eigensparse with Express.js applications.

---

## Installation

```bash
npm install eigensparse-sdk express
```

---

## Setup

### 1. Initialize the Client

Create a dedicated file for the Eigensparse client:

```javascript
// lib/eigensparse.js
const Eigensparse = require('eigensparse-sdk');

const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_URL || 'https://eigensparse-api.onrender.com/api',
  apiKey: process.env.EIGENSPARSE_API_KEY,
  debug: process.env.NODE_ENV !== 'production'
});

module.exports = client;
```

### 2. Create Middleware

```javascript
// middleware/consent.js
const eigensparse = require('../lib/eigensparse');

function requireConsent(purposeUuid) {
  return async (req, res, next) => {
    // Get user email from your auth system
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    try {
      const hasConsent = await eigensparse.hasConsent(userEmail, purposeUuid);

      if (!hasConsent) {
        return res.status(403).json({
          error: 'Consent required',
          code: 'CONSENT_REQUIRED',
          purpose_uuid: purposeUuid,
          consent_url: `https://eigensparse.com/consent?purpose=${purposeUuid}`
        });
      }

      // Attach consent info to request for logging
      req.consentVerified = {
        purposeUuid,
        verifiedAt: new Date().toISOString()
      };

      next();
    } catch (error) {
      console.error('Consent verification failed:', error);

      // Fail open or closed based on your requirements
      // Fail closed (safer):
      return res.status(500).json({
        error: 'Consent verification failed',
        code: 'CONSENT_CHECK_ERROR'
      });

      // Fail open (less safe but more available):
      // next();
    }
  };
}

module.exports = { requireConsent };
```

---

## Basic Usage

```javascript
// app.js
const express = require('express');
const { requireConsent } = require('./middleware/consent');

const app = express();
app.use(express.json());

// Public route - no consent needed
app.get('/api/public', (req, res) => {
  res.json({ message: 'Public data' });
});

// Protected route - requires marketing consent
app.get('/api/recommendations',
  requireConsent('marketing-purpose-uuid'),
  (req, res) => {
    res.json({
      recommendations: ['Product A', 'Product B'],
      consent_verified: req.consentVerified
    });
  }
);

// Protected route - requires analytics consent
app.post('/api/track',
  requireConsent('analytics-purpose-uuid'),
  (req, res) => {
    // Track user behavior
    console.log('Tracking event:', req.body);
    res.json({ success: true });
  }
);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## Multiple Purpose Checks

For routes requiring multiple consents:

```javascript
// middleware/consent.js
function requireAllConsents(purposeUuids) {
  return async (req, res, next) => {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const results = await Promise.all(
        purposeUuids.map(uuid =>
          eigensparse.hasConsent(userEmail, uuid)
            .then(hasConsent => ({ uuid, hasConsent }))
        )
      );

      const missing = results.filter(r => !r.hasConsent);

      if (missing.length > 0) {
        return res.status(403).json({
          error: 'Multiple consents required',
          missing_consents: missing.map(m => m.uuid)
        });
      }

      next();
    } catch (error) {
      console.error('Consent verification failed:', error);
      return res.status(500).json({ error: 'Consent verification failed' });
    }
  };
}

module.exports = { requireConsent, requireAllConsents };
```

Usage:

```javascript
app.get('/api/personalized-analytics',
  requireAllConsents(['analytics-uuid', 'personalization-uuid']),
  (req, res) => {
    res.json({ data: 'Personalized analytics' });
  }
);
```

---

## Caching Consent Status

For performance, cache consent status:

```javascript
// lib/eigensparse.js
const Eigensparse = require('eigensparse-sdk');
const NodeCache = require('node-cache');

const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

// Cache consent status for 5 minutes
const consentCache = new NodeCache({ stdTTL: 300 });

async function hasConsentCached(email, purposeUuid) {
  const cacheKey = `${email}:${purposeUuid}`;

  let hasConsent = consentCache.get(cacheKey);

  if (hasConsent === undefined) {
    hasConsent = await client.hasConsent(email, purposeUuid);
    consentCache.set(cacheKey, hasConsent);
  }

  return hasConsent;
}

// Invalidate cache when consent changes
function invalidateConsentCache(email) {
  const keys = consentCache.keys().filter(k => k.startsWith(email));
  keys.forEach(k => consentCache.del(k));
}

module.exports = {
  client,
  hasConsentCached,
  invalidateConsentCache
};
```

---

## Error Handling

```javascript
// middleware/errorHandler.js
function consentErrorHandler(err, req, res, next) {
  if (err.name === 'EigensparseError') {
    return res.status(err.statusCode || 500).json({
      error: 'Consent service error',
      message: err.message,
      code: err.code
    });
  }
  next(err);
}

module.exports = { consentErrorHandler };
```

```javascript
// app.js
const { consentErrorHandler } = require('./middleware/errorHandler');

// ... routes ...

// Add error handler after routes
app.use(consentErrorHandler);
```

---

## Environment Configuration

```bash
# .env
EIGENSPARSE_URL=https://eigensparse-api.onrender.com/api
EIGENSPARSE_API_KEY=your-api-key

# Purpose UUIDs
MARKETING_PURPOSE_UUID=abc-123-...
ANALYTICS_PURPOSE_UUID=def-456-...
```

```javascript
// config/purposes.js
module.exports = {
  MARKETING: process.env.MARKETING_PURPOSE_UUID,
  ANALYTICS: process.env.ANALYTICS_PURPOSE_UUID,
  PERSONALIZATION: process.env.PERSONALIZATION_PURPOSE_UUID
};
```

```javascript
// Usage
const purposes = require('./config/purposes');

app.get('/api/marketing',
  requireConsent(purposes.MARKETING),
  handler
);
```

---

## Full Example

```javascript
// Complete Express app with Eigensparse integration
require('dotenv').config();
const express = require('express');
const Eigensparse = require('eigensparse-sdk');

const app = express();
app.use(express.json());

// Initialize Eigensparse
const eigensparse = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

// Mock auth middleware (replace with your auth)
app.use((req, res, next) => {
  req.user = { email: req.headers['x-user-email'] };
  next();
});

// Consent middleware
const requireConsent = (purposeUuid) => async (req, res, next) => {
  if (!req.user?.email) {
    return res.status(401).json({ error: 'Auth required' });
  }

  try {
    const hasConsent = await eigensparse.hasConsent(
      req.user.email,
      purposeUuid
    );

    if (!hasConsent) {
      return res.status(403).json({
        error: 'Consent required',
        purpose_uuid: purposeUuid
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Consent check failed' });
  }
};

// Routes
app.get('/api/public', (req, res) => {
  res.json({ message: 'Public' });
});

app.get('/api/protected',
  requireConsent(process.env.PURPOSE_UUID),
  (req, res) => {
    res.json({ message: 'Protected data' });
  }
);

app.listen(3000, () => console.log('Running on :3000'));
```
