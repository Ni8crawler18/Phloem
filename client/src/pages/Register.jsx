import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Building2, AlertCircle, CheckCircle, ArrowRight, Globe } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState(null); // null = selection, 'user' or 'fiduciary'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    description: '',
    privacy_policy_url: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      if (role === 'fiduciary') {
        await register({
          name: formData.name,
          contact_email: formData.email,
          description: formData.description || null,
          privacy_policy_url: formData.privacy_policy_url || null,
          password: formData.password,
        }, 'fiduciary');
        navigate('/fiduciary/dashboard');
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
        }, 'user');
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Role selection screen
  if (!role) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
        padding: '24px',
      }}>
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '48px',
            textDecoration: 'none',
            justifyContent: 'center',
          }}>
            <img src="/logo.png" alt="Eigensparse" style={{ height: '32px' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--color-text)',
            }}>
              Eigensparse
            </span>
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="code-label" style={{ marginBottom: '16px', display: 'block' }}>
              // select_role
            </span>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              I am a...
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Choose how you want to use Eigensparse
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}>
            {/* Data Principal Option */}
            <button
              onClick={() => setRole('user')}
              style={{
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(79, 125, 243, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <User size={28} color="var(--color-primary)" />
              </div>
              <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Data Principal</h3>
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                lineHeight: '1.5',
              }}>
                Individual user managing consent for your personal data
              </p>
              <div style={{
                marginTop: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}>
                // user
              </div>
            </button>

            {/* Data Fiduciary Option */}
            <button
              onClick={() => setRole('fiduciary')}
              style={{
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(79, 125, 243, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Building2 size={28} color="var(--color-primary)" />
              </div>
              <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>Data Fiduciary</h3>
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                lineHeight: '1.5',
              }}>
                Company or organization collecting user consent
              </p>
              <div style={{
                marginTop: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}>
                // company
              </div>
            </button>
          </div>

          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9375rem',
            marginTop: '32px',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: '500' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'var(--color-success-bg)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={36} color="var(--color-success)" />
          </div>
          <h2 style={{ marginBottom: '12px' }}>Registration Successful</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            Your account has been created.
          </p>
          <span className="code-label">Redirecting to login...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--color-background)',
    }}>
      {/* Left Panel - Illustration */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        padding: '48px',
        borderRight: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <img
            src="/illustration_3.png"
            alt="Register"
            style={{ width: '100%', marginBottom: '32px' }}
          />
          <h3 style={{ marginBottom: '12px' }}>
            {role === 'fiduciary' ? 'Register Your Organization' : 'Take Control of Your Data'}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {role === 'fiduciary'
              ? 'Create purposes, collect consent, and stay compliant with DPDP Act and GDPR.'
              : 'Register as a Data Principal to manage your consent preferences across all connected applications.'}
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="grid-pattern" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px',
      }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
            textDecoration: 'none',
          }}>
            <img src="/logo.png" alt="Eigensparse" style={{ height: '28px' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--color-text)',
            }}>
              Eigensparse
            </span>
          </Link>

          <button
            onClick={() => setRole(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Change role
          </button>

          <span className="code-label" style={{ marginBottom: '8px', display: 'block' }}>
            {role === 'fiduciary' ? '// fiduciary_registration' : '// user_registration'}
          </span>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>
            {role === 'fiduciary' ? 'Register Company' : 'Create Account'}
          </h1>

          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            fontSize: '1rem',
          }}>
            {role === 'fiduciary'
              ? 'Register your organization to start collecting consent.'
              : 'Create your account to start managing data consent.'}
          </p>

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
              <span style={{ color: 'var(--color-error)', fontSize: '0.9375rem' }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                  {role === 'fiduciary' ? 'company_name' : 'name'}
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                {role === 'fiduciary' ? (
                  <Building2 size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }} />
                ) : (
                  <User size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }} />
                )}
                <input
                  type="text"
                  name="name"
                  className="input input-with-icon"
                  placeholder={role === 'fiduciary' ? 'Acme Corporation' : 'Your full name'}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="label">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                  {role === 'fiduciary' ? 'contact_email' : 'email'}
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }} />
                <input
                  type="email"
                  name="email"
                  className="input input-with-icon"
                  placeholder={role === 'fiduciary' ? 'admin@company.com' : 'you@example.com'}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {role === 'fiduciary' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      description <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
                    </span>
                  </label>
                  <textarea
                    name="description"
                    className="input"
                    placeholder="Brief description of your organization"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    style={{ resize: 'vertical', minHeight: '60px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      privacy_policy_url <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={18} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                    }} />
                    <input
                      type="url"
                      name="privacy_policy_url"
                      className="input input-with-icon"
                      placeholder="https://company.com/privacy"
                      value={formData.privacy_policy_url}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'user' && (
              <div style={{ marginBottom: '16px' }}>
                <label className="label">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    phone <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }} />
                  <input
                    type="tel"
                    name="phone"
                    className="input input-with-icon"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="label">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    password
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }} />
                  <input
                    type="password"
                    name="password"
                    className="input input-with-icon"
                    placeholder="Min. 8 chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    confirm
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input input-with-icon"
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginBottom: '24px' }}
            >
              {loading ? 'Creating Account...' : (role === 'fiduciary' ? 'Register Company' : 'Create Account')}
              <ArrowRight size={18} />
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9375rem',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: '500' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
