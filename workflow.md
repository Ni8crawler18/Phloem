# Eigensparse Demo Workflow

A step-by-step guide to demonstrate the Consent Management System.

---

## Quick Links

| Resource | URL |
|----------|-----|
| Platform | https://eigensparse.com |
| API Docs | https://eigensparse-api.onrender.com/docs |
| SDK Demo | https://eigensparse.com/sdk-demo |
| npm Package | https://www.npmjs.com/package/eigensparse-sdk |
| GitHub | https://github.com/Ni8crawler18/Phloem |

---

## Demo Flow Overview

```
1. Landing Page → Show platform overview
2. Register Fiduciary → Create a company account
3. Create Purpose → Define data processing purpose
4. Get API Key → Copy API key for SDK
5. Register User → Create a data principal account
6. Grant Consent → User grants consent to company
7. Download Receipt → Get PDF receipt
8. SDK Integration → Show how developers integrate
9. Revoke Consent → Demonstrate withdrawal
```

---

## Part 1: Platform Overview (2 min)

### 1.1 Landing Page
1. Open https://eigensparse.com
2. Highlight key points:
   - **DPDP Act 2023 & GDPR compliant**
   - Three-party model: Principal → Fiduciary → Eigensparse
   - Cryptographic receipts (SHA-256)

### 1.2 Key Terminology
| Term | Meaning |
|------|---------|
| Data Principal | End user whose data is being processed |
| Data Fiduciary | Company that processes user data |
| Purpose | Specific reason for data processing |
| Consent Receipt | Cryptographic proof of consent |

---

## Part 2: Data Fiduciary Flow (5 min)

### 2.1 Register as Fiduciary
1. Click **"Get Started"**
2. Select **"Data Fiduciary (Company)"**
3. Fill in:
   - Company Name: `Demo Corp`
   - Email: `demo@company.com`
   - Password: `your-password`
4. Click **Register**

### 2.2 Fiduciary Dashboard
After login, you'll see:
- **API Key** (for SDK integration)
- **Purposes** (data processing purposes)
- **Consents** (granted consents from users)

### 2.3 Create a Purpose
1. Click **"Create Purpose"**
2. Fill in:
   ```
   Name: Marketing Analytics
   Description: Track user behavior for personalized marketing
   Data Categories: Usage Data, Device Info
   Retention Period: 365 days
   Legal Basis: consent
   ```
3. Click **Create**

### 2.4 Copy API Key
1. Find your API key in the dashboard
2. Click **Copy** (needed for SDK demo later)

---

## Part 3: Data Principal Flow (5 min)

### 3.1 Register as User
1. Open new incognito window
2. Go to https://eigensparse.com/register
3. Select **"Data Principal (User)"**
4. Fill in:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `your-password`
5. Click **Register**

### 3.2 User Dashboard
Shows:
- Available fiduciaries and their purposes
- Active consents
- Consent history

### 3.3 Grant Consent
1. Find **"Demo Corp"** in the list
2. Click **"View Purposes"**
3. Select **"Marketing Analytics"**
4. Click **"Grant Consent"**
5. Consent is now active

### 3.4 Download Receipt
1. In **"My Consents"** section
2. Find the granted consent
3. Click **"Download Receipt"**
4. PDF downloads with:
   - Receipt ID
   - User & Company info
   - Purpose details
   - SHA-256 signature

---

## Part 4: SDK Integration Demo (5 min)

### 4.1 Show SDK Demo Page
1. Navigate to https://eigensparse.com/sdk-demo
2. Walk through the tabs:
   - **Install** - npm/CDN options
   - **Initialize** - Client setup
   - **Check Consent** - Verify user consent
   - **Middleware** - Express.js integration
   - **React** - Hook example

### 4.2 Code Walkthrough

**Installation:**
```bash
npm install eigensparse-sdk
```

**Initialize:**
```javascript
const Eigensparse = require('eigensparse-sdk');

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key-from-dashboard'
});
```

**Check Consent Before Processing:**
```javascript
async function processUserData(userEmail) {
  const hasConsent = await client.hasConsent(
    userEmail,
    'marketing-purpose-uuid'
  );

  if (!hasConsent) {
    throw new Error('Consent required');
  }

  // Safe to process
  trackUserBehavior();
}
```

### 4.3 Express Middleware Example
```javascript
function requireConsent(purposeUuid) {
  return async (req, res, next) => {
    const hasConsent = await client.hasConsent(
      req.user.email,
      purposeUuid
    );

    if (!hasConsent) {
      return res.status(403).json({
        error: 'Consent required'
      });
    }
    next();
  };
}

// Usage
app.get('/api/analytics',
  requireConsent('analytics-uuid'),
  handleAnalytics
);
```

---

## Part 5: Consent Revocation (2 min)

### 5.1 Revoke Consent
1. Go to User Dashboard
2. Find active consent
3. Click **"Revoke"**
4. Confirm revocation

### 5.2 Show Impact
1. Consent status changes to **"Revoked"**
2. Timestamp recorded
3. SDK calls now return `false` for this user/purpose

---

## Part 6: API Documentation (Optional)

### 6.1 Swagger UI
1. Open https://eigensparse-api.onrender.com/docs
2. Show available endpoints:
   - `POST /api/consents/grant`
   - `POST /api/consents/revoke`
   - `GET /api/consents`
   - `GET /api/consents/{uuid}/receipt/pdf`

---

## Key Talking Points

### Why Eigensparse?

1. **Legal Compliance**
   - DPDP Act 2023 (India) - Section 6
   - GDPR (EU) - Article 7

2. **Audit Trail**
   - Every consent action logged
   - Cryptographic signatures
   - PDF receipts for users

3. **Developer Friendly**
   - Simple SDK integration
   - REST API
   - Express middleware
   - React hooks

4. **User Control**
   - Grant/revoke anytime
   - Purpose-specific consent
   - Transparent data usage

---

## Demo Checklist

- [ ] Landing page walkthrough
- [ ] Register fiduciary account
- [ ] Create data purpose
- [ ] Copy API key
- [ ] Register user account
- [ ] Grant consent
- [ ] Download PDF receipt
- [ ] Show SDK demo page
- [ ] Explain code examples
- [ ] Revoke consent
- [ ] Show API docs (optional)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API not responding | Check https://eigensparse-api.onrender.com/health |
| Login fails | Clear cookies, try incognito |
| PDF not downloading | Check browser popup blocker |
| CORS errors | Ensure using correct API URL |

---

## Architecture Summary

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Data Principal │     │ Data Fiduciary  │     │   Eigensparse   │
│     (User)      │     │    (Company)    │     │    (Platform)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  1. View Purposes     │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
         │  2. Grant Consent     │                       │
         ├───────────────────────┼──────────────────────►│
         │                       │                       │
         │  3. Consent Receipt   │                       │
         │◄──────────────────────┼───────────────────────┤
         │                       │                       │
         │                       │  4. Verify Consent    │
         │                       ├──────────────────────►│
         │                       │                       │
         │                       │  5. Consent Status    │
         │                       │◄──────────────────────┤
         │                       │                       │
         │  6. Revoke Consent    │                       │
         ├───────────────────────┼──────────────────────►│
         │                       │                       │
```

---

**Total Demo Time: ~15-20 minutes**