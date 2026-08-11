export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg width="40" height="40" viewBox="0 0 40 40" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}>
        {/* Maison (symbole de famille) */}
        <path d="M 20 8 L 10 18 L 12 18 L 12 28 L 28 28 L 28 18 L 30 18 Z" fill="#fff" />

        {/* Porte */}
        <rect x="18" y="20" width="4" height="8" fill="#6366f1" />

        {/* Fenêtres */}
        <rect x="14" y="14" width="3" height="3" fill="#6366f1" />
        <rect x="23" y="14" width="3" height="3" fill="#6366f1" />
      </svg>

      <div>
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '800',
          color: '#fff'
        }}>
          Family
        </h1>
        <p style={{
          margin: 0,
          fontSize: '12px',
          fontWeight: '600',
          color: '#e0e7ff',
          letterSpacing: '2px'
        }}>
          FINANCES
        </p>
      </div>
    </div>
  )
}
