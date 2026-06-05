'use client'

import { PhotogenicsLogo } from './PhotogenicsLogo'

export function InvalidSession() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        backgroundImage: `
          radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.02) 0%, transparent 60%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(2rem, 5vh, 3.5rem) 1.5rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
        textAlign: 'center',
      }}>
      <PhotogenicsLogo color="rgba(255,255,255,0.4)" size="1.25rem" />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          animation: 'fadeUp 0.6s ease both',
        }}>
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
          }}>
          BELUM TERSEDIA
        </h1>

        <div
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            maxWidth: '340px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
          <p style={{ margin: 0 }}>
            File kamu sedang dalam proses upload ke server. Mohon tunggu beberapa saat dan klik refresh secara berkala.
          </p>
          <p style={{ margin: 0 }}>
            Jika file tidak kunjung muncul, silakan hubungi kontak support kami.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '100px',
            fontFamily: 'var(--font-outfit, sans-serif)',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Refresh Halaman
        </button>
      </div>

      <p
        style={{
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
        }}>
        Hubungi Photogenics jika ada pertanyaan.
      </p>
    </div>
  )
}
