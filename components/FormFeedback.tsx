'use client'

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { checkFormStatus, submitForm, type FormData, type VoucherData } from '@/lib/api'
import { PhotogenicsLogo } from './PhotogenicsLogo'

interface Props {
  sessionId: string
}

const DISCOVERY_SOURCES = [
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['friends_family', 'Teman atau keluarga'],
  ['other', 'Lainnya'],
] as const

const VISITED_BRANCHES = ['Kedai Asagi Sidoarjo'] as const

export function FormFeedback({ sessionId }: Props) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    rating: 0,
    name: '',
    gender: '',
    birthDate: '',
    phone: '',
    visitedBranch: String(VISITED_BRANCHES[0]),
    discoverySource: '',
    feedback: '',
  })
  const [loading, setLoading] = useState(false)
  const [voucher, setVoucher] = useState<VoucherData | null>(null)
  const [checking, setChecking] = useState(true)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [error, setError] = useState('')
  const [statusCheckFailed, setStatusCheckFailed] = useState(false)
  const [showSocialMediaConsent, setShowSocialMediaConsent] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    checkFormStatus(sessionId)
      .then((result) => {
        if (result.submitted) setAlreadySubmitted(true)
      })
      .catch((statusError: unknown) => {
        setError(statusError instanceof Error
          ? `Status form tidak dapat dicek: ${statusError.message}`
          : 'Status form tidak dapat dicek. Periksa koneksi lalu coba lagi.')
        setStatusCheckFailed(true)
      })
      .finally(() => setChecking(false))
  }, [sessionId])

  const birthDateIso = parseBirthDate(formData.birthDate)
  const birthDateIsValid = Boolean(birthDateIso && birthDateIso <= getMaxBirthDate())
  const phoneIsValid = isValidIndonesianPhone(formData.phone)
  const canSubmit = Boolean(
    formData.rating && formData.name.trim() && formData.gender && birthDateIsValid &&
    phoneIsValid && formData.visitedBranch.trim() &&
    formData.discoverySource && formData.feedback.trim().length >= 10
  )
  const validationMessages = showValidation ? [
    !formData.rating ? 'Pilih rating terlebih dahulu.' : '',
    !formData.name.trim() ? 'Nama wajib diisi.' : '',
    !formData.gender ? 'Pilih gender.' : '',
    !birthDateIsValid ? 'Pilih tanggal lahir yang valid dengan usia minimal 10 tahun.' : '',
    !phoneIsValid ? 'Masukkan nomor HP Indonesia yang valid.' : '',
    !formData.visitedBranch.trim() ? 'Pilih cabang.' : '',
    !formData.discoverySource ? 'Pilih sumber informasi.' : '',
    formData.feedback.trim().length < 10 ? 'Pesan minimal 10 karakter.' : '',
  ].filter(Boolean) : []

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (statusCheckFailed) return
    setShowValidation(true)
    if (!canSubmit) return

    setShowSocialMediaConsent(true)
  }

  const confirmSubmit = async (socialMediaConsent: boolean) => {
    setShowSocialMediaConsent(false)

    setLoading(true)
    setError('')
    try {
      const payload: FormData = {
        ...formData,
        gender: formData.gender as FormData['gender'],
        birthDate: formatBirthDateForApi(formData.birthDate),
        socialMediaConsent,
      }
      const result = await submitForm(sessionId, payload)
      if (result.success && result.voucher) setVoucher(result.voucher)
      else setError(result.error || 'Terjadi kesalahan')
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="download-geometric-background" style={containerStyle}>
        <PhotogenicsLogo size="1.35rem" color="#51473a" />
        <div style={loadingStyle}>
          <div style={spinnerStyle} />
          <p style={{ color: '#71695f', fontSize: '0.95rem' }}>Memuat...</p>
        </div>
      </main>
    )
  }

  if (alreadySubmitted) {
    router.push(`/${sessionId}`)
    return null
  }

  if (voucher) {
    return (
      <main className="download-geometric-background" style={containerStyle}>
        <div style={logoWrapStyle}><PhotogenicsLogo size="1.35rem" color="#51473a" /></div>
        <section style={cardStyle}>
          <p style={eyebrowStyle}>PHOTOGENICS · CUSTOMER REVIEW</p>
          <h1 style={titleStyle}>Thanks for your review</h1>
          <p style={subtitleStyle}>Ada voucher spesial untuk kamu!</p>
          <div style={voucherBoxStyle}>
            <p style={voucherLabelStyle}>Kode voucher kamu</p>
            <p style={voucherCodeStyle}>{voucher.code}</p>
            <p style={discountStyle}>Diskon {voucher.discountPercent}%</p>
            <p style={voucherExpiryStyle}>
              Berlaku sampai {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'long',
                timeZone: 'Asia/Jakarta',
              }).format(new Date(voucher.expiresAt))}
            </p>
            <p style={voucherNoteStyle}>{voucher.message}</p>
          </div>
          <button onClick={() => router.push(`/${sessionId}`)} style={buttonStyle}>
            Lanjut Download
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="download-geometric-background" style={containerStyle}>
      <div style={logoWrapStyle}><PhotogenicsLogo size="1.35rem" color="#51473a" /></div>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <h1 style={titleStyle}>Customer Review</h1>
        <p style={subtitleStyle}>Bagikan pengalamanmu dan dapatkan voucher spesial dari Photogenics</p>

        <div style={formGroupStyle}>
          <span id="rating-label" style={fieldLabelStyle}>Rating pengalamanmu</span>
          <div role="radiogroup" aria-labelledby="rating-label" style={starsStyle}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={formData.rating === star}
                aria-label={`${star} dari 5 bintang`}
                onClick={() => setFormData({ ...formData, rating: star })}
                disabled={statusCheckFailed}
                style={{
                  ...starButtonStyle,
                  color: star <= formData.rating ? '#b78a52' : '#d6d0c7',
                  transform: formData.rating === star ? 'scale(1.12)' : 'scale(1)',
                }}
              >
                ★
              </button>
            ))}
          </div>
          <span style={ratingValueStyle}>{formData.rating ? `${formData.rating} dari 5` : 'Ketuk bintang untuk memberi rating'}</span>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="customer-name" style={fieldLabelStyle}>Nama</label>
          <input
            id="customer-name"
            type="text"
            placeholder="Nama"
            autoComplete="name"
            maxLength={200}
            disabled={statusCheckFailed}
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="customer-gender" style={fieldLabelStyle}>Gender</label>
          <select
            id="customer-gender"
            value={formData.gender}
            onChange={(event) => setFormData({ ...formData, gender: event.target.value })}
            style={inputStyle}
            disabled={statusCheckFailed}
          >
            <option value="">Pilih gender</option>
            <option value="female">Perempuan</option>
            <option value="male">Laki-laki</option>
          </select>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="customer-birth-date" style={fieldLabelStyle}>Tanggal lahir</label>
          <input
            id="customer-birth-date"
            type="date"
            max={getMaxBirthDate()}
            autoComplete="bday"
            disabled={statusCheckFailed}
            value={formData.birthDate}
            onChange={(event) => setFormData({ ...formData, birthDate: event.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="customer-phone" style={fieldLabelStyle}>No. HP</label>
          <input
            id="customer-phone"
            type="tel"
            placeholder="Contoh: 081234567890"
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
            disabled={statusCheckFailed}
            value={formData.phone}
            onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="visited-branch" style={fieldLabelStyle}>Cabang yang dikunjungi</label>
          <select
            id="visited-branch"
            value={formData.visitedBranch}
            disabled={statusCheckFailed}
            onChange={(event) => setFormData({ ...formData, visitedBranch: event.target.value })}
            style={inputStyle}
          >
            {VISITED_BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
          </select>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="discovery-source" style={fieldLabelStyle}>Tau Photogenics dari mana?</label>
          <select
            id="discovery-source"
            value={formData.discoverySource}
            onChange={(event) => setFormData({ ...formData, discoverySource: event.target.value })}
            style={inputStyle}
            disabled={statusCheckFailed}
          >
            <option value="">Pilih sumber informasi</option>
            {DISCOVERY_SOURCES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="customer-feedback" style={fieldLabelStyle}>Pesan</label>
          <textarea
            id="customer-feedback"
            placeholder="Ceritakan pengalamanmu"
            value={formData.feedback}
            onChange={(event) => setFormData({ ...formData, feedback: event.target.value })}
            maxLength={5000}
            disabled={statusCheckFailed}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '112px' }}
          />
          <span style={hintStyle}>Minimal 10 karakter</span>
        </div>

        {statusCheckFailed && (
          <button type="button" onClick={() => window.location.reload()} style={{ ...buttonStyle, marginBottom: '1rem', background: '#756c61' }}>
            Coba cek lagi
          </button>
        )}

        <button
          type="submit"
          disabled={loading || statusCheckFailed}
          style={{
            ...buttonStyle,
            opacity: loading || statusCheckFailed ? 0.55 : 1,
            cursor: loading || statusCheckFailed ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
        {(validationMessages.length > 0 || error) && (
          <div role="alert" style={{ ...errorStyle, marginTop: '1rem', marginBottom: 0 }}>
            {error && <p style={{ margin: '0 0 0.35rem' }}>{error}</p>}
            {validationMessages.map((message) => <p key={message} style={{ margin: '0.35rem 0 0' }}>{message}</p>)}
          </div>
        )}
      </form>
      {showSocialMediaConsent && (
        <div style={modalBackdropStyle}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-media-title"
            style={modalStyle}
          >
            <h2 id="social-media-title" style={{ ...titleStyle, fontSize: '1.35rem' }}>Social Media</h2>
            <p style={{ ...subtitleStyle, marginBottom: '1.5rem' }}>Apakah boleh fotomu diupload di sosial media Photogenics?</p>
            <div style={consentActionsStyle}>
              <button type="button" onClick={() => confirmSubmit(true)} disabled={loading} style={buttonStyle}>Boleh</button>
              <button type="button" onClick={() => confirmSubmit(false)} disabled={loading} style={declineButtonStyle}>Tidak</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

function getMaxBirthDate() {
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() - 10)
  return date.toISOString().slice(0, 10)
}

function parseBirthDate(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return value
}

function formatBirthDateForApi(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

function isValidIndonesianPhone(value: string) {
  const normalized = value.trim().replace(/[\s().-]/g, '')
  return /^(?:\+?62|0)\d{8,13}$/.test(normalized)
}

const containerStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'clamp(1.25rem, 5vw, 3rem) 1rem',
  fontFamily: 'var(--font-outfit, sans-serif)',
}

const logoWrapStyle: CSSProperties = { marginBottom: '1.5rem' }

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  background: 'rgba(255,255,255,0.94)',
  border: '1px solid rgba(102,83,59,0.12)',
  borderRadius: '24px',
  padding: 'clamp(1.35rem, 5vw, 2.5rem)',
  boxShadow: '0 24px 70px rgba(54,42,27,0.11)',
  animation: 'fadeUp 0.6s ease 0.15s both',
}

const eyebrowStyle: CSSProperties = {
  color: '#9a7547',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textAlign: 'center',
  margin: '0 0 0.7rem',
}

const titleStyle: CSSProperties = {
  fontSize: 'clamp(1.65rem, 6vw, 2.05rem)',
  fontWeight: 700,
  color: '#211d18',
  margin: '0 0 0.65rem',
  textAlign: 'center',
  letterSpacing: '-0.04em',
}

const subtitleStyle: CSSProperties = {
  fontSize: '0.96rem',
  color: '#756c61',
  lineHeight: 1.6,
  margin: '0 0 2rem',
  textAlign: 'center',
}

const formGroupStyle: CSSProperties = { marginBottom: '1.15rem' }

const fieldLabelStyle: CSSProperties = {
  display: 'block',
  color: '#352f28',
  fontSize: '0.9rem',
  fontWeight: 650,
  marginBottom: '0.55rem',
}

const starsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.35rem',
  margin: '0.3rem 0 0.6rem',
}

const starButtonStyle: CSSProperties = {
  width: 'clamp(48px, 13vw, 64px)',
  height: 'clamp(48px, 13vw, 64px)',
  padding: 0,
  border: 0,
  background: 'transparent',
  fontSize: 'clamp(2.7rem, 12vw, 3.6rem)',
  lineHeight: 1,
  cursor: 'pointer',
  transition: 'transform 0.15s ease, color 0.15s ease',
}

const ratingValueStyle: CSSProperties = {
  display: 'block',
  color: '#867b6e',
  fontSize: '0.8rem',
  textAlign: 'center',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.9rem 1rem',
  border: '1px solid #ded8cf',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  color: '#211d18',
  backgroundColor: '#fff',
  WebkitTextFillColor: '#211d18',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
  boxSizing: 'border-box',
}

const hintStyle: CSSProperties = {
  display: 'block',
  marginTop: '0.4rem',
  color: '#887f73',
  fontSize: '0.76rem',
}

const errorStyle: CSSProperties = {
  color: '#b42318',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  margin: '0 0 1rem',
}

const buttonStyle: CSSProperties = {
  width: '100%',
  padding: '1rem',
  background: '#171512',
  color: '#fff',
  border: 'none',
  borderRadius: '100px',
  fontSize: '0.95rem',
  fontWeight: 650,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background 0.15s ease, transform 0.15s ease, opacity 0.15s ease',
}

const loadingStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '2rem',
}

const modalBackdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 10,
  display: 'grid',
  placeItems: 'center',
  padding: '1rem',
  background: 'rgba(23,21,18,0.55)',
}

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  padding: 'clamp(1.35rem, 5vw, 2rem)',
  borderRadius: '22px',
  background: '#fff',
  boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
  textAlign: 'center',
}

const consentActionsStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }
const declineButtonStyle: CSSProperties = { ...buttonStyle, background: '#eee9e1', color: '#352f28' }

const spinnerStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '3px solid rgba(0,0,0,0.1)',
  borderTopColor: '#9a7547',
  animation: 'spin 1s linear infinite',
}

const voucherBoxStyle: CSSProperties = {
  background: 'linear-gradient(145deg, #f5f0e8 0%, #eee5d8 100%)',
  borderRadius: '18px',
  padding: '1.5rem',
  textAlign: 'center',
  marginBottom: '1.5rem',
  border: '1px solid rgba(154,117,71,0.25)',
}

const voucherLabelStyle: CSSProperties = { fontSize: '0.88rem', color: '#625746', margin: '0 0 0.5rem' }

const voucherCodeStyle: CSSProperties = {
  fontSize: 'clamp(1.55rem, 7vw, 2rem)',
  fontWeight: 800,
  color: '#392d1e',
  letterSpacing: '0.15em',
  margin: '0.5rem 0',
  fontFamily: 'monospace',
}

const discountStyle: CSSProperties = { fontSize: '1.1rem', fontWeight: 700, color: '#72522d', margin: '0.5rem 0' }
const voucherExpiryStyle: CSSProperties = { fontSize: '0.85rem', fontWeight: 600, color: '#51473a', margin: '0.75rem 0 0' }
const voucherNoteStyle: CSSProperties = { fontSize: '0.85rem', color: '#716452', margin: '0.5rem 0 0', lineHeight: 1.5 }
