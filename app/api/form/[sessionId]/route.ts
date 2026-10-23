import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { getFormStatus } from '@/lib/form-status'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

function isValidSessionId(sessionId: string): boolean {
  return /^[a-zA-Z0-9_-]{3,60}$/.test(sessionId)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(5)
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join('')
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  if (!isValidSessionId(sessionId)) {
    return NextResponse.json({ error: 'ID sesi tidak valid' }, { status: 400 })
  }

  try {
    const status = await getFormStatus(sessionId)
    return NextResponse.json(status, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Customer review status lookup failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status review gagal dibaca dari database.' },
      { status: 502 },
    )
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  if (!isValidSessionId(sessionId)) {
    return NextResponse.json({ error: 'ID sesi tidak valid' }, { status: 400 })
  }

  try {
    const payload: unknown = await request.json()
    if (!isObject(payload)) {
      return NextResponse.json({ success: false, error: 'Data review tidak valid.' }, { status: 400 })
    }

    const rating = payload.rating
    const feedback = typeof payload.feedback === 'string' ? payload.feedback.trim() : ''
    const genderValue = typeof payload.gender === 'string' ? payload.gender : ''
    const birthDateValue = typeof payload.birthDate === 'string' ? payload.birthDate : ''
    const nameValue = typeof payload.name === 'string' ? payload.name.trim() : ''
    const phoneValue = typeof payload.phone === 'string' ? payload.phone.trim() : ''
    const visitedBranchValue = typeof payload.visitedBranch === 'string' ? payload.visitedBranch.trim() : ''
    const discoverySourceValue = typeof payload.discoverySource === 'string' ? payload.discoverySource : ''
    const gender = genderValue || null
    const birthDate = birthDateValue || null
    const name = nameValue || null
    const phone = phoneValue || null

    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Pilih rating dari 1 sampai 5.' }, { status: 400 })
    }
    if (feedback.length < 10 || feedback.length > 5000) {
      return NextResponse.json({ success: false, error: 'Pesan harus berisi 10 sampai 5000 karakter.' }, { status: 400 })
    }
    if (!['female', 'male'].includes(genderValue)) {
      return NextResponse.json({ success: false, error: 'Pilihan gender tidak valid.' }, { status: 400 })
    }
    if (!nameValue) {
      return NextResponse.json({ success: false, error: 'Nama wajib diisi.' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateValue)) {
      return NextResponse.json({ success: false, error: 'Format tanggal lahir tidak valid.' }, { status: 400 })
    }
    {
      const parsedDate = new Date(`${birthDate}T00:00:00.000Z`)
      if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== birthDateValue) {
        return NextResponse.json({ success: false, error: 'Tanggal lahir tidak valid.' }, { status: 400 })
      }
      const minimumBirthDate = new Date()
      minimumBirthDate.setUTCHours(0, 0, 0, 0)
      minimumBirthDate.setUTCFullYear(minimumBirthDate.getUTCFullYear() - 10)
      if (birthDateValue > minimumBirthDate.toISOString().slice(0, 10)) {
        return NextResponse.json({ success: false, error: 'Usia minimal untuk mengisi form adalah 10 tahun.' }, { status: 400 })
      }
    }
    if (nameValue.length > 200 || phoneValue.length > 40 || visitedBranchValue.length > 200) {
      return NextResponse.json({ success: false, error: 'Ada data yang terlalu panjang.' }, { status: 400 })
    }
    const normalizedPhone = phoneValue.replace(/[\s().-]/g, '')
    if (!/^(?:\+?62|0)\d{8,13}$/.test(normalizedPhone)) {
      return NextResponse.json({ success: false, error: 'Masukkan nomor HP aktif yang valid.' }, { status: 400 })
    }
    if (!visitedBranchValue) {
      return NextResponse.json({ success: false, error: 'Cabang yang dikunjungi wajib diisi.' }, { status: 400 })
    }
    if (!['instagram', 'tiktok', 'friends_family', 'google', 'other'].includes(discoverySourceValue)) {
      return NextResponse.json({ success: false, error: 'Pilih sumber informasi Photogenics.' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: sessionFile, error: sessionError } = await supabase
      .from('photobox_session_files')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1)
      .maybeSingle()

    if (sessionError) {
      console.error('Could not validate review session:', sessionError.message)
      return NextResponse.json({ success: false, error: 'Sesi foto gagal divalidasi.' }, { status: 500 })
    }
    if (!sessionFile) {
      return NextResponse.json({ success: false, error: 'Sesi foto tidak ditemukan.' }, { status: 404 })
    }

    const { data: settings, error: settingsError } = await supabase
      .from('photobox_payment_settings')
      .select('form_voucher_discount_percent, pricing_by_shots')
      .eq('id', 'default')
      .maybeSingle()

    if (settingsError) {
      console.error('Could not load voucher settings:', settingsError.message)
    }
    const rawPercent = Number(settings?.form_voucher_discount_percent ?? 10)
    const discountPercent = Number.isFinite(rawPercent) ? Math.min(100, Math.max(0, Math.round(rawPercent))) : 10
    const prices = isObject(settings?.pricing_by_shots) ? settings.pricing_by_shots : {}
    const rawBasePrice = Number(prices['4'] ?? 35000)
    const basePrice = Number.isFinite(rawBasePrice) ? Math.max(0, Math.round(rawBasePrice)) : 35000
    const discountAmount = Math.floor(basePrice * discountPercent / 100)

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = generateVoucherCode()
      const codeSha256 = createHash('sha256').update(code).digest('hex')
      const { data, error } = await supabase.rpc('submit_photobox_customer_review', {
        p_session_id: sessionId,
        p_name: name,
        p_gender: gender,
        p_birth_date: birthDate,
        p_email: null,
        p_phone: phone,
        p_visited_branch: visitedBranchValue,
        p_discovery_source: discoverySourceValue,
        p_rating: rating,
        p_feedback: feedback,
        p_voucher_code: code,
        p_voucher_code_sha256: codeSha256,
        p_discount_percent: discountPercent,
      })

      if (error) {
        console.error('Could not save review and voucher:', error.message)
        return NextResponse.json(
          { success: false, error: 'Penyimpanan review belum siap. Pastikan migration submit review sudah dijalankan di Supabase.' },
          { status: 500 },
        )
      }

      if (isObject(data) && data.success === true) {
        const expiresAt = typeof data.expiresAt === 'string'
          ? data.expiresAt
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        return NextResponse.json({
          success: true,
          voucher: {
            code,
            discountPercent,
            discountAmount,
            expiresAt,
            message: 'Voucher berlaku untuk 1x transaksi berikutnya di Photogenics',
          },
        })
      }

      if (isObject(data) && data.error === 'voucher_collision') continue
      const message = isObject(data) && data.error === 'already_submitted'
        ? 'Review untuk sesi ini sudah pernah dikirim.'
        : isObject(data) && data.error === 'session_not_found'
          ? 'Sesi foto tidak ditemukan.'
          : isObject(data) && data.error === 'invalid_rating'
            ? 'Pilih rating dari 1 sampai 5.'
            : isObject(data) && data.error === 'invalid_feedback'
              ? 'Pesan wajib diisi (maksimal 5000 karakter).'
              : 'Review tidak dapat disimpan.'
      return NextResponse.json({ success: false, error: message }, { status: 409 })
    }

    return NextResponse.json(
      { success: false, error: 'Gagal membuat kode voucher unik. Silakan coba lagi.' },
      { status: 503 },
    )
  } catch (error) {
    console.error('Customer review submit failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan review.' },
      { status: 500 },
    )
  }
}
