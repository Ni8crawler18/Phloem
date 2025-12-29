import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Protocol', href: '#protocol' },
    { name: 'Features', href: '#features' },
    { name: 'Compliance', href: '#compliance' },
    { name: 'Docs', href: '/api/docs', external: true },
  ];

  const isLanding = location.pathname === '/';

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--color-border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}>
          <img
            src="/logo.png"
            alt="Eigensparse"
            style={{ height: '28px', width: 'auto' }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
          }}>
            Eigensparse
          </span>
        </Link>

        {/* Center Nav Links */}
        {isLanding && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--color-text)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary)'}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="btn btn-ghost"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
              >
                Dashboard
              </Link>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                }}>
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  color: 'var(--color-text-secondary)',
                  padding: '8px 16px',
                }}
              >
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
