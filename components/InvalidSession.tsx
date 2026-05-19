import { PhotogenicsLogo } from './PhotogenicsLogo'

export function InvalidSession() {
  return (
    <div
      className="photogenics-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(2rem, 5vh, 3.5rem) 1.5rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
        textAlign: 'center',
      }}
    >
      <PhotogenicsLogo size="1.25rem" />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          animation: 'fadeUp 0.6s ease both',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1.5px solid rgba(0,0,0,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.42)',
            fontSize: '1.3rem',
            marginBottom: '0.5rem',
          }}
          aria-hidden="true"
        >
          ✕
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-bebas, sans-serif)',
            fontSize: 'clamp(2.5rem, 12vw, 4.5rem)',
            fontWeight: 400,
            color: '#0a0a0a',
            letterSpacing: '0.06em',
            lineHeight: 1,
          }}
        >
          TIDAK DITEMUKAN
        </h1>

        <p
          style={{
            color: 'rgba(0,0,0,0.55)',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            maxWidth: '280px',
          }}
        >
          Link yang kamu gunakan tidak valid atau sesi tidak ditemukan.
          <br />
          Pastikan kamu scan QR code yang benar.
        </p>
      </div>

      <p
        style={{
          color: 'rgba(0,0,0,0.34)',
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
        }}
      >
        Hubungi Photogenics jika ada pertanyaan.
      </p>
    </div>
  )
}
