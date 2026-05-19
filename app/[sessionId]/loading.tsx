import { PhotogenicsLogo } from '@/components/PhotogenicsLogo'

export default function Loading() {
  return (
    <div
      className="photogenics-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
      }}
    >
      <div style={{ animation: 'pulse 1.8s ease-in-out infinite' }}>
        <PhotogenicsLogo color="rgba(0,0,0,0.55)" size="1.25rem" />
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
              background: 'rgba(0,0,0,0.35)',
              animation: `bounce 1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
