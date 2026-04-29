import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Match exactly /<sessionId> — single path segment
  const match = pathname.match(/^\/([^/]+)\/?$/)

  if (match) {
    const sessionId = match[1]

    // Reject obviously malformed IDs before hitting Supabase
    // Valid: alphanumeric, hyphens, underscores, 3–60 chars
    const isValidFormat = /^[a-zA-Z0-9_-]{3,60}$/.test(sessionId)

    if (!isValidFormat) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - api routes
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)',
  ],
}