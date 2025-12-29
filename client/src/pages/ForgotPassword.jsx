import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, User, Building2 } from 'lucide-react';
import { auth } from '../api/auth';

export default function ForgotPassword() {
  const [role, setRole] = useState(null); // null = selection, 'user' or 'fiduciary'
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const forgotFn = role === 'fiduciary'
        ? auth.fiduciaryForgotPassword
        : auth.forgotPassword;
      const response = await forgotFn(email);
      setStatus('success');
      setMessage(response.data.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
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
              // password_reset
            </span>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Reset password for...
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
                Personal user account
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
                Organization account
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
            Remember your password?{' '}
            <Link to="/login" style={{ fontWeight: '500' }}>
              Sign in
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
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
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
          <ArrowLeft size={16} /> Change account type
        </button>

        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
        }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <CheckCircle size={40} color="#22c55e" />
              </div>
              <h2 style={{ marginBottom: '12px' }}>Check Your Email</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                {message}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                The link will expire in 30 minutes.
              </p>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <span className="code-label" style={{ marginBottom: '16px', display: 'block' }}>
                {role === 'fiduciary' ? '// fiduciary_reset' : '// user_reset'}
              </span>

              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '12px',
              }}>
                Forgot Password?
              </h1>

              <p style={{
                color: 'var(--color-text-secondary)',
                marginBottom: '32px',
              }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {status === 'error' && (
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--color-error-bg)',
                  border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                  color: 'var(--color-error)',
                  fontSize: '0.9375rem',
                }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
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

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={status === 'loading'}
                  style={{ width: '100%' }}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                  {status !== 'loading' && <ArrowRight size={18} />}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: '0.9375rem',
          marginTop: '24px',
        }}>
          Remember your password?{' '}
          <Link to="/login" style={{ fontWeight: '500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
