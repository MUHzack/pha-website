'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  useEffect(() => {
    if (!session.livePhoto || !session.gif) {
      const interval = setInterval(() => {
        router.refresh()
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [session.livePhoto, session.gif, router])

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
          const file = kind === 'photo' ? session.photo : kind === 'live_photo' ? session.livePhoto : session.gif
          if (!file) {
            if (kind === 'live_photo' || kind === 'gif') {
              return <ProcessingItem key={kind} kind={kind} index={index} />
            }
            return null
          }

          return (
            <MediaItem
              key={kind}
              session={session}
              kind={kind}
              file={file}
              index={index}/>
          )
        })}

        {session.shots.map((shot, idx) => (
          <ShotItem
            key={shot.id}
            session={session}
            shot={shot}
            shotIndex={idx + 1}
            index={FILE_KINDS.length + idx}/>
        ))}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          color: '#050505',
          textAlign: 'center',
          padding: '3rem 0.5rem 1rem',
          animation: 'fadeUp 0.7s ease 0.4s both',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}>
        <div>
          <p
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              fontWeight: 400,
              lineHeight: 1.4,
              margin: 0,
            }}>
            Terima kasih sudah berfoto di Photogenics
          </p>
          <p
            style={{
              marginTop: '0.25rem',
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              fontWeight: 800,
              lineHeight: 1.4,
              margin: '0.25rem 0 0 0',
            }}>
            Link aktif selama 3 × 24 jam
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '280px' }}>
          <a
            href="https://wa.me/6287731449261"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.5rem',
              background: 'rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              color: '#050505',
              borderRadius: '100px',
              fontFamily: 'var(--font-outfit, sans-serif)',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              width: '100%',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Hubungi Support
          </a>
        </div>
      </div>
    </div>
  )
}



// ─── Media Item ─────────────────────────────────────────────────────────────

