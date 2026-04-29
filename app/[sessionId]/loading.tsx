export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
      }}
    >
      {/* Logo placeholder */}
      <div
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '1rem',
          letterSpacing: '0.08em',
          animation: 'pulse 1.8s ease-in-out infinite',
        }}
      >
        photogenics
      </div>

      {/* Bouncing dots */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              animation: `bounce 1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}