import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'API', href: '/api' },
    { name: 'SDK', href: '/sdk-demo' },
    { name: 'Docs', href: 'https://eigensparse.gitbook.io/docs/', external: true },
  ];

  const showNavLinks = ['/', '/sdk-demo', '/api'].includes(location.pathname);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
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
        padding: '0 16px',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }} onClick={closeMenu}>
            <img
              src="/logo.png"
              alt="Eigensparse"
              style={{ height: '28px', width: 'auto' }}
            />
            <span className="hide-mobile" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}>
              Eigensparse
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {showNavLinks && (
            <div className="hide-mobile" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}>
              {navLinks.map((link) => (
                link.href.startsWith('/') && !link.external ? (
                  <Link
                    key={link.name}
                    to={link.href}
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
                  </Link>
                ) : (
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
                )
              ))}
            </div>
          )}

          {/* Desktop Right Side */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn btn-ghost"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                >
                  Dashboard
                </Link>
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

          {/* Mobile Menu Button */}
          <button
            className="show-mobile"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="show-mobile"
          style={{
            display: 'none',
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            padding: '24px',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Nav Links */}
          {showNavLinks && navLinks.map((link) => (
            link.href.startsWith('/') && !link.external ? (
              <Link
                key={link.name}
                to={link.href}
                onClick={closeMenu}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {link.name}
              </a>
            )
          ))}

          {/* Auth Links */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="btn btn-primary"
                  style={{ textAlign: 'center' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="btn btn-secondary"
                  style={{ textAlign: 'center' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="btn btn-primary"
                  style={{ textAlign: 'center' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
