import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, User, Building2 } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState(null); // null = selection, 'user' or 'fiduciary'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, role);
      navigate(role === 'fiduciary' ? '/fiduciary/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
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
              // authentication
            </span>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Sign in as...
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Choose your account type
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
                Manage your personal data consents
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
                Manage purposes and view consents
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
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '500' }}>
              Create one
            </Link>
          </p>
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
      {/* Left Panel */}
      <div className="grid-pattern" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px',
        borderRight: '1px solid var(--color-border)',
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
            ← Change account type
          </button>

          <span className="code-label" style={{ marginBottom: '16px', display: 'block' }}>
            {role === 'fiduciary' ? '// fiduciary_login' : '// user_login'}
          </span>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>
            Welcome Back
          </h1>

          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
            fontSize: '1.0625rem',
          }}>
            {role === 'fiduciary'
              ? 'Sign in to manage your purposes and view consent analytics.'
              : 'Sign in to manage your consent preferences and view audit logs.'}
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
            <div style={{ marginBottom: '20px' }}>
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
                  className="input input-with-icon"
                  placeholder={role === 'fiduciary' ? 'admin@company.com' : 'you@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
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
                  className="input input-with-icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '28px' }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginBottom: '24px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9375rem',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '500' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        padding: '48px',
      }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <img
            src="/illustration_2.png"
            alt="Authentication"
            style={{ width: '100%', marginBottom: '32px' }}
          />
          <h3 style={{ marginBottom: '12px' }}>
            {role === 'fiduciary' ? 'Fiduciary Dashboard' : 'Secure Access Control'}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {role === 'fiduciary'
              ? 'Create purposes, manage API keys, and track consent analytics.'
              : 'Your data permissions are protected with industry-standard encryption and comprehensive audit logging.'}
          </p>
        </div>
      </div>
    </div>
  );
}
