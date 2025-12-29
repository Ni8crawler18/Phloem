import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fiduciaryDashboard, webhooks, settings } from '../api';
import { formatDateShort, parseJSON } from '../utils/formatters';
import {
  Building2, Target, Users, CheckCircle, XCircle, Key, Plus, Trash2,
  LogOut, Copy, RefreshCw, Clock, ChevronDown, ChevronUp, Bell, Zap,
  ExternalLink, ToggleLeft, ToggleRight, Play, Eye, AlertTriangle,
  Settings, User, Lock, Save
} from 'lucide-react';

export default function FiduciaryDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [purposes, setPurposes] = useState([]);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null); // Temporarily store newly generated key
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);

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

  // Webhook state
  const [webhooksList, setWebhooksList] = useState([]);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: ['all'],
  });
  const [webhookFormError, setWebhookFormError] = useState('');
  const [newWebhookSecret, setNewWebhookSecret] = useState(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [webhookDeliveries, setWebhookDeliveries] = useState({});
  const [testingWebhook, setTestingWebhook] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    privacy_policy_url: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [deleteForm, setDeleteForm] = useState({ password: '', confirmation: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Initialize profile form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        description: user.description || '',
        privacy_policy_url: user.privacy_policy_url || ''
      });
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [statsRes, purposesRes, consentsRes, webhooksRes] = await Promise.all([
        fiduciaryDashboard.stats(),
        fiduciaryDashboard.purposes(),
        fiduciaryDashboard.consents({ limit: 50 }),
        webhooks.list(),
      ]);
      setStats(statsRes.data);
      setPurposes(purposesRes.data);
      setConsents(consentsRes.data);
      setWebhooksList(webhooksRes.data);
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

  const copyApiKey = (keyToCopy = null) => {
    // Copy either the new key (if just regenerated) or show a message
    const key = keyToCopy || newApiKey;
    if (key) {
      navigator.clipboard.writeText(key);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    }
  };

  const regenerateApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate your current API key. The new key will only be shown once.')) return;
    try {
      const res = await fiduciaryDashboard.regenerateApiKey();
      // Store the new key temporarily for one-time display
      setNewApiKey(res.data.api_key);
      setShowNewKeyModal(true);
      // Refresh user data to get the new masked key
      await refreshUser();
    } catch (error) {
      alert('Failed to regenerate API key. Please try again.');
    }
  };

  const closeNewKeyModal = () => {
    setShowNewKeyModal(false);
    // Clear the key from memory after modal is closed
    setTimeout(() => setNewApiKey(null), 100);
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

  // Webhook handlers
  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    setWebhookFormError('');

    try {
      const res = await webhooks.create({
        name: webhookForm.name,
        url: webhookForm.url,
        events: webhookForm.events,
      });
      setNewWebhookSecret(res.data.secret);
      setShowSecretModal(true);
      setShowWebhookForm(false);
      setWebhookForm({ name: '', url: '', events: ['all'] });
      loadData();
    } catch (error) {
      setWebhookFormError(error.response?.data?.detail || 'Failed to create webhook');
    }
  };

  const deleteWebhook = async (uuid) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await webhooks.delete(uuid);
      loadData();
    } catch (error) {
      alert('Failed to delete webhook');
    }
  };

  const toggleWebhook = async (webhook) => {
    try {
      await webhooks.update(webhook.uuid, { is_active: !webhook.is_active });
      loadData();
    } catch (error) {
      alert('Failed to update webhook');
    }
  };

  const testWebhookEndpoint = async (uuid) => {
    setTestingWebhook(uuid);
    setTestResult(null);
    try {
      const res = await webhooks.test(uuid);
      setTestResult({ uuid, ...res.data });
    } catch (error) {
      setTestResult({ uuid, success: false, error_message: error.response?.data?.detail || 'Test failed' });
    } finally {
      setTestingWebhook(null);
    }
  };

  const loadWebhookDeliveries = async (uuid) => {
    try {
      const res = await webhooks.deliveries(uuid, 20);
      setWebhookDeliveries(prev => ({ ...prev, [uuid]: res.data }));
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  const closeSecretModal = () => {
    setShowSecretModal(false);
    setTimeout(() => setNewWebhookSecret(null), 100);
  };

  const copySecret = () => {
    if (newWebhookSecret) {
      navigator.clipboard.writeText(newWebhookSecret);
    }
  };

  // Settings handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');

    try {
      await settings.fiduciary.updateProfile({
        name: profileForm.name || undefined,
        description: profileForm.description || undefined,
        privacy_policy_url: profileForm.privacy_policy_url || undefined
      });
      await refreshUser();
      setSettingsSuccess('Profile updated successfully');
    } catch (error) {
      setSettingsError(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setSettingsError('New passwords do not match');
      setSettingsLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setSettingsError('Password must be at least 8 characters');
      setSettingsLoading(false);
      return;
    }

    try {
      await settings.fiduciary.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setSettingsSuccess('Password changed successfully');
    } catch (error) {
      setSettingsError(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');

    try {
      await settings.fiduciary.deleteAccount({
        password: deleteForm.password,
        confirmation: deleteForm.confirmation
      });
      logout();
      navigate('/');
    } catch (error) {
      setSettingsError(error.response?.data?.detail || 'Failed to delete account');
      setSettingsLoading(false);
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
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {[
              { id: 'overview', icon: Building2, label: 'Overview' },
              { id: 'purposes', icon: Target, label: 'Purposes' },
              { id: 'consents', icon: Users, label: 'User Consents' },
              { id: 'webhooks', icon: Bell, label: 'Webhooks' },
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
          </div>

          {/* Settings at bottom */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '12px' }}>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: activeTab === 'settings' ? 'rgba(79, 125, 243, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                color: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'settings' ? '500' : '400',
                transition: 'all 0.2s ease',
              }}
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
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
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '32px',
            }}>
              {[
                { label: 'Active Purposes', value: stats?.active_purposes || 0, icon: Target, color: 'var(--color-primary)' },
                { label: 'Total Consents', value: stats?.total_consents || 0, icon: CheckCircle, color: 'var(--color-success)' },
                { label: 'Active Consents', value: stats?.active_consents || 0, icon: Users, color: '#8B5CF6' },
                { label: 'Expiring Soon', value: stats?.expiring_consents || 0, icon: AlertTriangle, color: '#F59E0B' },
                { label: 'Expired', value: stats?.expired_consents || 0, icon: XCircle, color: 'var(--color-error)' },
                { label: 'Unique Users', value: stats?.unique_users || 0, icon: Users, color: '#10B981' },
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
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: stat.color }}>
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
                        {(() => {
                          const isExpiringSoon = c.status === 'granted' && c.expires_at &&
                            new Date(c.expires_at) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) &&
                            new Date(c.expires_at) > new Date();
                          const statusColor = c.status === 'granted'
                            ? (isExpiringSoon ? '#F59E0B' : 'var(--color-success)')
                            : 'var(--color-error)';
                          const statusBg = c.status === 'granted'
                            ? (isExpiringSoon ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-success-bg)')
                            : 'var(--color-error-bg)';
                          return (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              background: statusBg,
                              color: statusColor,
                            }}>
                              {isExpiringSoon ? 'expiring' : c.status}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {formatDateShort(c.granted_at)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.875rem', color: c.expires_at && new Date(c.expires_at) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) ? '#F59E0B' : 'var(--color-text-secondary)' }}>
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

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
                  // webhooks
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Webhooks</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  Receive real-time notifications when consent events occur.
                </p>
              </div>
              <button
                onClick={() => setShowWebhookForm(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                disabled={webhooksList.length >= 10}
              >
                <Plus size={18} />
                Add Webhook
              </button>
            </div>

            {/* Webhook Secret Modal */}
            {showSecretModal && newWebhookSecret && (
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
                  <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={20} />
                    Webhook Created
                  </h2>
                  <div style={{
                    padding: '12px',
                    background: 'var(--color-warning-bg)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    fontSize: '0.875rem',
                    color: '#92400e',
                  }}>
                    <strong>Important:</strong> Save this signing secret now. It will only be shown once.
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    marginBottom: '20px',
                  }}>
                    <code style={{
                      flex: 1,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      wordBreak: 'break-all',
                    }}>
                      {newWebhookSecret}
                    </code>
                    <button
                      onClick={copySecret}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        padding: '8px',
                      }}
                      title="Copy"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                    Use this secret to verify webhook signatures. Include it in your X-Eigensparse-Signature header validation.
                  </p>
                  <button
                    onClick={closeSecretModal}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    I've Saved My Secret
                  </button>
                </div>
              </div>
            )}

            {/* Webhook Form Modal */}
            {showWebhookForm && (
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
                  <h2 style={{ marginBottom: '24px' }}>Add Webhook Endpoint</h2>

                  {webhookFormError && (
                    <div style={{
                      padding: '12px',
                      background: 'var(--color-error-bg)',
                      border: '1px solid var(--color-error)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '20px',
                      color: 'var(--color-error)',
                      fontSize: '0.875rem',
                    }}>
                      {webhookFormError}
                    </div>
                  )}

                  <form onSubmit={handleCreateWebhook}>
                    <div style={{ marginBottom: '16px' }}>
                      <label className="label">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>name</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={webhookForm.name}
                        onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                        placeholder="e.g., Production Server"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label className="label">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>endpoint_url</span>
                      </label>
                      <input
                        type="url"
                        className="input"
                        value={webhookForm.url}
                        onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                        placeholder="https://your-server.com/webhooks/eigensparse"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label className="label">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>events</span>
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { value: 'all', label: 'All Events' },
                          { value: 'consent.granted', label: 'Consent Granted' },
                          { value: 'consent.revoked', label: 'Consent Revoked' },
                          { value: 'consent.expired', label: 'Consent Expired' },
                        ].map((event) => (
                          <label key={event.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={webhookForm.events.includes(event.value)}
                              onChange={(e) => {
                                if (event.value === 'all') {
                                  setWebhookForm({ ...webhookForm, events: e.target.checked ? ['all'] : [] });
                                } else {
                                  const newEvents = e.target.checked
                                    ? [...webhookForm.events.filter(ev => ev !== 'all'), event.value]
                                    : webhookForm.events.filter(ev => ev !== event.value);
                                  setWebhookForm({ ...webhookForm, events: newEvents });
                                }
                              }}
                            />
                            <span style={{ fontSize: '0.9375rem' }}>{event.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowWebhookForm(false);
                          setWebhookFormError('');
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create Webhook
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Webhooks List */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {webhooksList.map((webhook) => (
                <div key={webhook.uuid} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>{webhook.name}</h3>
                        <span style={{
                          padding: '4px 8px',
                          background: webhook.is_active ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: webhook.is_active ? 'var(--color-success)' : 'var(--color-error)',
                        }}>
                          {webhook.is_active ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '12px',
                        fontSize: '0.875rem',
                      }}>
                        <ExternalLink size={14} />
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {webhook.url}
                        </code>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {webhook.events.map((event) => (
                          <span key={event} style={{
                            padding: '4px 8px',
                            background: 'rgba(79, 125, 243, 0.1)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-primary)',
                          }}>
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => testWebhookEndpoint(webhook.uuid)}
                        disabled={testingWebhook === webhook.uuid}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          color: 'var(--color-text-secondary)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8125rem',
                        }}
                        title="Test webhook"
                      >
                        <Play size={14} />
                        {testingWebhook === webhook.uuid ? 'Testing...' : 'Test'}
                      </button>
                      <button
                        onClick={() => toggleWebhook(webhook)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: webhook.is_active ? 'var(--color-success)' : 'var(--color-text-muted)',
                          padding: '8px',
                        }}
                        title={webhook.is_active ? 'Disable webhook' : 'Enable webhook'}
                      >
                        {webhook.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => deleteWebhook(webhook.uuid)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                          padding: '8px',
                        }}
                        title="Delete webhook"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Test Result */}
                  {testResult && testResult.uuid === webhook.uuid && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: testResult.success ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                      border: `1px solid ${testResult.success ? 'var(--color-success)' : 'var(--color-error)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {testResult.success ? <CheckCircle size={16} color="var(--color-success)" /> : <XCircle size={16} color="var(--color-error)" />}
                        <strong>{testResult.success ? 'Test Successful' : 'Test Failed'}</strong>
                        {testResult.response_code && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            HTTP {testResult.response_code}
                          </span>
                        )}
                      </div>
                      {testResult.error_message && (
                        <p style={{ color: 'var(--color-error)', margin: 0 }}>{testResult.error_message}</p>
                      )}
                    </div>
                  )}

                  {/* Delivery Logs Toggle */}
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <button
                      onClick={() => {
                        if (!webhookDeliveries[webhook.uuid]) {
                          loadWebhookDeliveries(webhook.uuid);
                        } else {
                          setWebhookDeliveries(prev => {
                            const newState = { ...prev };
                            delete newState[webhook.uuid];
                            return newState;
                          });
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-primary)',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <Eye size={14} />
                      {webhookDeliveries[webhook.uuid] ? 'Hide' : 'View'} Recent Deliveries
                      {webhookDeliveries[webhook.uuid] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Delivery Logs */}
                    {webhookDeliveries[webhook.uuid] && (
                      <div style={{ marginTop: '12px' }}>
                        {webhookDeliveries[webhook.uuid].length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {webhookDeliveries[webhook.uuid].map((delivery) => (
                              <div key={delivery.uuid} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                background: 'var(--color-surface)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8125rem',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: delivery.status === 'success' ? 'var(--color-success)' : delivery.status === 'failed' ? 'var(--color-error)' : 'var(--color-warning)',
                                  }} />
                                  <span style={{ fontFamily: 'var(--font-mono)' }}>{delivery.event_type}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                                  {delivery.response_code && (
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                                      HTTP {delivery.response_code}
                                    </span>
                                  )}
                                  <span>{formatDateShort(delivery.created_at)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
                            No deliveries yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {webhooksList.length === 0 && (
                <div className="card" style={{
                  textAlign: 'center',
                  padding: '48px',
                  color: 'var(--color-text-muted)',
                }}>
                  <Bell size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ marginBottom: '8px' }}>No webhooks configured yet</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    Add a webhook to receive real-time consent notifications
                  </p>
                </div>
              )}
            </div>

            {/* Webhook Documentation */}
            <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Webhook Payload Format</h3>
              <div style={{
                background: '#1E293B',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: '#E2E8F0',
                overflow: 'auto',
              }}>
                <pre style={{ margin: 0 }}>{`{
  "event": "consent.granted",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "consent_uuid": "abc123...",
    "user_email": "user@example.com",
    "purpose_id": 1,
    "purpose_name": "Marketing",
    "granted_at": "2024-01-15T10:30:00.000Z"
  }
}

// Headers sent with each request:
// X-Eigensparse-Signature: <HMAC-SHA256 signature>
// X-Eigensparse-Event: consent.granted
// X-Eigensparse-Timestamp: 2024-01-15T10:30:00.000Z
// X-Eigensparse-Delivery-ID: <unique delivery id>`}</pre>
              </div>
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

            {/* New API Key Modal */}
            {showNewKeyModal && newApiKey && (
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
                  <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={20} />
                    New API Key Generated
                  </h2>
                  <div style={{
                    padding: '12px',
                    background: 'var(--color-warning-bg)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    fontSize: '0.875rem',
                    color: '#92400e',
                  }}>
                    <strong>Important:</strong> This key will only be shown once. Copy it now and store it securely.
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    marginBottom: '20px',
                  }}>
                    <code style={{
                      flex: 1,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      wordBreak: 'break-all',
                    }}>
                      {newApiKey}
                    </code>
                    <button
                      onClick={() => copyApiKey(newApiKey)}
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
                  <button
                    onClick={closeNewKeyModal}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    I've Copied My Key
                  </button>
                </div>
              </div>
            )}

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
                  {user?.api_key_hint || '••••••••••••••••'}
                </code>
              </div>
              <p style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                marginTop: '12px',
              }}>
                For security, the full API key is only shown once when generated. If you need a new key, regenerate it below.
              </p>
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
  baseUrl: 'https://eigensparse-api.onrender.com/api',
  apiKey: 'YOUR_API_KEY' // Use your regenerated API key
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
                // settings
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Account Settings</h1>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                Manage your organization profile, security, and account preferences.
              </p>
            </div>

            {/* Success/Error Messages */}
            {settingsSuccess && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--color-success-bg)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                color: 'var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <CheckCircle size={18} />
                {settingsSuccess}
              </div>
            )}

            {settingsError && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--color-error-bg)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <XCircle size={18} />
                {settingsError}
              </div>
            )}

            {/* Organization Profile */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} />
                Organization Profile
              </h3>
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>name</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your organization name"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>description</span>
                  </label>
                  <textarea
                    className="input"
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    placeholder="Brief description of your organization"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>privacy_policy_url</span>
                  </label>
                  <input
                    type="url"
                    className="input"
                    value={profileForm.privacy_policy_url}
                    onChange={(e) => setProfileForm({ ...profileForm, privacy_policy_url: e.target.value })}
                    placeholder="https://example.com/privacy"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>contact_email</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>(cannot be changed)</span>
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={user?.contact_email || ''}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={settingsLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} />
                Change Password
              </h3>
              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>current_password</span>
                  </label>
                  <input
                    type="password"
                    className="input"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label className="label">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>new_password</span>
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>confirm_password</span>
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={settingsLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Lock size={16} />
                  {settingsLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="card" style={{
              padding: '24px',
              border: '1px solid var(--color-error)',
              background: 'rgba(239, 68, 68, 0.03)',
            }}>
              <h3 style={{ marginBottom: '12px', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                Danger Zone
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '0.9375rem' }}>
                Permanently delete your organization account and all associated data. This will also delete all purposes,
                webhooks, and revoke all user consents. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn"
                style={{
                  background: 'var(--color-error)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Trash2 size={16} />
                Delete Organization Account
              </button>
            </div>
          </>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
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
            <div className="card" style={{ width: '450px', padding: '32px' }}>
              <h2 style={{ marginBottom: '16px', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} />
                Delete Organization Account
              </h2>

              <div style={{
                padding: '12px',
                background: 'var(--color-error-bg)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '0.875rem',
                color: 'var(--color-error)',
              }}>
                <strong>Warning:</strong> This will permanently delete:
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li>Your organization profile</li>
                  <li>All purposes you've created</li>
                  <li>All webhook configurations</li>
                  <li>All user consents to your purposes</li>
                </ul>
              </div>

              {settingsError && (
                <div style={{
                  padding: '12px',
                  background: 'var(--color-error-bg)',
                  border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  color: 'var(--color-error)',
                  fontSize: '0.875rem',
                }}>
                  {settingsError}
                </div>
              )}

              <form onSubmit={handleDeleteAccount}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>password</span>
                  </label>
                  <input
                    type="password"
                    className="input"
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>confirmation</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>Type "DELETE" to confirm</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={deleteForm.confirmation}
                    onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                    placeholder="DELETE"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteForm({ password: '', confirmation: '' });
                      setSettingsError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    disabled={settingsLoading || deleteForm.confirmation !== 'DELETE'}
                    style={{
                      background: deleteForm.confirmation === 'DELETE' ? 'var(--color-error)' : 'var(--color-text-muted)',
                      color: 'white',
                    }}
                  >
                    {settingsLoading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
