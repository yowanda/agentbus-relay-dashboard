import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const COOKIE = 'relay_dash_auth'

function sign(pw: string): string {
  return createHmac('sha256', pw).update('relay-dash-auth').digest('hex')
}

export async function POST(req: Request) {
  const expected = process.env.DASHBOARD_PASSWORD
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'Password belum dikonfigurasi' }, { status: 500 })
  }
  let password = ''
  try {
    password = (await req.json()).password || ''
  } catch { /* abaikan */ }
  if (password && password === expected) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, sign(expected), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  }
  // Delay kecil anti brute-force
  await new Promise(r => setTimeout(r, 800))
  return NextResponse.json({ ok: false, error: 'Password salah' }, { status: 401 })
}
