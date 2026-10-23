const PHA_API_BASE = (
  process.env.PHA_API_URL ||
  process.env.NEXT_PUBLIC_PHA_API_URL ||
  'https://api.phaqr.my.id'
).replace(/\/$/, '')

export function getPHAFormEndpoint(sessionId: string, submit = false): string {
  const endpoint = `${PHA_API_BASE}/form/${encodeURIComponent(sessionId)}`
  return submit ? `${endpoint}/submit` : endpoint
}

export async function checkPHAFormStatus(sessionId: string) {
  const response = await fetch(getPHAFormEndpoint(sessionId), { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`PHA API mengembalikan HTTP ${response.status}`)
  }

  const result: unknown = await response.json()
  if (!result || typeof result !== 'object' || typeof (result as { submitted?: unknown }).submitted !== 'boolean') {
    throw new Error('Respons status dari PHA API tidak valid')
  }

  return result as { submitted: boolean; submittedAt?: string }
}
