const PHA_API_BASE = (
  process.env.PHA_API_URL ||
  process.env.NEXT_PUBLIC_PHA_API_URL ||
  'https://api.phaqr.my.id'
).replace(/\/$/, '')

export function getPHAFormEndpoints(sessionId: string, submit = false): string[] {
  const id = encodeURIComponent(sessionId)
  if (submit) {
    return [
      `${PHA_API_BASE}/api/form/${id}/submit`,
      `${PHA_API_BASE}/form/${id}/submit`,
    ]
  }

  return [
    `${PHA_API_BASE}/api/form/${id}/status`,
    `${PHA_API_BASE}/form/${id}`,
  ]
}

export async function fetchPHAForm(sessionId: string, submit = false, payload?: unknown) {
  const endpoints = getPHAFormEndpoints(sessionId, submit)

  for (let index = 0; index < endpoints.length; index += 1) {
    const response = await fetch(endpoints[index], {
      method: submit ? 'POST' : 'GET',
      headers: submit ? { 'Content-Type': 'application/json' } : undefined,
      body: submit ? JSON.stringify(payload) : undefined,
      cache: 'no-store',
    })

    if (response.status !== 404 || index === endpoints.length - 1) {
      return { response, endpoints }
    }
  }

  throw new Error('PHA API tidak memiliki endpoint status form yang tersedia')
}

export async function checkPHAFormStatus(sessionId: string) {
  const { response } = await fetchPHAForm(sessionId)
  if (!response.ok) {
    throw new Error(`PHA API mengembalikan HTTP ${response.status}`)
  }

  const result: unknown = await response.json()
  if (!result || typeof result !== 'object' || typeof (result as { submitted?: unknown }).submitted !== 'boolean') {
    throw new Error('Respons status dari PHA API tidak valid')
  }

  return result as { submitted: boolean; submittedAt?: string }
}
