import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fiduciaryDashboard } from '../api';
import { formatDateShort, parseJSON } from '../utils/formatters';
import {
  Building2, Target, Users, CheckCircle, XCircle, Key, Plus, Trash2,
  LogOut, Copy, RefreshCw, Eye, EyeOff, Clock, ChevronDown, ChevronUp
} from 'lucide-react';

export default function FiduciaryDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [purposes, setPurposes] = useState([]);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  // Purpose form state
  const [showPurposeForm, setShowPurposeForm] = useState(false);
  const [purposeForm, setPurposeForm] = useState({
    name: '',
    description: '',
    data_categories: '',
    retention_period_days: 365,
    legal_basis: 'consent',
    is_mandatory: false,
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, purposesRes, consentsRes] = await Promise.all([
        fiduciaryDashboard.stats(),
        fiduciaryDashboard.purposes(),
        fiduciaryDashboard.consents({ limit: 50 }),
      ]);
      setStats(statsRes.data);
      setPurposes(purposesRes.data);
      setConsents(consentsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(user?.api_key || '');
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const regenerateApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate your current API key.')) return;
    try {
      const res = await fiduciaryDashboard.regenerateApiKey();
      // Update user object in localStorage with new API key
      const updatedUser = { ...user, api_key: res.data.api_key };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error) {
      console.error('API Key regeneration error:', error);
      alert('Failed to regenerate API key: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreatePurpose = async (e) => {
    e.preventDefault();
    setFormError('');

    const categories = purposeForm.data_categories.split(',').map(c => c.trim()).filter(c => c);
    if (categories.length === 0) {
      setFormError('Please enter at least one data category');
      return;
    }

    try {
      await fiduciaryDashboard.createPurpose({
        name: purposeForm.name,
        description: purposeForm.description,
        data_categories: categories,
        retention_period_days: parseInt(purposeForm.retention_period_days),
        legal_basis: purposeForm.legal_basis,
        is_mandatory: purposeForm.is_mandatory,
      });
      setShowPurposeForm(false);
      setPurposeForm({
        name: '',
        description: '',
        data_categories: '',
        retention_period_days: 365,
        legal_basis: 'consent',
        is_mandatory: false,
      });
      loadData();
    } catch (error) {
      setFormError(error.response?.data?.detail || 'Failed to create purpose');
    }
  };

  const deletePurpose = async (uuid) => {
    if (!confirm('Are you sure you want to deactivate this purpose?')) return;
    try {
      await fiduciaryDashboard.deletePurpose(uuid);
      loadData();
    } catch (error) {
      alert('Failed to delete purpose');
    }
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
        <span className="code-label">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
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
          <div style={{
            marginTop: '12px',
            padding: '6px 10px',
            background: 'rgba(79, 125, 243, 0.1)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-primary)',
            display: 'inline-block',
          }}>
            Fiduciary Portal
          </div>
        </div>

        {/* Company Info */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Building2 size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                {user?.contact_email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {[
            { id: 'overview', icon: Building2, label: 'Overview' },
            { id: 'purposes', icon: Target, label: 'Purposes' },
            { id: 'consents', icon: Users, label: 'User Consents' },
            { id: 'api', icon: Key, label: 'API Key' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                background: activeTab === item.id ? 'rgba(79, 125, 243, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                color: activeTab === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === item.id ? '500' : '400',
                transition: 'all 0.2s ease',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '32px' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
                // dashboard
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Overview</h1>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '32px',
            }}>
              {[
                { label: 'Active Purposes', value: stats?.active_purposes || 0, icon: Target, color: 'var(--color-primary)' },
                { label: 'Total Consents', value: stats?.total_consents || 0, icon: CheckCircle, color: 'var(--color-success)' },
                { label: 'Active Consents', value: stats?.active_consents || 0, icon: Users, color: '#8B5CF6' },
                { label: 'Unique Users', value: stats?.unique_users || 0, icon: Users, color: '#F59E0B' },
              ].map((stat, i) => (
                <div key={i} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <stat.icon size={20} color={stat.color} />
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Consents */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} />
                Recent Consents
              </h3>
              {stats?.recent_consents?.length > 0 ? (
                <div>
                  {stats.recent_consents.slice(0, 5).map((c, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{c.user_email}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          {c.purpose_name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          background: c.status === 'granted' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                          color: c.status === 'granted' ? 'var(--color-success)' : 'var(--color-error)',
                        }}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
                  No consents yet
                </div>
              )}
            </div>
          </>
        )}

        {/* Purposes Tab */}
        {activeTab === 'purposes' && (
          <>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
                  // purposes
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Manage Purposes</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  Create and manage data collection purposes for consent requests.
                </p>
              </div>
              <button
                onClick={() => setShowPurposeForm(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} />
                Create Purpose
              </button>
            </div>

            {/* Purpose Form Modal */}
            {showPurposeForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}>
                <div className="card" style={{ width: '500px', padding: '32px' }}>
                  <h2 style={{ marginBottom: '24px' }}>Create New Purpose</h2>

                  {formError && (
                    <div style={{
                      padding: '12px',
                      background: 'var(--color-error-bg)',
                      border: '1px solid var(--color-error)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '20px',
                      color: 'var(--color-error)',
                      fontSize: '0.875rem',
                    }}>
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreatePurpose}>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="label">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>name</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={purposeForm.name}
                        onChange={(e) => setPurposeForm({ ...purposeForm, name: e.target.value })}
                        placeholder="e.g., Marketing Communications"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label className="label">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>description</span>
                      </label>
                      <textarea
                        className="input"
                        value={purposeForm.description}
                        onChange={(e) => setPurposeForm({ ...purposeForm, description: e.target.value })}
                        placeholder="Describe what this data will be used for"
                        rows={3}
                        required
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label className="label">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>data_categories</span>
                        <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>(comma separated)</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={purposeForm.data_categories}
                        onChange={(e) => setPurposeForm({ ...purposeForm, data_categories: e.target.value })}
                        placeholder="email, name, phone"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label className="label">
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>retention_days</span>
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={purposeForm.retention_period_days}
                          onChange={(e) => setPurposeForm({ ...purposeForm, retention_period_days: e.target.value })}
                          min="1"
                          max="3650"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>legal_basis</span>
                        </label>
                        <select
                          className="input"
                          value={purposeForm.legal_basis}
                          onChange={(e) => setPurposeForm({ ...purposeForm, legal_basis: e.target.value })}
                        >
                          <option value="consent">Consent</option>
                          <option value="contract">Contract</option>
                          <option value="legal_obligation">Legal Obligation</option>
                          <option value="legitimate_interest">Legitimate Interest</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={purposeForm.is_mandatory}
                          onChange={(e) => setPurposeForm({ ...purposeForm, is_mandatory: e.target.checked })}
                        />
                        <span style={{ fontSize: '0.9375rem' }}>Mandatory for service</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowPurposeForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create Purpose
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Purposes List */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {purposes.filter(p => p.is_active).map((purpose) => (
                <div key={purpose.uuid} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>{purpose.name}</h3>
                        <span style={{
                          padding: '4px 8px',
                          background: 'rgba(79, 125, 243, 0.1)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--color-primary)',
                        }}>
                          {purpose.legal_basis}
                        </span>
                        {purpose.is_mandatory && (
                          <span style={{
                            padding: '4px 8px',
                            background: 'var(--color-warning-bg)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-warning)',
                          }}>
                            mandatory
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                        {purpose.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        <span>
                          <strong>Data:</strong> {JSON.parse(purpose.data_categories).join(', ')}
                        </span>
                        <span>
                          <strong>Retention:</strong> {purpose.retention_period_days} days
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePurpose(purpose.uuid)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        padding: '8px',
                      }}
                      title="Deactivate purpose"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}>
                    UUID: {purpose.uuid}
                  </div>
                </div>
              ))}
              {purposes.filter(p => p.is_active).length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: 'var(--color-text-muted)',
                }}>
                  No purposes created yet. Click "Create Purpose" to get started.
                </div>
              )}
            </div>
          </>
        )}

        {/* Consents Tab */}
        {activeTab === 'consents' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
                // user_consents
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>User Consents</h1>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                View all users who have granted consent to your purposes.
              </p>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>USER</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PURPOSE</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>STATUS</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>GRANTED</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>EXPIRES</th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '500' }}>{c.user_name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{c.user_email}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.9375rem' }}>{c.purpose_name}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          background: c.status === 'granted' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                          color: c.status === 'granted' ? 'var(--color-success)' : 'var(--color-error)',
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {formatDateShort(c.granted_at)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {formatDateShort(c.expires_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {consents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                  No consents received yet
                </div>
              )}
            </div>
          </>
        )}

        {/* API Key Tab */}
        {activeTab === 'api' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
                // api_integration
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>API Key</h1>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                Use this API key to integrate Eigensparse SDK into your applications.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} />
                Your API Key
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}>
                <code style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9375rem',
                  wordBreak: 'break-all',
                }}>
                  {showApiKey ? user?.api_key : '••••••••••••••••••••••••••••••••'}
                </code>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    padding: '8px',
                  }}
                  title={showApiKey ? 'Hide' : 'Show'}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button
                  onClick={copyApiKey}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: apiKeyCopied ? 'var(--color-success)' : 'var(--color-text-secondary)',
                    padding: '8px',
                  }}
                  title="Copy"
                >
                  <Copy size={18} />
                </button>
              </div>
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={regenerateApiKey}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <RefreshCw size={16} />
                  Regenerate Key
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Integration Example</h3>
              <div style={{
                background: '#1E293B',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: '#E2E8F0',
                overflow: 'auto',
              }}>
                <pre style={{ margin: 0 }}>{`// Check consent before processing data
const client = Eigensparse.createClient({
  baseUrl: 'http://localhost:8000/api',
  apiKey: '${user?.api_key?.substring(0, 16)}...'
});

const result = await client.checkConsent('user@example.com');

if (result.has_consent) {
  // User has consented, proceed
  processUserData();
} else {
  // Show consent widget
  client.renderWidget('#container');
}`}</pre>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
