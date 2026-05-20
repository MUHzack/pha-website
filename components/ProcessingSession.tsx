import { PhotogenicsLogo } from './PhotogenicsLogo'

export function ProcessingSession() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(2rem, 5vh, 3.5rem) 1.5rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
        textAlign: 'center',
      }}
    >
      <PhotogenicsLogo color="rgba(255,255,255,0.5)" size="1.25rem" />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          animation: 'fadeUp 0.6s ease both',
        }}
      >
        {/* Pulsing ring */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.12)',
            borderTop: '1.5px solid rgba(255,255,255,0.6)',
            animation: 'spin 1s linear infinite',
            marginBottom: '0.5rem',
          }}
          aria-hidden="true"
        />

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
          SEDANG DIPROSES
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            maxWidth: '280px',
          }}
        >
          Foto kamu sedang diproses. Tunggu sebentar dan refresh halaman ini.
        </p>

        {/* Refresh hint */}
        <p
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          Halaman ini akan otomatis siap dalam beberapa menit.
        </p>
      </div>

      <div />
    </div>
  )
}
