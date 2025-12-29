import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Terminal, Code, Package, Play, ArrowRight } from 'lucide-react';

export default function SdkDemo() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('install');

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeExamples = {
    install: {
      title: 'Installation',
      description: 'Install via npm or include via CDN',
      snippets: [
        {
          label: 'npm',
          code: `npm install eigensparse-sdk`,
        },
        {
          label: 'CDN',
          code: `<script src="https://unpkg.com/eigensparse-sdk/dist/eigensparse.min.js"></script>`,
        },
      ],
    },
    init: {
      title: 'Initialize Client',
      description: 'Create a client instance with your API key',
      snippets: [
        {
          label: 'Node.js',
          code: `const Eigensparse = require('eigensparse-sdk');

const client = Eigensparse.createClient({
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'your-api-key'
});`,
        },
        {
          label: 'Browser',
          code: `<script src="https://unpkg.com/eigensparse-sdk/dist/eigensparse.min.js"></script>
<script>
  const client = Eigensparse.createClient({
    baseUrl: 'https://eigensparse-api.onrender.com/api',
    apiKey: 'your-api-key'
  });
</script>`,
        },
      ],
    },
    check: {
      title: 'Check Consent',
      description: 'Verify if a user has consented to a specific purpose',
      snippets: [
        {
          label: 'Check Consent',
          code: `// Check if user has consented to a purpose
const hasConsent = await client.hasConsent(
  'user@example.com',
  'purpose-uuid'
);

if (hasConsent) {
  // Safe to process user data
  processUserData();
} else {
  // Request consent first
  showConsentDialog();
}`,
        },
        {
          label: 'Get All Consents',
          code: `// Get full consent status for a user
const status = await client.checkConsent('user@example.com');

console.log(status);
// {
//   has_consent: true,
//   consents: [
//     { purpose: 'marketing', granted_at: '2024-01-15' },
//     { purpose: 'analytics', granted_at: '2024-01-15' }
//   ]
// }`,
        },
      ],
    },
    middleware: {
      title: 'Express Middleware',
      description: 'Protect API routes with consent checks',
      snippets: [
        {
          label: 'Middleware',
          code: `const express = require('express');
const Eigensparse = require('eigensparse-sdk');

const app = express();
const client = Eigensparse.createClient({
  baseUrl: process.env.EIGENSPARSE_URL,
  apiKey: process.env.EIGENSPARSE_API_KEY
});

// Middleware to require consent
function requireConsent(purposeUuid) {
  return async (req, res, next) => {
    const hasConsent = await client.hasConsent(
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
  };
}

// Protected route
app.get('/api/analytics',
  requireConsent('analytics-uuid'),
  (req, res) => {
    // Process analytics data
  }
);`,
        },
      ],
    },
    react: {
      title: 'React Hook',
      description: 'Custom hook for consent management in React apps',
      snippets: [
        {
          label: 'useConsent Hook',
          code: `import { useState, useEffect } from 'react';
import Eigensparse from 'eigensparse-sdk';

const client = Eigensparse.createClient({
  baseUrl: process.env.REACT_APP_API_URL,
  apiKey: process.env.REACT_APP_API_KEY
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

// Usage in component
function MarketingBanner({ userEmail }) {
  const { hasConsent, loading } = useConsent(
    userEmail,
    'marketing-uuid'
  );

  if (loading) return <Spinner />;
  if (!hasConsent) return <ConsentRequest />;

  return <PersonalizedContent />;
}`,
        },
      ],
    },
  };

  const tabs = [
    { id: 'install', label: 'Install', icon: Package },
    { id: 'init', label: 'Initialize', icon: Terminal },
    { id: 'check', label: 'Check Consent', icon: Code },
    { id: 'middleware', label: 'Middleware', icon: Play },
    { id: 'react', label: 'React', icon: Code },
  ];

  const currentExample = codeExamples[activeTab];

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Hero */}
      <section style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '64px 0',
      }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="badge badge-primary" style={{ marginBottom: '16px' }}>
              SDK Documentation
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              Eigensparse <span style={{ color: 'var(--color-primary)' }}>SDK</span>
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1.125rem',
              maxWidth: '600px',
              margin: '0 auto 24px',
            }}>
              Integrate consent management into your application in minutes.
              DPDP Act 2023 & GDPR compliant.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <a
                href="https://www.npmjs.com/package/eigensparse-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Package size={16} />
                View on npm
              </a>
              <a
                href="https://github.com/Ni8crawler18/Phloem"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section style={{
        background: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
        padding: '24px 0',
      }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '48px',
          }}>
            {[
              { label: 'Package', value: 'eigensparse-sdk' },
              { label: 'Version', value: '1.0.1' },
              { label: 'Size', value: '~8KB' },
              { label: 'License', value: 'MIT' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: 'var(--color-text)',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section style={{ padding: '64px 0' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Example Content */}
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '8px',
            }}>
              {currentExample.title}
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              marginBottom: '24px',
            }}>
              {currentExample.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentExample.snippets.map((snippet, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                    }}>
                      // {snippet.label}
                    </span>
                    <button
                      onClick={() => copyToClipboard(snippet.code, `${activeTab}-${index}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        color: copiedIndex === `${activeTab}-${index}` ? 'var(--color-success)' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {copiedIndex === `${activeTab}-${index}` ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre style={{
                    background: '#0d1117',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    overflow: 'auto',
                    margin: 0,
                  }}>
                    <code style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: '#e6edf3',
                      lineHeight: '1.6',
                    }}>
                      {snippet.code}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* API Methods Quick Reference */}
      <section style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '64px 0',
      }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            API Methods
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {[
              {
                method: 'hasConsent(email, purposeUuid)',
                returns: 'boolean',
                desc: 'Check if user consented to a purpose',
              },
              {
                method: 'checkConsent(email)',
                returns: 'ConsentStatus',
                desc: 'Get full consent status for user',
              },
              {
                method: 'getUserConsents(email)',
                returns: 'Consent[]',
                desc: 'Get all consents for a user',
              },
              {
                method: 'getPurposes()',
                returns: 'Purpose[]',
                desc: 'Get all defined purposes',
              },
              {
                method: 'createPurpose(data)',
                returns: 'Purpose',
                desc: 'Create a new data purpose',
              },
              {
                method: 'renderWidget(selector, opts)',
                returns: 'void',
                desc: 'Render consent UI widget',
              },
            ].map((api, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  color: 'var(--color-primary)',
                  marginBottom: '8px',
                }}>
                  {api.method}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '8px',
                }}>
                  {api.desc}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}>
                  Returns: <span style={{ color: 'var(--color-success)' }}>{api.returns}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section style={{ padding: '64px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            marginBottom: '16px',
          }}>
            Ready to integrate?
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
          }}>
            Sign up as a Data Fiduciary to get your API key and start managing consent.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get API Key
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
