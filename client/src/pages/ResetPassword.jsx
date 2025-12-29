import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { auth } from '../api/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'user';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error, no-token
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');

    try {
      const resetFn = type === 'fiduciary'
        ? auth.fiduciaryResetPassword
        : auth.resetPassword;
      const response = await resetFn(token, password);
      setStatus('success');
      setMessage(response.data.message);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Failed to reset password. The link may be invalid or expired.');
    }
  };

  if (status === 'no-token') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
        padding: '24px',
      }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
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

          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 32px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <XCircle size={40} color="#ef4444" />
            </div>
            <h2 style={{ marginBottom: '12px' }}>Invalid Link</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="btn btn-primary">
              Request New Link
            </Link>
          </div>
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
              <h2 style={{ marginBottom: '12px' }}>Password Reset!</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                {message}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Redirecting to login in 3 seconds...
              </p>
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Go to Login <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              <span className="code-label" style={{ marginBottom: '16px', display: 'block' }}>
                {type === 'fiduciary' ? '// fiduciary_new_password' : '// new_password'}
              </span>

              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '12px',
              }}>
                Reset Your Password
              </h1>

              <p style={{
                color: 'var(--color-text-secondary)',
                marginBottom: '32px',
              }}>
                Enter your new password below.
              </p>

              {status === 'error' && (
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
                    {message}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      new_password
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
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '8px',
                  }}>
                    Must be at least 8 characters
                  </p>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label className="label">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      confirm_password
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
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
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
                  {status === 'loading' ? 'Resetting...' : 'Reset Password'}
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
