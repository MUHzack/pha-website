import { PhotogenicsLogo } from '@/components/PhotogenicsLogo'

export default function HomePage() {
  return (
    <div
      className="photogenics-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
      }}
    >
      <PhotogenicsLogo size="1.35rem" />
      <p
        style={{
          color: 'rgba(0,0,0,0.55)',
          fontSize: '0.85rem',
          letterSpacing: '0.04em',
          textAlign: 'center',
          maxWidth: '260px',
          lineHeight: 1.6,
        }}
      >
        Scan QR code pada kertas foto kamu untuk mengakses softfile.
      </p>
    </div>
  )
}
