const PHA_API_BASE = process.env.NEXT_PUBLIC_PHA_API_URL || ''

export interface FormStatusResponse {
  submitted: boolean
  submittedAt?: string
}

export interface VoucherData {
  code: string
  discountPercent: number
  discountAmount: number
  message: string
}

export interface SubmitFormResponse {
  success: boolean
  voucher?: VoucherData
  error?: string
}

export interface FormData {
  name?: string
  email?: string
  phone?: string
  feedback: string
}

function getApiUrl(path: string): string {
  const base = PHA_API_BASE.replace(/\/$/, '')
  if (!base) {
    throw new Error('NEXT_PUBLIC_PHA_API_URL belum dikonfigurasi')
  }
  return `${base}${path}`
}

export async function checkFormStatus(sessionId: string): Promise<FormStatusResponse> {
  const res = await fetch(getApiUrl(`/form/${encodeURIComponent(sessionId)}`), {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Gagal mengecek status form (${res.status})`)
  }
  const result: unknown = await res.json()
  if (!result || typeof result !== 'object' || typeof (result as FormStatusResponse).submitted !== 'boolean') {
    throw new Error('Respons status form tidak valid')
  }
  return result as FormStatusResponse
}

export async function submitForm(
  sessionId: string, 
  data: FormData
): Promise<SubmitFormResponse> {
  const res = await fetch(getApiUrl(`/form/${encodeURIComponent(sessionId)}/submit`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const result: SubmitFormResponse = await res.json()
  if (!res.ok && !result.error) {
    throw new Error(`Gagal mengirim feedback (${res.status})`)
  }
  return result
}
