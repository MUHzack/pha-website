'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkFormStatus, submitForm, type VoucherData } from '@/lib/api'
import { PhotogenicsLogo } from './PhotogenicsLogo'

interface Props {
  sessionId: string
}

export function FormFeedback({ sessionId }: Props) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    feedback: ''
  })
  const [loading, setLoading] = useState(false)
  const [voucher, setVoucher] = useState<VoucherData | null>(null)
  const [checking, setChecking] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkFormStatus(sessionId)
      .then((result) => {
        if (result.submitted) {
          setAlreadySubmitted(true)
        }
      })
      .catch(() => {
        setError('Tidak dapat mengecek status form')
      })
      .finally(() => {
        setChecking(false)
      })
  }, [sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.feedback.trim()) return
    
    setLoading(true)
    setError('')

    try {
      const result = await submitForm(sessionId, {
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        feedback: formData.feedback
      })

      if (result.success && result.voucher) {
        setVoucher(result.voucher)
      } else {
        setError(result.error || 'Terjadi kesalahan')
      }
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div style={containerStyle}>
        <div style={{ animation: 'fadeIn 0.5s ease both' }}>
          <PhotogenicsLogo size="1.35rem" color="rgba(0,0,0,0.6)" />
        </div>
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Memuat...</p>
        </div>
      </div>
    )
  }

  if (alreadySubmitted) {
    router.push(`/${sessionId}`)
    return null
  }

  if (voucher) {
    return (
      <div style={containerStyle}>
        <div style={{ animation: 'fadeIn 0.5s ease both', marginBottom: '1.5rem' }}>
          <PhotogenicsLogo size="1.35rem" color="rgba(0,0,0,0.6)" />
        </div>

        <div style={cardStyle}>
          <h1 style={titleStyle}>Terima kasih!</h1>
          <p style={subtitleStyle}>Feedback Anda sangat berarti bagi kami</p>

          <div style={voucherBoxStyle}>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
              Kode Voucher Anda
            </p>
            <p style={voucherCodeStyle}>{voucher.code}</p>
            <p style={discountStyle}>Diskon {voucher.discountPercent}%</p>
            <p style={voucherNoteStyle}>{voucher.message}</p>
          </div>

          <button
            onClick={() => router.push(`/${sessionId}`)}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#222'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0a0a0a'
              e.currentTarget.style.transform = ''
            }}
          >
            Lanjut Download
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={{ animation: 'fadeIn 0.5s ease both', marginBottom: '1.5rem' }}>
        <PhotogenicsLogo size="1.35rem" color="rgba(0,0,0,0.6)" />
      </div>

      <form onSubmit={handleSubmit} style={cardStyle}>
        <h1 style={titleStyle}>Feedback Photogenics</h1>
        <p style={subtitleStyle}>Bagikan pengalaman Anda</p>

        <div style={formGroupStyle}>
          <input
            type="text"
            placeholder="Nama (opsional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <input
            type="email"
            placeholder="Email (opsional)"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <input
            type="tel"
            placeholder="No. HP (opsional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <textarea
            placeholder="Bagaimana pengalaman Anda? *"
            value={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            required
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
          />
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: '0 0 1rem' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !formData.feedback.trim()}
          style={{
            ...buttonStyle,
            background: loading || !formData.feedback.trim() ? '#ccc' : '#0a0a0a',
            cursor: loading || !formData.feedback.trim() ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading && formData.feedback.trim()) {
              e.currentTarget.style.background = '#222'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && formData.feedback.trim()) {
              e.currentTarget.style.background = '#0a0a0a'
              e.currentTarget.style.transform = ''
            }
          }}
        >
          {loading ? 'Menyimpan...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  fontFamily: 'var(--font-outfit, sans-serif)',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  background: '#fff',
  borderRadius: '16px',
  padding: '2rem',
  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  animation: 'fadeUp 0.6s ease 0.15s both',
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#0a0a0a',
  margin: '0 0 0.5rem',
  textAlign: 'center',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#666',
  margin: '0 0 2rem',
  textAlign: 'center',
}

const formGroupStyle: React.CSSProperties = {
  marginBottom: '1rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '10px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
  boxSizing: 'border-box',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem',
  background: '#0a0a0a',
  color: '#fff',
  border: 'none',
  borderRadius: '100px',
  fontSize: '0.95rem',
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background 0.15s ease, transform 0.15s ease',
}

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '2rem',
}

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '3px solid rgba(0,0,0,0.1)',
  borderTopColor: '#000',
  animation: 'spin 1s linear infinite',
}

const voucherBoxStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  borderRadius: '12px',
  padding: '1.5rem',
  textAlign: 'center',
  marginBottom: '1.5rem',
  border: '1px solid rgba(34, 197, 94, 0.2)',
}

const voucherCodeStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 800,
  color: '#166534',
  letterSpacing: '0.15em',
  margin: '0.5rem 0',
  fontFamily: 'monospace',
}

const discountStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#15803d',
  margin: '0.5rem 0',
}

const voucherNoteStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#166534',
  margin: '0.5rem 0 0',
  lineHeight: 1.5,
}
