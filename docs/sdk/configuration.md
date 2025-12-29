# SDK Configuration

Configure the Eigensparse SDK client.

---

## Basic Configuration

```javascript
const Eigensparse = require('eigensparse-sdk');

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});
```

---

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `baseUrl` | string | Yes | - | Eigensparse API base URL |
| `apiKey` | string | Yes | - | Your Data Fiduciary API key |
| `debug` | boolean | No | `false` | Enable console logging |
| `timeout` | number | No | `30000` | Request timeout in ms |

---

## Full Configuration Example

```javascript
const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'fid_abc123xyz',
  debug: true,
  timeout: 10000
});
```

---

## Environment Variables

Recommended setup for different environments:

### .env file

```bash
# Development
EIGENSPARSE_API_URL=https://eigensparse-api.onrender.com/api
EIGENSPARSE_API_KEY=your-dev-api-key

# Production (use separate .env.production)
EIGENSPARSE_API_URL=https://eigensparse-api.onrender.com/api
EIGENSPARSE_API_KEY=your-prod-api-key
```

### Usage

```javascript
const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_API_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY,
  debug: process.env.NODE_ENV !== 'production'
});
```

---

## React / Vite

```javascript
// vite.config.js exposes VITE_ prefixed env vars
const client = Eigensparse.createClient({
  baseUrl: import.meta.env.VITE_EIGENSPARSE_URL,
  apiKey: import.meta.env.VITE_EIGENSPARSE_KEY
});
```

```bash
# .env
VITE_EIGENSPARSE_URL=https://eigensparse-api.onrender.com/api
VITE_EIGENSPARSE_KEY=your-api-key
```

---

## Create React App

```javascript
const client = Eigensparse.createClient({
  baseUrl: process.env.REACT_APP_EIGENSPARSE_URL,
  apiKey: process.env.REACT_APP_EIGENSPARSE_KEY
});
```

```bash
# .env
REACT_APP_EIGENSPARSE_URL=https://eigensparse-api.onrender.com/api
REACT_APP_EIGENSPARSE_KEY=your-api-key
```

---

## Next.js

```javascript
// Use NEXT_PUBLIC_ prefix for client-side access
const client = Eigensparse.createClient({
  baseUrl: process.env.NEXT_PUBLIC_EIGENSPARSE_URL,
  apiKey: process.env.NEXT_PUBLIC_EIGENSPARSE_KEY
});
```

---

## Debug Mode

Enable debug mode to see API calls in the console:

```javascript
const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key',
  debug: true
});

// Console output:
// [Eigensparse] GET /sdk/verify-consent?email=user@example.com
// [Eigensparse] Response: { has_consent: true, ... }
```

---

## Multiple Clients

You can create multiple client instances if needed:

```javascript
const productionClient = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'prod-api-key'
});

const stagingClient = Eigensparse.createClient({
  baseUrl: 'https://staging-api.eigensparse.com/api',
  apiKey: 'staging-api-key'
});
```

---

## Security Notes

1. **Never expose API keys in client-side code** for production apps
2. For browser usage, consider using a backend proxy
3. Store API keys in environment variables, not in code
4. Use different API keys for development and production
