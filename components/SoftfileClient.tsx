'use client'

import { useState } from 'react'
import type { SessionData, FileKind, SessionFile } from '@/types/session'
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
  return (
    <div
      className="download-geometric-background"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(2rem, 5vh, 3rem) 1.5rem',
        fontFamily: 'var(--font-outfit, sans-serif)',
      }}>
      <div style={{ animation: 'fadeIn 0.5s ease both', marginBottom: '1.5rem' }}>
        <PhotogenicsLogo size="1.35rem" />
      </div>

      <div 
        style={{ 
          color: 'rgba(0,0,0,0.45)', 
          fontSize: '0.82rem',
          fontWeight: 500,
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeUp 0.6s ease 0.15s both'
        }}>
        <span style={{ letterSpacing: '0.02em' }}>Scroll ke bawah untuk file lainnya</span>
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem',
          flex: 1,
        }}>
        {FILE_KINDS.map((kind, index) => {
          const fileUrl = getFileUrl(session, kind)
          if (!fileUrl) return null

          return (
            <MediaItem
              key={kind}
              session={session}
              kind={kind}
              fileUrl={fileUrl}
              index={index}/>
          )
        })}

        {session.shots && session.shots.length > 0 && session.shots.map((shot, idx) => {
          const fileUrl = getPublicUrl(shot.storage_bucket, shot.storage_path)
          return (
            <ShotItem 
              key={shot.id || `shot-${idx}`} 
              session={session} 
              shot={shot} 
              fileUrl={fileUrl} 
              index={FILE_KINDS.length + idx} 
              shotIndex={idx + 1} 
            />
          )
        })}

        {!FILE_KINDS.some(kind => getFileUrl(session, kind)) && (!session.shots || session.shots.length === 0) && (
          <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
            File tidak tersedia
          </div>
        )}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          color: '#050505',
          textAlign: 'center',
          padding: '3rem 0.5rem 1rem',
          animation: 'fadeUp 0.7s ease 0.4s both',
        }}
      >
        <p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            fontWeight: 400,
            lineHeight: 1.4,
          }}>
          Terima kasih sudah berfoto di Photogenics
        </p>
        <p
          style={{
            marginTop: '0.25rem',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            fontWeight: 800,
            lineHeight: 1.4,
          }}>
          Link aktif selama 3 × 24 jam
        </p>
      </div>
    </div>
  )
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

// ─── Media Item ─────────────────────────────────────────────────────────────

function MediaItem({
  session,
  kind,
  fileUrl,
  index,
}: {
  session: SessionData
  kind: FileKind
  fileUrl: string
  index: number
}) {
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: `fadeUp 0.6s ease ${0.1 + index * 0.1}s both`,
      }}>
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#050505',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
          {FILE_KIND_LABELS[kind]}
        </h2>
      </div>

      <MediaPreview url={fileUrl} kind={kind} />

      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          width: '100%',
          padding: '1.05rem 2rem',
          background: !downloading ? '#0a0a0a' : '#ccc',
          color: '#ffffff',
          border: 'none',
          borderRadius: '999px',
          fontSize: '0.95rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: !downloading ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          transition: 'background 0.15s ease, transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!downloading) {
            e.currentTarget.style.background = '#222'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = !downloading ? '#0a0a0a' : '#ccc'
          e.currentTarget.style.transform = ''
        }}
        onMouseDown={(e) => {
          if (!downloading) e.currentTarget.style.transform = 'scale(0.98)'
        }}
        onMouseUp={(e) => {
          if (!downloading) e.currentTarget.style.transform = 'translateY(-1px)'
        }}>
        {downloading ? 'Mengunduh...' : `Download ${FILE_KIND_LABELS[kind]}`}
      </button>
    </div>
  )
}

// ─── Shot Item ──────────────────────────────────────────────────────────────

function ShotItem({
  session,
  shot,
  fileUrl,
  index,
  shotIndex,
}: {
  session: SessionData
  shot: SessionFile
  fileUrl: string
  index: number
  shotIndex: number
}) {
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
      a.download = `photogenics-${session.sessionId}-shot-${shotIndex}.jpg`
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        animation: `fadeUp 0.6s ease ${0.1 + index * 0.1}s both`,
      }}>
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#050505',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
          Shot {shotIndex}
        </h2>
      </div>

      <img 
        src={fileUrl} 
        alt={`Shot ${shotIndex}`} 
        style={{
          maxWidth: '100%',
          maxHeight: '65vh',
          objectFit: 'contain',
          borderRadius: '4px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        }} 
      />

      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          width: '100%',
          padding: '1.05rem 2rem',
          background: !downloading ? '#0a0a0a' : '#ccc',
          color: '#ffffff',
          border: 'none',
          borderRadius: '999px',
          fontSize: '0.95rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          cursor: !downloading ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          transition: 'background 0.15s ease, transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!downloading) {
            e.currentTarget.style.background = '#222'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = !downloading ? '#0a0a0a' : '#ccc'
          e.currentTarget.style.transform = ''
        }}
        onMouseDown={(e) => {
          if (!downloading) e.currentTarget.style.transform = 'scale(0.98)'
        }}
        onMouseUp={(e) => {
          if (!downloading) e.currentTarget.style.transform = 'translateY(-1px)'
        }}
      >
        {downloading ? 'Mengunduh...' : `Download Shot ${shotIndex}`}
      </button>
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