export interface FormStatusResponse {
  submitted: boolean
  submittedAt?: string
}

export interface VoucherData {
  code: string
  discountPercent: number
  discountAmount: number
  message: string
  expiresAt: string
}

export interface SubmitFormResponse {
  success: boolean
  voucher?: VoucherData
  error?: string
}

export interface FormData {
  rating: number
  name: string
  gender: 'female' | 'male'
  birthDate: string
  phone: string
  visitedBranch: string
  discoverySource: string
  feedback: string
  socialMediaConsent: boolean
}

export async function checkFormStatus(sessionId: string, branch: 'primary' | 'uc' = 'primary'): Promise<FormStatusResponse> {
  const apiPath = `/api/form/${encodeURIComponent(sessionId)}`
  const res = await fetch(branch === 'uc' ? `${apiPath}?branch=uc` : apiPath, {
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Gagal mengecek status form (${res.status})`)
  }
  const result: unknown = await res.json()
  if (!result || typeof result !== 'object' || typeof (result as FormStatusResponse).submitted !== 'boolean') {
    throw new Error('Respons status form tidak valid')
  }
  return result as FormStatusResponse
}

export async function submitForm(
  sessionId: string, 
  data: FormData,
  branch: 'primary' | 'uc' = 'primary'
): Promise<SubmitFormResponse> {
  const apiPath = `/api/form/${encodeURIComponent(sessionId)}`
  const res = await fetch(branch === 'uc' ? `${apiPath}?branch=uc` : apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const result: SubmitFormResponse = await res.json()
  if (!res.ok && !result.error) throw new Error(`Gagal mengirim feedback (${res.status})`)
  return result
}
