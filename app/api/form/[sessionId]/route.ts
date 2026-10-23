import { NextResponse } from 'next/server'
import { getPHAFormEndpoint } from '@/lib/pha-server'

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
    const upstream = await fetch(getPHAFormEndpoint(sessionId), { cache: 'no-store' })
    const body = await upstream.text()
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('PHA form status proxy failed:', error)
    return NextResponse.json(
      { error: 'Server website tidak dapat terhubung ke PHA API. Periksa PHA_API_URL dan status API.' },
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
    const upstream = await fetch(getPHAFormEndpoint(sessionId, true), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
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
