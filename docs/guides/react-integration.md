# React Integration Guide

Complete guide for integrating Eigensparse with React applications.

---

## Installation

```bash
npm install eigensparse-sdk
```

---

## Setup

### 1. Create Eigensparse Client

```javascript
// src/lib/eigensparse.js
import Eigensparse from 'eigensparse-sdk';

const client = Eigensparse.createClient({
  baseUrl: import.meta.env.VITE_EIGENSPARSE_URL,
  apiKey: import.meta.env.VITE_EIGENSPARSE_KEY
});

export default client;
```

### 2. Environment Variables

```bash
# .env
VITE_EIGENSPARSE_URL=https://eigensparse-api.onrender.com/api
VITE_EIGENSPARSE_KEY=your-api-key
```

---

## Custom Hook

Create a reusable consent hook:

```javascript
// src/hooks/useConsent.js
import { useState, useEffect, useCallback } from 'react';
import eigensparse from '../lib/eigensparse';

export function useConsent(userEmail, purposeUuid) {
  const [hasConsent, setHasConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkConsent = useCallback(async () => {
    if (!userEmail || !purposeUuid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await eigensparse.hasConsent(userEmail, purposeUuid);
      setHasConsent(result);
    } catch (err) {
      setError(err.message);
      setHasConsent(false);
    } finally {
      setLoading(false);
    }
  }, [userEmail, purposeUuid]);

  useEffect(() => {
    checkConsent();
  }, [checkConsent]);

  return {
    hasConsent,
    loading,
    error,
    refetch: checkConsent
  };
}

export function useConsentStatus(userEmail) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    eigensparse.checkConsent(userEmail)
      .then(setStatus)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userEmail]);

  return { status, loading, error };
}
```

---

## Context Provider

For app-wide consent state:

```javascript
// src/context/ConsentContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import eigensparse from '../lib/eigensparse';

const ConsentContext = createContext(null);

export function ConsentProvider({ children, userEmail }) {
  const [consents, setConsents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    eigensparse.checkConsent(userEmail)
      .then(status => {
        const consentMap = {};
        status.consents?.forEach(c => {
          consentMap[c.purpose_uuid] = c.status === 'granted';
        });
        setConsents(consentMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userEmail]);

  const hasConsent = (purposeUuid) => consents[purposeUuid] || false;

  const refreshConsents = async () => {
    setLoading(true);
    try {
      const status = await eigensparse.checkConsent(userEmail);
      const consentMap = {};
      status.consents?.forEach(c => {
        consentMap[c.purpose_uuid] = c.status === 'granted';
      });
      setConsents(consentMap);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConsentContext.Provider value={{
      consents,
      hasConsent,
      loading,
      refreshConsents
    }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsentContext() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsentContext must be used within ConsentProvider');
  }
  return context;
}
```

Usage:

```javascript
// src/App.jsx
import { ConsentProvider } from './context/ConsentContext';

function App() {
  const user = useAuth(); // Your auth hook

  return (
    <ConsentProvider userEmail={user?.email}>
      <Router>
        {/* Your routes */}
      </Router>
    </ConsentProvider>
  );
}
```

---

## Components

### Consent Gate Component

```javascript
// src/components/ConsentGate.jsx
import { useConsent } from '../hooks/useConsent';

export function ConsentGate({
  userEmail,
  purposeUuid,
  children,
  fallback,
  loadingComponent
}) {
  const { hasConsent, loading, error } = useConsent(userEmail, purposeUuid);

  if (loading) {
    return loadingComponent || <div>Checking consent...</div>;
  }

  if (error) {
    return <div>Error checking consent: {error}</div>;
  }

  if (!hasConsent) {
    return fallback || (
      <div>
        <p>This feature requires your consent.</p>
        <a href="/consent">Manage Preferences</a>
      </div>
    );
  }

  return children;
}
```

Usage:

```javascript
function Dashboard({ user }) {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Always visible */}
      <PublicStats />

      {/* Only visible with consent */}
      <ConsentGate
        userEmail={user.email}
        purposeUuid="analytics-uuid"
        fallback={<AnalyticsOptIn />}
      >
        <PersonalizedAnalytics />
      </ConsentGate>
    </div>
  );
}
```

### Consent Banner Component

```javascript
// src/components/ConsentBanner.jsx
import { useState } from 'react';
import { useConsentContext } from '../context/ConsentContext';

export function ConsentBanner({ purposeUuid, onAccept, onDecline }) {
  const { hasConsent } = useConsentContext();
  const [dismissed, setDismissed] = useState(false);

  if (hasConsent(purposeUuid) || dismissed) {
    return null;
  }

  return (
    <div className="consent-banner">
      <p>We'd like to use cookies to improve your experience.</p>
      <div className="consent-banner-actions">
        <button onClick={() => {
          onAccept?.();
          setDismissed(true);
        }}>
          Accept
        </button>
        <button onClick={() => {
          onDecline?.();
          setDismissed(true);
        }}>
          Decline
        </button>
        <a href="/consent">Manage Preferences</a>
      </div>
    </div>
  );
}
```

---

## Protected Routes

```javascript
// src/components/ConsentRoute.jsx
import { Navigate } from 'react-router-dom';
import { useConsent } from '../hooks/useConsent';
import { useAuth } from '../hooks/useAuth';

export function ConsentRoute({ purposeUuid, children, redirectTo = '/consent' }) {
  const { user } = useAuth();
  const { hasConsent, loading } = useConsent(user?.email, purposeUuid);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasConsent) {
    return <Navigate to={redirectTo} state={{ requiredPurpose: purposeUuid }} />;
  }

  return children;
}
```

Usage in router:

```javascript
// src/routes.jsx
import { ConsentRoute } from './components/ConsentRoute';

const routes = [
  {
    path: '/analytics',
    element: (
      <ConsentRoute purposeUuid="analytics-uuid">
        <AnalyticsPage />
      </ConsentRoute>
    )
  }
];
```

---

## Full Example

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsentProvider } from './context/ConsentContext';
import { ConsentGate } from './components/ConsentGate';

function AppContent() {
  const { user } = useAuth();

  return (
    <ConsentProvider userEmail={user?.email}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/consent" element={<ConsentManager />} />
        </Routes>
      </BrowserRouter>
    </ConsentProvider>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      <ConsentGate
        userEmail={user.email}
        purposeUuid={import.meta.env.VITE_MARKETING_PURPOSE}
        fallback={
          <div className="consent-prompt">
            <p>Enable personalized recommendations?</p>
            <a href="/consent">Enable</a>
          </div>
        }
      >
        <PersonalizedRecommendations />
      </ConsentGate>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

---

## TypeScript Support

```typescript
// src/hooks/useConsent.ts
import { useState, useEffect } from 'react';
import eigensparse from '../lib/eigensparse';

interface UseConsentResult {
  hasConsent: boolean | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useConsent(
  userEmail: string | undefined,
  purposeUuid: string
): UseConsentResult {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ... implementation
}
```
