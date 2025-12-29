import { AlertCircle, CheckCircle, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: {
      background: 'var(--color-error-bg)',
      border: '1px solid var(--color-error)',
      color: 'var(--color-error)',
    },
    success: {
      background: 'var(--color-success-bg)',
      border: '1px solid var(--color-success)',
      color: 'var(--color-success)',
    },
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      marginBottom: '24px',
      ...styles[type],
    }}>
      <Icon size={18} />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} color={styles[type].color} />
        </button>
      )}
    </div>
  );
}
