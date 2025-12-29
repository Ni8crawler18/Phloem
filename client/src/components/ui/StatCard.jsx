export default function StatCard({ label, value, icon: Icon, color, index }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        {Icon && <Icon size={20} color={color} />}
        {typeof index === 'number' && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '2rem',
        fontWeight: '600',
        color: color || 'var(--color-text)',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        color: 'var(--color-text-muted)',
        fontSize: '0.875rem',
      }}>
        {label}
      </div>
    </div>
  );
}
