import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Don't protect API routes or public routes
  if (
    path.startsWith('/portal/api') ||
    path.startsWith('/portal/login') ||
    path.startsWith('/portal/verify')
  ) {
    return NextResponse.next()
  }

  // Protect all other /portal/* routes
  if (path.startsWith('/portal')) {
    const sessionCookie = request.cookies.get('mox-session')

    // If no session cookie, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/portal/:path*',
}
