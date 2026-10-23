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

export async function checkFormStatus(sessionId: string): Promise<FormStatusResponse> {
  const res = await fetch(`${PHA_API_BASE}/form/${sessionId}`)
  return res.json()
}

export async function submitForm(
  sessionId: string, 
  data: FormData
): Promise<SubmitFormResponse> {
  const res = await fetch(`${PHA_API_BASE}/form/${sessionId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}
