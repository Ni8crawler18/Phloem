import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consents, fiduciaries, purposes, dashboard, auditLogs } from '../api';
import { formatDate, parseJSON } from '../utils/formatters';
import {
  Shield, Check, X, FileText, Clock, Building2,
  RefreshCw, Download, AlertCircle, ChevronDown, ChevronUp,
  Database, History, LogOut, Terminal
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('consents');
  const [myConsents, setMyConsents] = useState([]);
  const [availableFiduciaries, setAvailableFiduciaries] = useState([]);
  const [availablePurposes, setAvailablePurposes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedConsent, setExpandedConsent] = useState(null);
  const [grantingPurpose, setGrantingPurpose] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [consentsRes, fiduciariesRes, purposesRes, statsRes, logsRes] = await Promise.all([
        consents.list(),
        fiduciaries.list(),
        purposes.list(),
        dashboard.stats(),
        auditLogs.list({ limit: 20 }),
      ]);
      setMyConsents(consentsRes.data);
      setAvailableFiduciaries(fiduciariesRes.data);
      setAvailablePurposes(purposesRes.data);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async (purposeId, fiduciaryUuid) => {
    setGrantingPurpose(purposeId);
    try {
      await consents.grant({ purpose_id: purposeId, fiduciary_uuid: fiduciaryUuid });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to grant consent');
    } finally {
      setGrantingPurpose(null);
    }
  };

  const handleRevokeConsent = async (consentUuid) => {
    if (!confirm('Are you sure you want to revoke this consent?')) return;

    try {
      await consents.revoke({ consent_uuid: consentUuid });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to revoke consent');
    }
  };

  const downloadReceipt = async (consentUuid) => {
    try {
      const blob = await consents.downloadReceiptPdf(consentUuid);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consent-receipt-${consentUuid}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download receipt');
    }
  };


  const getConsentedPurposeIds = () => {
    return myConsents
      .filter(c => c.consent.status === 'granted')
      .map(c => c.consent.purpose_id);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
      }}>
        <RefreshCw size={32} color="var(--color-primary)" className="spin" />
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const tabs = [
    { id: 'consents', label: 'My Consents', icon: Shield },
    { id: 'available', label: 'Available Purposes', icon: Database },
    { id: 'audit', label: 'Audit Log', icon: History },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--color-background)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}>
            <img src="/logo.png" alt="Eigensparse" style={{ height: '24px' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--color-text)',
            }}>
              Eigensparse
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--color-primary-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              fontWeight: '600',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{user?.name}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}>
                DATA_PRINCIPAL
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
            consent_dashboard
          </span>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Manage your data sharing preferences and view consent history.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
          }}>
            <AlertCircle size={18} color="var(--color-error)" />
            <span style={{ color: 'var(--color-error)', flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="var(--color-error)" />
            </button>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '32px',
          }}>
            {[
              { label: 'Total Consents', value: stats.total_consents, color: 'var(--color-primary)' },
              { label: 'Active', value: stats.active_consents, color: 'var(--color-success)' },
              { label: 'Revoked', value: stats.revoked_consents, color: 'var(--color-error)' },
              { label: 'Fiduciaries', value: availableFiduciaries.length, color: 'var(--color-warning)' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: '24px' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: stat.color,
                  marginBottom: '4px',
                }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Consents Tab */}
        {activeTab === 'consents' && (
          <div>
            {myConsents.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
                <Shield size={48} color="var(--color-border)" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px' }}>No Consents Yet</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Grant consent to purposes to start managing your data preferences.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {myConsents.map((item) => (
                  <div key={item.consent.uuid} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        cursor: 'pointer',
                        background: expandedConsent === item.consent.uuid ? 'var(--color-surface)' : 'transparent',
                      }}
                      onClick={() => setExpandedConsent(
                        expandedConsent === item.consent.uuid ? null : item.consent.uuid
                      )}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: item.consent.status === 'granted' ? 'var(--color-success)' : 'var(--color-error)',
                        }} />
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.9375rem',
                            marginBottom: '4px',
                          }}>
                            {item.purpose.name}
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                            {item.fiduciary.name} • {item.purpose.legal_basis}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className={`badge ${item.consent.status === 'granted' ? 'badge-success' : 'badge-error'}`}>
                          {item.consent.status}
                        </span>
                        {expandedConsent === item.consent.uuid ? (
                          <ChevronUp size={20} color="var(--color-text-muted)" />
                        ) : (
                          <ChevronDown size={20} color="var(--color-text-muted)" />
                        )}
                      </div>
                    </div>

                    {expandedConsent === item.consent.uuid && (
                      <div style={{
                        padding: '20px 24px',
                        borderTop: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                              // description
                            </div>
                            <div style={{ fontSize: '0.9375rem' }}>{item.purpose.description}</div>
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                              // data_categories
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {JSON.parse(item.purpose.data_categories).map((cat, i) => (
                                <span key={i} className="badge badge-neutral">{cat}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                              // granted_at
                            </div>
                            <div style={{ fontSize: '0.9375rem' }}>{formatDate(item.consent.granted_at)}</div>
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                              // retention_days
                            </div>
                            <div style={{ fontSize: '0.9375rem' }}>{item.purpose.retention_period_days} days</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadReceipt(item.consent.uuid);
                            }}
                          >
                            <Download size={16} />
                            Download Receipt
                          </button>
                          {item.consent.status === 'granted' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevokeConsent(item.consent.uuid);
                              }}
                            >
                              <X size={16} />
                              Revoke Consent
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Purposes Tab */}
        {activeTab === 'available' && (
          <div>
            {availablePurposes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
                <Database size={48} color="var(--color-border)" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px' }}>No Purposes Available</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Data fiduciaries haven't registered any purposes yet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {availablePurposes.map((purpose) => {
                  const fiduciary = availableFiduciaries.find(f => f.id === purpose.fiduciary_id);
                  const isConsented = getConsentedPurposeIds().includes(purpose.id);

                  return (
                    <div key={purpose.uuid} className="card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.9375rem',
                          color: 'var(--color-primary)',
                        }}>
                          {purpose.name}
                        </span>
                        {purpose.is_mandatory && (
                          <span className="badge badge-warning">Required</span>
                        )}
                      </div>

                      <p style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.9375rem',
                        marginBottom: '16px',
                        lineHeight: '1.6',
                      }}>
                        {purpose.description}
                      </p>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                          // data_categories
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {JSON.parse(purpose.data_categories).map((cat, i) => (
                            <span key={i} className="badge badge-neutral">{cat}</span>
                          ))}
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px',
                        fontSize: '0.875rem',
                      }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            // legal_basis
                          </div>
                          <div style={{ fontWeight: '500' }}>{purpose.legal_basis}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            // retention
                          </div>
                          <div style={{ fontWeight: '500' }}>{purpose.retention_period_days} days</div>
                        </div>
                      </div>

                      {fiduciary && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          background: 'var(--color-surface)',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: '16px',
                          fontSize: '0.875rem',
                        }}>
                          <Building2 size={16} color="var(--color-text-muted)" />
                          <span style={{ color: 'var(--color-text-muted)' }}>Fiduciary:</span>
                          <span style={{ fontWeight: '500' }}>{fiduciary.name}</span>
                        </div>
                      )}

                      {isConsented ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '12px',
                          background: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '500',
                        }}>
                          <Check size={18} />
                          Consent Granted
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%' }}
                          onClick={() => handleGrantConsent(purpose.id, fiduciary?.uuid)}
                          disabled={grantingPurpose === purpose.id}
                        >
                          {grantingPurpose === purpose.id ? (
                            <RefreshCw size={18} className="spin" />
                          ) : (
                            <Shield size={18} />
                          )}
                          Grant Consent
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '64px' }}>
                      <History size={48} color="var(--color-border)" style={{ marginBottom: '16px' }} />
                      <p style={{ color: 'var(--color-text-muted)' }}>No audit logs yet</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.uuid}>
                      <td>
                        <span className={`badge ${
                          log.action.includes('granted') ? 'badge-success' :
                          log.action.includes('revoked') ? 'badge-error' :
                          'badge-neutral'
                        }`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                        {log.resource_type}
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details ? JSON.parse(log.details).purpose || log.resource_id?.slice(0, 8) : '-'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
