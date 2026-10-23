export interface Template {
  id: string
  name: string
  previewUrl: string
  overlayUrl: string
}

export interface TemplatesResponse {
  templates: Template[]
}

export async function getTemplates(kind: string): Promise<TemplatesResponse> {
  const PHA_API_BASE = process.env.NEXT_PUBLIC_PHA_API_URL || ''
  const res = await fetch(`${PHA_API_BASE}/api/templates?kind=${kind}`)
  return res.json()
}
