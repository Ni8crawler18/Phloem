# SDK Examples

Practical examples of using the Eigensparse SDK.

---

## Basic Consent Check

```javascript
const Eigensparse = require('eigensparse-sdk');

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});

async function main() {
  const hasConsent = await client.hasConsent(
    'user@example.com',
    'marketing-purpose-uuid'
  );

  if (hasConsent) {
    console.log('User has consented - safe to process data');
  } else {
    console.log('Consent required before processing');
  }
}

main();
```

---

## Express.js Middleware

```javascript
const express = require('express');
const Eigensparse = require('eigensparse-sdk');

const app = express();
const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

// Middleware factory
function requireConsent(purposeUuid) {
  return async (req, res, next) => {
    try {
      // Assumes req.user.email is set by auth middleware
      const hasConsent = await client.hasConsent(
        req.user.email,
        purposeUuid
      );

      if (!hasConsent) {
        return res.status(403).json({
          error: 'Consent required',
          purpose_uuid: purposeUuid,
          consent_url: 'https://eigensparse.com'
        });
      }

      next();
    } catch (error) {
      console.error('Consent check failed:', error);
      next(error);
    }
  };
}

// Routes
app.get('/api/analytics',
  requireConsent('analytics-uuid'),
  (req, res) => {
    res.json({ data: 'Analytics data here' });
  }
);

app.post('/api/marketing/subscribe',
  requireConsent('marketing-uuid'),
  (req, res) => {
    res.json({ message: 'Subscribed to marketing' });
  }
);

app.listen(3000);
```

---

## React Hook

```javascript
import { useState, useEffect } from 'react';
import Eigensparse from 'eigensparse-sdk';

const client = Eigensparse.createClient({
  baseUrl: import.meta.env.VITE_EIGENSPARSE_URL,
  apiKey: import.meta.env.VITE_EIGENSPARSE_KEY
});

// Custom hook
function useConsent(userEmail, purposeUuid) {
  const [hasConsent, setHasConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userEmail || !purposeUuid) {
      setLoading(false);
      return;
    }

    client.hasConsent(userEmail, purposeUuid)
      .then(result => {
        setHasConsent(result);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setHasConsent(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userEmail, purposeUuid]);

  return { hasConsent, loading, error };
}

// Usage in component
function PersonalizedContent({ userEmail }) {
  const { hasConsent, loading, error } = useConsent(
    userEmail,
    'personalization-uuid'
  );

  if (loading) {
    return <div>Checking consent...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!hasConsent) {
    return (
      <div>
        <p>Enable personalization for a better experience</p>
        <button onClick={() => window.location.href = '/consent'}>
          Manage Preferences
        </button>
      </div>
    );
  }

  return <div>Personalized content here!</div>;
}

export { useConsent, PersonalizedContent };
```

---

## Next.js API Route

```javascript
// pages/api/user-data.js
import Eigensparse from 'eigensparse-sdk';

const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const hasConsent = await client.hasConsent(
      email,
      process.env.DATA_ACCESS_PURPOSE_UUID
    );

    if (!hasConsent) {
      return res.status(403).json({
        error: 'Consent required',
        message: 'User has not consented to data access'
      });
    }

    // Fetch and return user data
    const userData = await fetchUserData(email);
    res.json(userData);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Browser Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Consent Demo</title>
  <script src="https://unpkg.com/eigensparse-sdk/dist/eigensparse.min.js"></script>
</head>
<body>
  <div id="app">
    <h1>Welcome</h1>
    <div id="consent-status"></div>
    <div id="consent-widget"></div>
  </div>

  <script>
    const client = Eigensparse.createClient({
      baseUrl: 'https://eigensparse-api.onrender.com/api',
      apiKey: 'your-api-key'
    });

    const userEmail = 'user@example.com'; // Get from auth

    async function checkAndDisplayConsent() {
      const statusDiv = document.getElementById('consent-status');

      try {
        const status = await client.checkConsent(userEmail);

        if (status.has_consent) {
          statusDiv.innerHTML = `
            <p style="color: green;">
              ✓ You have granted consent for ${status.consents.length} purpose(s)
            </p>
          `;
        } else {
          statusDiv.innerHTML = `
            <p style="color: orange;">
              ⚠ Please review and grant consent
            </p>
          `;

          // Show consent widget
          client.renderWidget('#consent-widget', {
            theme: 'light',
            onConsent: (ids) => {
              alert('Thank you for your consent!');
              location.reload();
            }
          });
        }
      } catch (error) {
        statusDiv.innerHTML = `
          <p style="color: red;">Error: ${error.message}</p>
        `;
      }
    }

    checkAndDisplayConsent();
  </script>
</body>
</html>
```

---

## Batch Consent Check

```javascript
async function checkMultipleConsents(userEmail, purposeUuids) {
  const results = await Promise.all(
    purposeUuids.map(async (uuid) => ({
      purposeUuid: uuid,
      hasConsent: await client.hasConsent(userEmail, uuid)
    }))
  );

  return results.reduce((acc, { purposeUuid, hasConsent }) => {
    acc[purposeUuid] = hasConsent;
    return acc;
  }, {});
}

// Usage
const consents = await checkMultipleConsents('user@example.com', [
  'marketing-uuid',
  'analytics-uuid',
  'personalization-uuid'
]);

console.log(consents);
// {
//   'marketing-uuid': true,
//   'analytics-uuid': false,
//   'personalization-uuid': true
// }
```

---

## Error Handling

```javascript
async function safeConsentCheck(email, purposeUuid) {
  try {
    return await client.hasConsent(email, purposeUuid);
  } catch (error) {
    if (error instanceof Eigensparse.EigensparseError) {
      switch (error.statusCode) {
        case 401:
          console.error('Invalid API key');
          break;
        case 404:
          console.error('Purpose not found');
          break;
        case 429:
          console.error('Rate limited - try again later');
          break;
        default:
          console.error('API error:', error.message);
      }
    } else {
      console.error('Network error:', error.message);
    }

    // Default to false on error (fail-safe)
    return false;
  }
}
```
