import { NextResponse } from 'next/server'

const RELAY_URL = process.env.RELAY_URL || 'https://agentbus.reckora.my.id'
const AGENT_ID = 'dashboard'

const HEADERS = {
  'User-Agent': 'AgentBusClient/1.0',
  'Content-Type': 'application/json',
}

const ALLOWED_TARGETS = ['musashi', 'kelya', 'rella']

export async function POST(req: Request) {
  const secret = process.env.RELAY_AGENT_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'RELAY_AGENT_SECRET belum dikonfigurasi di server' },
      { status: 503 }
    )
  }

  let body: { to?: string; type?: string; text?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body tidak valid' }, { status: 400 })
  }

  const { to, text } = body
  if (!to || !text || !text.trim()) {
    return NextResponse.json({ ok: false, error: 'Tujuan dan pesan wajib diisi' }, { status: 400 })
  }

  const targets = to === 'all' ? ALLOWED_TARGETS : [to]
  if (!targets.every(t => ALLOWED_TARGETS.includes(t))) {
    return NextResponse.json({ ok: false, error: 'Target tidak dikenal' }, { status: 400 })
  }

  const msgType = body.type === 'task_request' ? 'task_request' : 'chat'
  const results = []
  for (const target of targets) {
    try {
      const res = await fetch(`${RELAY_URL}/send`, {
        method: 'POST',
        headers: { ...HEADERS, 'X-Agentbus-Token': secret },
        body: JSON.stringify({
          from: AGENT_ID,
          to: target,
          type: msgType,
          payload: { text: text.trim() },
        }),
      })
      const data = await res.json()
      results.push({
        to: target,
        ok: data.ok === true,
        delivery: data.delivery,
        error: data.error,
      })
    } catch {
      results.push({ to: target, ok: false, error: 'Relay tidak terjangkau' })
    }
  }

  return NextResponse.json({ ok: results.every(r => r.ok), results })
}
