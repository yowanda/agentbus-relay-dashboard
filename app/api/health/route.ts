import { NextResponse } from 'next/server'

const RELAY_URL = process.env.RELAY_URL || 'https://agentbus.reckora.my.id'

// Cloudflare menolak User-Agent default (403) — pakai UA kustom.
const HEADERS = { 'User-Agent': 'AgentBusClient/1.0' }

async function proxy(path: string) {
  const res = await fetch(`${RELAY_URL}${path}`, { headers: HEADERS, cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function GET() {
  try {
    return await proxy('/health')
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Relay tidak terjangkau' }, { status: 502 })
  }
}
