# SDK Methods

Complete reference for all Eigensparse SDK methods.

---

## Consent Verification

### hasConsent(email, purposeUuid)

Check if a user has consented to a specific purpose.

```javascript
const hasConsent = await client.hasConsent('user@example.com', 'purpose-uuid');

if (hasConsent) {
  // Process user data
} else {
  // Request consent
}
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `email` | string | User's email address |
| `purposeUuid` | string | UUID of the purpose |

**Returns:** `Promise<boolean>`

---

### checkConsent(email)

Get full consent status for a user.

```javascript
const status = await client.checkConsent('user@example.com');

console.log(status);
// {
//   has_consent: true,
//   consents: [
//     {
//       purpose_uuid: 'abc-123',
//       purpose_name: 'Marketing',
//       status: 'granted',
//       granted_at: '2024-01-15T10:30:00Z'
//     }
//   ]
// }
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `email` | string | User's email address |

**Returns:** `Promise<ConsentStatus>`

---

### getUserConsents(email)

Get all consents for a specific user.

```javascript
const consents = await client.getUserConsents('user@example.com');

consents.forEach(consent => {
  console.log(`${consent.purpose_name}: ${consent.status}`);
});
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `email` | string | User's email address |

**Returns:** `Promise<Consent[]>`

---

## Purpose Management

### getPurposes()

Get all purposes defined by your organization.

```javascript
const purposes = await client.getPurposes();

purposes.forEach(purpose => {
  console.log(purpose.name, purpose.legal_basis);
});
```

**Returns:** `Promise<Purpose[]>`

---

### createPurpose(data)

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

console.log('Created purpose:', purpose.uuid);
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Purpose name |
| `description` | string | Yes | Detailed description |
| `data_categories` | string[] | Yes | Data types collected |
| `retention_period_days` | number | Yes | Retention period |
| `legal_basis` | string | Yes | Legal basis |
| `is_mandatory` | boolean | No | Default: false |

**Returns:** `Promise<Purpose>`

---

## UI Components

### renderWidget(selector, options)

Render a consent management widget in the DOM.

```javascript
await client.renderWidget('#consent-container', {
  theme: 'light',
  locale: 'en',
  onConsent: (purposeIds) => {
    console.log('User consented to:', purposeIds);
  },
  onDeny: () => {
    console.log('User denied consent');
  }
});
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `selector` | string | CSS selector for container |
| `options` | object | Widget options |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | `'light'` | `'light'` or `'dark'` |
| `locale` | string | `'en'` | `'en'` or `'hi'` |
| `onConsent` | function | - | Callback when consent granted |
| `onDeny` | function | - | Callback when consent denied |

---

### showBanner(options)

Display a consent banner.

```javascript
client.showBanner({
  message: 'We use cookies to improve your experience',
  onAccept: () => {
    console.log('User accepted');
    client.hideBanner();
  },
  onManage: () => {
    client.renderWidget('#modal');
  }
});
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `message` | string | Banner message |
| `onAccept` | function | Accept button callback |
| `onManage` | function | Manage preferences callback |

---

### hideBanner()

Hide the consent banner.

```javascript
client.hideBanner();
```

---

## Error Handling

### EigensparseError

All SDK errors are instances of `EigensparseError`.

```javascript
try {
  await client.checkConsent('user@example.com');
} catch (error) {
  if (error instanceof Eigensparse.EigensparseError) {
    console.error('Message:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
  }
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `message` | string | Error message |
| `statusCode` | number | HTTP status code |
| `code` | string | Error code |

---

## TypeScript Types

```typescript
interface ConsentStatus {
  has_consent: boolean;
  consents: Consent[];
}

interface Consent {
  uuid: string;
  purpose_uuid: string;
  purpose_name: string;
  status: 'granted' | 'revoked' | 'expired';
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
}

interface Purpose {
  id: number;
  uuid: string;
  name: string;
  description: string;
  data_categories: string[];
  retention_period_days: number;
  legal_basis: string;
  is_mandatory: boolean;
}
```
