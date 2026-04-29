import { PhotogenicsLogo } from '@/components/PhotogenicsLogo'

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
      }}
    >
      <PhotogenicsLogo color="rgba(255,255,255,0.5)" size="1.1rem" />
      <p
        style={{
          color: 'rgba(255,255,255,0.25)',
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