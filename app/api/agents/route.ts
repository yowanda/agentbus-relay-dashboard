import { NextResponse } from 'next/server'

const RELAY_URL = process.env.RELAY_URL || 'https://agentbus.reckora.my.id'

// Cloudflare menolak User-Agent default (403) — pakai UA kustom.
const HEADERS = { 'User-Agent': 'AgentBusClient/1.0' }

export async function GET() {
  try {
    const headers: Record<string, string> = { ...HEADERS }
    // Relay mode ketat: /agents butuh auth. Tanpa secret, kembalikan status apa adanya.
    if (process.env.RELAY_AGENT_SECRET) {
      headers['X-Agent-Secret'] = process.env.RELAY_AGENT_SECRET
    }
    const res = await fetch(`${RELAY_URL}/agents`, { headers, cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Relay tidak terjangkau' }, { status: 502 })
  }
}
