import { PhotogenicsLogo } from './PhotogenicsLogo'

export function ExpiredSession() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        backgroundImage: `
          radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.025) 0%, transparent 60%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(2rem, 5vh, 3.5rem) 1.5rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
        textAlign: 'center',
      }}
    >
      <PhotogenicsLogo color="rgba(255,255,255,0.4)" size="1.25rem" />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          animation: 'fadeUp 0.6s ease both',
        }}
      >
        {/* Icon: clock / hourglass in minimal style */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '1.4rem',
            marginBottom: '0.5rem',
          }}
          aria-hidden="true"
        >
          ⌛
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-bebas, sans-serif)',
            fontSize: 'clamp(2.5rem, 12vw, 4.5rem)',
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: '0.06em',
            lineHeight: 1,
          }}
        >
          LINK KEDALUWARSA
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            maxWidth: '280px',
          }}
        >
          Link softfile ini sudah tidak aktif.
          <br />
          Link hanya berlaku selama <strong style={{ color: 'rgba(255,255,255,0.7)' }}>3 hari</strong> setelah sesi foto.
        </p>
      </div>

      <p
        style={{
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
        }}
      >
        Hubungi Photogenics jika ada pertanyaan.
      </p>
    </div>
  )
}
