# Quick Start

Get up and running with Eigensparse in under 5 minutes.

---

## Step 1: Create a Fiduciary Account

1. Go to [eigensparse.com/register](https://eigensparse.com/register)
2. Select **"Data Fiduciary (Company)"**
3. Enter your organization details
4. Click **Register**

---

## Step 2: Create a Purpose

After logging in:

1. Navigate to your **Dashboard**
2. Click **"Create Purpose"**
3. Fill in the purpose details:

```
Name: Marketing Analytics
Description: Track user behavior for personalized marketing
Data Categories: Usage Data, Device Info
Retention Period: 365 days
Legal Basis: consent
```

4. Click **Create**

---

## Step 3: Get Your API Key

1. In your dashboard, locate the **API Key** section
2. Click **Copy** to copy your API key
3. Store it securely (you'll need it for SDK integration)

---

## Step 4: Install the SDK

```bash
npm install eigensparse-sdk
```

Or via CDN:

```html
<script src="https://unpkg.com/eigensparse-sdk/dist/eigensparse.min.js"></script>
```

---

## Step 5: Initialize and Use

```javascript
const Eigensparse = require('eigensparse-sdk');

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});

// Check consent before processing user data
async function processUserData(userEmail) {
  const hasConsent = await client.hasConsent(userEmail, 'purpose-uuid');

  if (hasConsent) {
    // Safe to process
    console.log('User has consented');
  } else {
    // Request consent first
    console.log('Consent required');
  }
}
```

---

## Next Steps

- [Core Concepts](concepts.md) - Understand the consent model
- [Authentication](authentication.md) - Learn about API authentication
- [SDK Methods](../sdk/methods.md) - Explore all SDK methods
