import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail, ArrowRight } from 'lucide-react';
import { auth } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'user';

  const [status, setStatus] = useState('loading'); // loading, success, error, no-token
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle, loading, success, error
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const verifyFn = type === 'fiduciary'
          ? auth.fiduciaryVerifyEmail
          : auth.verifyEmail;
        const response = await verifyFn(token);
        setStatus('success');
        setMessage(response.data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [token, type, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendStatus('loading');
    try {
      const resendFn = type === 'fiduciary'
        ? auth.fiduciaryResendVerification
        : auth.resendVerification;
      const response = await resendFn(resendEmail);
      setResendStatus('success');
      setResendMessage(response.data.message);
    } catch (err) {
      setResendStatus('error');
      setResendMessage(err.response?.data?.detail || 'Failed to resend verification email.');
    }
  };

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
          {status === 'loading' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(79, 125, 243, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Loader size={40} color="var(--color-primary)" className="spin" />
              </div>
              <h2 style={{ marginBottom: '12px' }}>Verifying Your Email</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
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
              <h2 style={{ marginBottom: '12px' }}>Email Verified!</h2>
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
            </>
          )}

          {status === 'error' && (
            <>
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
              <h2 style={{ marginBottom: '12px' }}>Verification Failed</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                {message}
              </p>

              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '24px',
              }}>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9375rem',
                  marginBottom: '16px',
                }}>
                  Need a new verification link?
                </p>
                <form onSubmit={handleResend}>
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
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
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={resendStatus === 'loading'}
                    style={{ width: '100%' }}
                  >
                    {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </form>
                {resendStatus === 'success' && (
                  <p style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '12px' }}>
                    {resendMessage}
                  </p>
                )}
                {resendStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '12px' }}>
                    {resendMessage}
                  </p>
                )}
              </div>
            </>
          )}

          {status === 'no-token' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(79, 125, 243, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Mail size={40} color="var(--color-primary)" />
              </div>
              <h2 style={{ marginBottom: '12px' }}>Verify Your Email</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                Please check your inbox for the verification link we sent you.
              </p>

              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '24px',
              }}>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9375rem',
                  marginBottom: '16px',
                }}>
                  Didn't receive the email?
                </p>
                <form onSubmit={handleResend}>
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
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
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={resendStatus === 'loading'}
                    style={{ width: '100%' }}
                  >
                    {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </form>
                {resendStatus === 'success' && (
                  <p style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '12px' }}>
                    {resendMessage}
                  </p>
                )}
                {resendStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '12px' }}>
                    {resendMessage}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.875rem',
          marginTop: '24px',
        }}>
          <Link to="/login">Back to Login</Link>
        </p>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
