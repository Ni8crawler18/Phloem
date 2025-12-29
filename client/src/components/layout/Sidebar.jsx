import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getInitials } from '../../utils/formatters';

export default function Sidebar({
  user,
  role,
  navItems,
  activeTab,
  onTabChange,
  onLogout,
  portalLabel,
}) {
  return (
    <aside style={{
      width: '280px',
      background: 'var(--color-surface)',
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
        {portalLabel && (
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
            {portalLabel}
          </div>
        )}
      </div>

      {/* User Info */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: role === 'fiduciary' ? 'var(--color-primary)' : 'var(--color-primary-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: role === 'fiduciary' ? 'white' : 'var(--color-primary)',
            fontWeight: '600',
          }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <div style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{user?.name}</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
            }}>
              {role === 'fiduciary' ? user?.contact_email : 'DATA_PRINCIPAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                fontWeight: isActive ? '500' : '400',
                transition: 'all 0.2s ease',
              }}
            >
              {item.icon && <item.icon size={18} />}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--color-border)',
      }}>
        <button
          onClick={onLogout}
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
  );
}
