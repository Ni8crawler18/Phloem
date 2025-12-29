import { RefreshCw } from 'lucide-react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background)',
      gap: '16px',
    }}>
      <RefreshCw
        size={32}
        color="var(--color-primary)"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <span className="code-label">{message}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
