'use client'

import { useState } from 'react'
import type { SessionData, FileKind } from '@/types/session'
import { PhotogenicsLogo } from './PhotogenicsLogo'
import { getPublicUrl } from '@/lib/supabase'

const FILE_KIND_LABELS: Record<FileKind, string> = {
  photo: 'Foto',
  live_photo: 'Live Photo',
  gif: 'GIF',
}

const FILE_KINDS: FileKind[] = ['photo', 'live_photo', 'gif']

interface Props {
  session: SessionData
}

export function SoftfileClient({ session }: Props) {
  const [selectedKind, setSelectedKind] = useState<FileKind | null>(null)

  if (selectedKind) {
    return (
      <DownloadView
        session={session}
        kind={selectedKind}
        onBack={() => setSelectedKind(null)}
      />
    )
  }

  return <SelectorView session={session} onSelect={setSelectedKind} />
}

// ─── Helper: get file by kind ─────────────────────────────────────────────────

function getFileUrl(session: SessionData, kind: FileKind): string | null {
  const fileMap = {
    photo: session.photo,
    live_photo: session.livePhoto,
    gif: session.gif,
  }
  const file = fileMap[kind]
  if (!file) return null
  return getPublicUrl(file.storage_bucket, file.storage_path)
}

// ─── Selector View (dark, moody) ─────────────────────────────────────────────

function SelectorView({
  session,
  onSelect,
}: {
  session: SessionData
  onSelect: (kind: FileKind) => void
}) {
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top: Logo */}
      <div style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 0.6s ease both' }}>
        <PhotogenicsLogo size="1.25rem" />
      </div>

      {/* Middle: Heading + Buttons */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(2rem, 5vh, 3rem)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-bebas, sans-serif)',
            fontSize: 'clamp(4.5rem, 20vw, 7rem)',
            fontWeight: 400,
            color: '#0a0a0a',
            letterSpacing: '0.06em',
            lineHeight: 1,
            textAlign: 'center',
            animation: 'fadeUp 0.7s ease 0.1s both',
          }}
        >
          SOFTFILE
        </h1>

        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            animation: 'fadeUp 0.7s ease 0.25s both',
          }}
        >
          {FILE_KINDS.map((kind, i) => {
            const hasFile = Boolean(getFileUrl(session, kind))
            return (
              <button
                key={kind}
                onClick={() => hasFile && onSelect(kind)}
                disabled={!hasFile}
                style={{
                  width: '100%',
                  padding: '1.05rem 2rem',
                  background: hasFile ? '#0a0a0a' : 'rgba(0,0,0,0.06)',
                  color: hasFile ? '#ffffff' : 'rgba(0,0,0,0.28)',
                  border: hasFile ? 'none' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: hasFile ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  transition: 'transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
                  animationDelay: `${0.3 + i * 0.08}s`,
                }}
                onMouseEnter={(e) => {
                  if (hasFile) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.14)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}
                onMouseDown={(e) => {
                  if (hasFile) e.currentTarget.style.transform = 'scale(0.98)'
                }}
                onMouseUp={(e) => {
                  if (hasFile) e.currentTarget.style.transform = 'translateY(-1px)'
                }}
              >
                {FILE_KIND_LABELS[kind]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom: Footer */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          animation: 'fadeIn 0.7s ease 0.5s both',
        }}
      >
        <p style={{ color: 'rgba(0,0,0,0.58)', fontSize: '0.8rem', letterSpacing: '0.02em', marginBottom: '0.3rem' }}>
          Terima kasih sudah berfoto di Photogenics
        </p>
        <p style={{ color: 'rgba(0,0,0,0.8)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.02em' }}>
          Jangan lupa, link ini aktif selama 2 x 24 jam
        </p>
      </div>
    </div>
  )
}

// ─── Download View (light, clean) ────────────────────────────────────────────

function DownloadView({
  session,
  kind,
  onBack,
}: {
  session: SessionData
  kind: FileKind
  onBack: () => void
}) {
  const fileUrl = getFileUrl(session, kind)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!fileUrl || downloading) return
    setDownloading(true)
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = kind === 'gif' ? 'gif' : kind === 'live_photo' ? 'mov' : 'jpg'
      a.download = `photogenics-${session.sessionId}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(fileUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="photogenics-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(2rem, 5vh, 3rem) 1.5rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
      }}
    >
      {/* Top: Logo */}
      <div style={{ animation: 'fadeIn 0.5s ease both' }}>
        <PhotogenicsLogo size="1.35rem" />
      </div>

      {/* Center: Media preview */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 0',
          animation: 'fadeUp 0.6s ease 0.1s both',
        }}
      >
        {fileUrl ? (
          <MediaPreview url={fileUrl} kind={kind} />
        ) : (
          <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center' }}>
            File tidak tersedia
          </div>
        )}
      </div>

      {/* Bottom: Actions */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          animation: 'fadeUp 0.6s ease 0.2s both',
        }}
      >
        <button
          onClick={handleDownload}
          disabled={!fileUrl || downloading}
          style={{
            width: '100%',
            padding: '1.05rem 2rem',
            background: fileUrl && !downloading ? '#0a0a0a' : '#ccc',
            color: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            fontSize: '0.95rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: fileUrl && !downloading ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'background 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (fileUrl && !downloading) {
              e.currentTarget.style.background = '#222'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = fileUrl && !downloading ? '#0a0a0a' : '#ccc'
            e.currentTarget.style.transform = ''
          }}
        >
          {downloading ? 'Mengunduh...' : 'Download'}
        </button>

        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '0.7rem',
            background: 'transparent',
            color: 'rgba(0,0,0,0.4)',
            border: 'none',
            fontSize: '0.82rem',
            letterSpacing: '0.02em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.7)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.4)' }}
        >
          ← Pilih format lain
        </button>
      </div>
    </div>
  )
}

// ─── Media Preview ────────────────────────────────────────────────────────────

function MediaPreview({ url, kind }: { url: string; kind: FileKind }) {
  const sharedStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '65vh',
    objectFit: 'contain',
    borderRadius: '4px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  }

  if (kind === 'live_photo') {
    return <video src={url} autoPlay loop muted playsInline style={sharedStyle} />
  }

  return <img src={url} alt={`Hasil ${kind} kamu`} style={sharedStyle} />
}
