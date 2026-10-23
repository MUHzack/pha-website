import { NextResponse } from 'next/server'
import { getFormStatus } from '@/lib/form-status'
import { fetchPHAForm, getPHAFormEndpoints } from '@/lib/pha-server'

interface RouteContext {
  params: Promise<{ sessionId: string }>
}

function isValidSessionId(sessionId: string): boolean {
  return /^[a-zA-Z0-9_-]{3,60}$/.test(sessionId)
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
    const { response: upstream, endpoints } = await fetchPHAForm(sessionId, payload)
    if (upstream.status === 404) {
      return NextResponse.json(
        { error: `Server pada PHA_API_URL tidak menyediakan endpoint submit form. Path yang dicoba: ${endpoints.map((url) => new URL(url).pathname).join(', ')}. PHA_API_URL harus mengarah ke server publik yang meneruskan request ke PHA download server.` },
        { status: 404 },
      )
    }
    const body = await upstream.text()
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('PHA form submit proxy failed:', error)
    return NextResponse.json(
      { error: 'Server website tidak dapat terhubung ke PHA API. Periksa PHA_API_URL dan status API.' },
      { status: 502 },
    )
  }
}
