const PHA_API_BASE = (
  process.env.PHA_API_URL ||
  process.env.NEXT_PUBLIC_PHA_API_URL ||
  'https://api.phaqr.my.id'
).replace(/\/$/, '')

export function getPHAFormEndpoints(sessionId: string): string[] {
  const id = encodeURIComponent(sessionId)
  return [
    `${PHA_API_BASE}/form/${id}/submit`,
    `${PHA_API_BASE}/api/form/${id}/submit`,
  ]
}

export async function fetchPHAForm(sessionId: string, payload: unknown) {
  const endpoints = getPHAFormEndpoints(sessionId)

  for (let index = 0; index < endpoints.length; index += 1) {
    const response = await fetch(endpoints[index], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (response.status !== 404 || index === endpoints.length - 1) {
      return { response, endpoints }
    }
  }

  throw new Error('PHA API tidak memiliki endpoint submit form yang tersedia')
}
