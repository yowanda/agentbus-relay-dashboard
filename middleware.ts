import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'relay_dash_auth'

async function validSession(val: string | undefined): Promise<boolean> {
  const pw = process.env.DASHBOARD_PASSWORD
  if (!val || !pw) return false
  try {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(pw), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode('relay-dash-auth'))
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    return val === expected
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/login' || pathname === '/api/login') {
    return NextResponse.next()
  }
  // Bila password belum dikonfigurasi, tolak semua (fail closed)
  if (!process.env.DASHBOARD_PASSWORD) {
    return new NextResponse('Dashboard belum dikonfigurasi', { status: 503 })
  }
  const ok = await validSession(req.cookies.get(COOKIE)?.value)
  if (ok) return NextResponse.next()
  return NextResponse.redirect(new URL('/login', req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