function MediaItem({
  session,
  kind,
  file,
  index,
}: {
  session: SessionData
  kind: FileKind
  file: SessionFile
  index: number
}) {
  const [downloading, setDownloading] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  const previewUrl = kind === 'photo' 
    ? getPublicUrl(file.storage_bucket, file.storage_path, { width: 800, quality: 80 })
    : getPublicUrl(file.storage_bucket, file.storage_path)
  const downloadUrl = getPublicUrl(file.storage_bucket, file.storage_path)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  const handleDownload = async () => {
    if (!downloadUrl || downloading) return
    setDownloading(true)
    try {
      if (kind === 'photo' && previewUrl === downloadUrl) {
        const img = document.querySelector(`img[src="${previewUrl}"]`) as HTMLImageElement
        if (img && img.complete) {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `photogenics-${session.sessionId}.jpg`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }
            }, 'image/jpeg', 0.95)
          }
          setDownloading(false)
          return
        }
      }
      
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = (kind === 'gif' || kind === 'live_photo') ? 'mp4' : 'jpg'
      a.download = `photogenics-${session.sessionId}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(downloadUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (    
    <div
      ref={ref}
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

      {isInView && <MediaPreview url={previewUrl} kind={kind} />}

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


// ─── Media Preview ────────────────────────────────────────────────────────────

function MediaPreview({ url, kind }: { url: string; kind: FileKind }) {
  const sharedStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '65vh',
    objectFit: 'contain',
    borderRadius: '4px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  }

  if (kind === 'live_photo' || kind === 'gif') {
    return (
      <video 
        src={url} 
        autoPlay 
        loop 
        muted 
        playsInline 
        preload="metadata"
        style={sharedStyle} 
      />
    )
  }

  return <img src={url} alt={`Hasil ${kind} kamu`} style={sharedStyle} loading="lazy" />
}

// ─── Shot Item (Foto Satuan) ──────────────────────────────────────────────────

function ShotItem({
  session,
  shot,
  shotIndex,
  index,
}: {
  session: SessionData
  shot: SessionFile
  shotIndex: number
  index: number
}) {
  const [downloading, setDownloading] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const previewUrl = getPublicUrl(shot.storage_bucket, shot.storage_path, { width: 800, quality: 80 })
  const downloadUrl = getPublicUrl(shot.storage_bucket, shot.storage_path)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const response = await fetch(downloadUrl)
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
      window.open(downloadUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      ref={ref}
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
          Foto Satuan {shotIndex}
        </h2>
      </div>

      {isInView && <MediaPreview url={previewUrl} kind="photo" />}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            flex: 1,
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
          {downloading ? 'Mengunduh...' : 'Download'}
        </button>

        <button
          onClick={() => setShowFrameSelector(true)}
          style={{
            flex: 1,
            padding: '1.05rem 2rem',
            background: 'transparent',
            color: '#0a0a0a',
            border: '2px solid #0a0a0a',
            borderRadius: '999px',
            fontSize: '0.95rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0a0a0a'
            e.currentTarget.style.color = '#ffffff'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#0a0a0a'
            e.currentTarget.style.transform = ''
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}>
          Pilih Frame
        </button>
      </div>

      {showFrameSelector && (
        <FrameSelector
          session={session}
          shot={shot}
          shotIndex={shotIndex}
          onClose={() => setShowFrameSelector(false)}
        />
      )}
    </div>
  )
}

function FrameSelector({
  session,
  shot,
  shotIndex,
  onClose,
}: {
  session: SessionData
  shot: SessionFile
  shotIndex: number
  onClose: () => void
}) {
  const [frames, setFrames] = useState<Array<{ id: string; name: string; previewUrl: string; overlayUrl: string }>>([])
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const PHA_API_BASE = process.env.NEXT_PUBLIC_PHA_API_URL || ''
    fetch(`${PHA_API_BASE}/api/templates?kind=frame`)
      .then(res => res.json())
      .then(data => {
        setFrames(data.templates || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDownloadWithFrame = async () => {
    if (!selectedFrame || downloading) return
    setDownloading(true)

    try {
      const frame = frames.find(f => f.id === selectedFrame)
      if (!frame) return

      const PHA_API_BASE = process.env.NEXT_PUBLIC_PHA_API_URL || ''
      const response = await fetch(`${PHA_API_BASE}/api/apply-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: getPublicUrl(shot.storage_bucket, shot.storage_path),
          frameUrl: frame.overlayUrl,
        }),
      })

      if (!response.ok) throw new Error('Failed to apply frame')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photogenics-${session.sessionId}-shot-${shotIndex}-framed.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Gagal menerapkan frame. Silakan coba lagi.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Pilih Frame</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              lineHeight: 1,
            }}>
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={spinnerStyle} />
            <p style={{ color: '#666', marginTop: '1rem' }}>Memuat frame...</p>
          </div>
        ) : frames.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Tidak ada frame tersedia</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {frames.map(frame => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                style={{
                  border: selectedFrame === frame.id ? '3px solid #0a0a0a' : '2px solid #e5e5e5',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  background: selectedFrame === frame.id ? '#f5f5f5' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}>
                <img
                  src={frame.previewUrl}
                  alt={frame.name}
                  style={{ width: '100%', borderRadius: '8px', aspectRatio: '1', objectFit: 'cover' }}
                />
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', fontWeight: 500 }}>{frame.name}</p>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '100px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            Batal
          </button>
          <button
            onClick={handleDownloadWithFrame}
            disabled={!selectedFrame || downloading}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: selectedFrame && !downloading ? '#0a0a0a' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '100px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: selectedFrame && !downloading ? 'pointer' : 'not-allowed',
            }}>
            {downloading ? 'Memproses...' : 'Download dengan Frame'}
          </button>
        </div>
      </div>
    </div>
  )
}

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '3px solid rgba(0,0,0,0.1)',
  borderTopColor: '#000',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
}

function ProcessingItem({ kind, index }: { kind: FileKind; index: number }) {
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

      <div style={{
        width: '100%',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        border: '1px dashed rgba(0, 0, 0, 0.15)',
        gap: '1rem',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid rgba(0,0,0,0.1)',
          borderTopColor: '#000',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>
          Sedang menyiapkan media HD...
        </span>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}