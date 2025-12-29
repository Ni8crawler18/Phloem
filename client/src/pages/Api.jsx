import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function Api() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const endpoints = [
    {
      category: 'Authentication',
      items: [
        { method: 'POST', path: '/api/auth/register', desc: 'Register a new user' },
        { method: 'POST', path: '/api/auth/login', desc: 'Login and get JWT token' },
        { method: 'GET', path: '/api/auth/me', desc: 'Get current user info' },
        { method: 'POST', path: '/api/auth/fiduciary/register', desc: 'Register a new fiduciary' },
        { method: 'POST', path: '/api/auth/fiduciary/login', desc: 'Fiduciary login' },
      ]
    },
    {
      category: 'Consents',
      items: [
        { method: 'GET', path: '/api/consents', desc: 'List all consents for current user' },
        { method: 'POST', path: '/api/consents/grant', desc: 'Grant consent for a purpose' },
        { method: 'POST', path: '/api/consents/revoke', desc: 'Revoke an existing consent' },
        { method: 'POST', path: '/api/consents/renew', desc: 'Renew an expiring consent' },
        { method: 'GET', path: '/api/consents/{uuid}/receipt', desc: 'Get consent receipt (JSON)' },
        { method: 'GET', path: '/api/consents/{uuid}/receipt/pdf', desc: 'Download consent receipt (PDF)' },
      ]
    },
    {
      category: 'Data Export',
      items: [
        { method: 'GET', path: '/api/consents/export/json', desc: 'Export all user data as JSON' },
        { method: 'GET', path: '/api/consents/export/csv', desc: 'Export all user data as CSV' },
      ]
    },
    {
      category: 'Settings',
      items: [
        { method: 'GET', path: '/api/settings/user/profile', desc: 'Get user profile' },
        { method: 'PUT', path: '/api/settings/user/profile', desc: 'Update user profile' },
        { method: 'POST', path: '/api/settings/user/change-password', desc: 'Change user password' },
        { method: 'POST', path: '/api/settings/user/delete-account', desc: 'Delete user account' },
        { method: 'GET', path: '/api/settings/fiduciary/profile', desc: 'Get fiduciary profile' },
        { method: 'PUT', path: '/api/settings/fiduciary/profile', desc: 'Update fiduciary profile' },
        { method: 'POST', path: '/api/settings/fiduciary/change-password', desc: 'Change fiduciary password' },
        { method: 'POST', path: '/api/settings/fiduciary/delete-account', desc: 'Delete fiduciary account' },
      ]
    },
    {
      category: 'Webhooks',
      items: [
        { method: 'GET', path: '/api/webhooks', desc: 'List all webhooks' },
        { method: 'POST', path: '/api/webhooks', desc: 'Create a new webhook' },
        { method: 'PUT', path: '/api/webhooks/{uuid}', desc: 'Update webhook' },
        { method: 'DELETE', path: '/api/webhooks/{uuid}', desc: 'Delete webhook' },
        { method: 'POST', path: '/api/webhooks/{uuid}/test', desc: 'Test webhook endpoint' },
        { method: 'GET', path: '/api/webhooks/{uuid}/deliveries', desc: 'Get webhook delivery logs' },
      ]
    },
    {
      category: 'Purposes',
      items: [
        { method: 'GET', path: '/api/purposes', desc: 'List all purposes' },
        { method: 'POST', path: '/api/purposes', desc: 'Create a new purpose (Fiduciary only)' },
        { method: 'GET', path: '/api/purposes/{id}', desc: 'Get purpose details' },
      ]
    },
    {
      category: 'SDK Endpoints',
      items: [
        { method: 'GET', path: '/api/sdk/verify-consent', desc: 'Verify user consent status' },
        { method: 'GET', path: '/api/sdk/purposes', desc: 'Get fiduciary purposes' },
      ]
    },
    {
      category: 'Dashboard',
      items: [
        { method: 'GET', path: '/api/dashboard/stats', desc: 'Get fiduciary statistics' },
        { method: 'GET', path: '/api/dashboard/consents', desc: 'Get consents for fiduciary' },
      ]
    },
    {
      category: 'Audit Logs',
      items: [
        { method: 'GET', path: '/api/audit-logs', desc: 'Get user audit logs' },
        { method: 'GET', path: '/api/audit-logs/fiduciary', desc: 'Get fiduciary audit logs' },
      ]
    },
  ];

  const methodColors = {
    GET: { bg: '#e7f5e7', color: '#1a7f1a' },
    POST: { bg: '#e7f0ff', color: '#1a56db' },
    PUT: { bg: '#fff7e7', color: '#b45309' },
    DELETE: { bg: '#fee7e7', color: '#dc2626' },
  };

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
              REST API
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
            }}>
              API <span style={{ color: 'var(--color-primary)' }}>Reference</span>
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1.125rem',
              maxWidth: '600px',
              margin: '0 auto 24px',
            }}>
              Complete REST API for consent management.
              All endpoints return JSON responses.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <a
                href="https://eigensparse-api.onrender.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <ExternalLink size={16} />
                Interactive Docs (Swagger)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Base URL */}
      <section style={{ padding: '32px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div className="flex-responsive" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)'
              }}>
                Base URL
              </span>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                color: 'var(--color-text)',
                marginTop: '4px',
                wordBreak: 'break-all'
              }}>
                https://eigensparse-api.onrender.com
              </div>
            </div>
            <button
              onClick={() => copyToClipboard('https://eigensparse-api.onrender.com', 'base')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: copiedIndex === 'base' ? 'var(--color-success)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
              }}
            >
              {copiedIndex === 'base' ? <Check size={16} /> : <Copy size={16} />}
              {copiedIndex === 'base' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </section>

      {/* Authentication Info */}
      <section style={{ padding: '32px 0', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Authentication</h2>
          <div className="auto-grid-sm" style={{ gap: '24px' }}>
            <div style={{
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>JWT Token (Users)</div>
              <code style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
              }}>
                Authorization: Bearer {'<token>'}
              </code>
            </div>
            <div style={{
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>API Key (SDK)</div>
              <code style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
              }}>
                X-API-Key: {'<api-key>'}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limiting */}
      <section style={{ padding: '32px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>Rate Limiting</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '0.9375rem' }}>
            All API endpoints are rate limited to prevent abuse. Limits vary by endpoint sensitivity.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { endpoint: 'Auth endpoints', limit: '5/min' },
              { endpoint: 'Consent operations', limit: '10/min' },
              { endpoint: 'Data export', limit: '5/min' },
              { endpoint: 'Profile updates', limit: '10/min' },
              { endpoint: 'Password change', limit: '5/min' },
              { endpoint: 'Account deletion', limit: '3/min' },
              { endpoint: 'Webhook operations', limit: '20/min' },
              { endpoint: 'SDK verification', limit: '100/min' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {item.endpoint}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  background: 'rgba(79, 125, 243, 0.1)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {item.limit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section style={{ padding: '48px 0' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          {endpoints.map((group, groupIndex) => (
            <div key={groupIndex} style={{ marginBottom: '48px' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--color-border)',
              }}>
                {group.category}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {group.items.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex-responsive"
                    style={{
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: methodColors[endpoint.method].bg,
                      color: methodColors[endpoint.method].color,
                      minWidth: '50px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}>
                      {endpoint.method}
                    </span>
                    <code style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: 'var(--color-text)',
                      flex: 1,
                      minWidth: '150px',
                      wordBreak: 'break-all',
                    }}>
                      {endpoint.path}
                    </code>
                    <span className="hide-mobile" style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      textAlign: 'right',
                    }}>
                      {endpoint.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Response Codes */}
      <section style={{ padding: '48px 0', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '24px' }}>Response Codes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { code: '200', desc: 'Success', color: '#1a7f1a' },
              { code: '201', desc: 'Created', color: '#1a7f1a' },
              { code: '400', desc: 'Bad Request', color: '#b45309' },
              { code: '401', desc: 'Unauthorized', color: '#dc2626' },
              { code: '403', desc: 'Forbidden', color: '#dc2626' },
              { code: '404', desc: 'Not Found', color: '#b45309' },
              { code: '422', desc: 'Validation Error', color: '#b45309' },
              { code: '429', desc: 'Rate Limited', color: '#b45309' },
              { code: '500', desc: 'Server Error', color: '#dc2626' },
            ].map((status, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '600',
                  color: status.color,
                }}>
                  {status.code}
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  {status.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
