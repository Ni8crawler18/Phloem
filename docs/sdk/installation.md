# SDK Installation

How to install the Eigensparse SDK.

---

## npm

```bash
npm install eigensparse-sdk
```

---

## Yarn

```bash
yarn add eigensparse-sdk
```

---

## pnpm

```bash
pnpm add eigensparse-sdk
```

---

## CDN

Include directly in your HTML:

```html
<script src="https://unpkg.com/eigensparse-sdk/dist/eigensparse.min.js"></script>
```

Or use jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/eigensparse-sdk/dist/eigensparse.min.js"></script>
```

---

## Package Info

| Property | Value |
|----------|-------|
| Package Name | `eigensparse-sdk` |
| Latest Version | `1.0.1` |
| Bundle Size | ~8KB |
| License | MIT |

---

## Requirements

- **Node.js:** 14.0.0 or higher
- **Browser:** All modern browsers (Chrome, Firefox, Safari, Edge)

---

## Importing

### CommonJS (Node.js)

```javascript
const Eigensparse = require('eigensparse-sdk');
```

### ES Modules

```javascript
import Eigensparse from 'eigensparse-sdk';
```

### Browser (after CDN script)

```javascript
// Eigensparse is available globally
const client = Eigensparse.createClient({ ... });
```

---

## TypeScript

TypeScript definitions are included. No additional `@types` package needed.

```typescript
import Eigensparse, { EigensparseClient, ConsentStatus } from 'eigensparse-sdk';

const client: EigensparseClient = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});
```

---

## Verify Installation

```javascript
const Eigensparse = require('eigensparse-sdk');

console.log(Eigensparse.VERSION); // Should print version number

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'test'
});

console.log('SDK initialized successfully');
```

---

## Next Steps

- [Configuration](configuration.md) - Configure the SDK
- [Methods](methods.md) - Available SDK methods
- [Examples](examples.md) - Usage examples
