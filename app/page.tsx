'use client'

import { useEffect, useState } from 'react'

interface Agent {
  id: string
  name: string
  capabilities: string[]
  online: boolean
  last_seen: string | null
  registered_at: string | null
}

interface Health {
  ok: boolean
  ts?: string
  error?: string
}

const cardStyle: React.CSSProperties = {
  background: '#111a26',
  border: '1px solid #1e2a3a',
  borderRadius: 12,
  padding: 20,
}

const labelStyle: React.CSSProperties = {
  color: '#888',
  fontSize: 13,
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: 1,
}

const inputStyle: React.CSSProperties = {
  background: '#0a0e14',
  border: '1px solid #1e2a3a',
  borderRadius: 8,
  color: '#e6e6e6',
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: 'inherit',
}

function timeAgo(iso: string | null): string {
  if (!iso) return '-'
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 0) return 'baru saja'
  if (s < 60) return `${s} dtk lalu`
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`
  return `${Math.floor(s / 86400)} hari lalu`
}

export default function RelayDashboard() {
  const [health, setHealth] = useState<Health | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Form kirim perintah
  const [target, setTarget] = useState('all')
  const [msgType, setMsgType] = useState('chat')
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, a] = await Promise.all([
          fetch('/api/health').then(r => r.json()),
          fetch('/api/agents').then(r => r.json()),
        ])
        setHealth(h)
        setAgents(a.agents || [])
        setError(a.error || h.error || null)
      } catch (e) {
        setError('Gagal menghubungi dashboard API')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const sendCommand = async () => {
    if (!msgText.trim() || sending) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: target, type: msgType, text: msgText }),
      })
      const d = await res.json()
      if (d.ok) {
        const detail = (d.results || []).map((r: any) => `${r.to}: ${r.delivery || 'terkirim'}`).join(', ')
        setSendResult(`✅ Terkirim — ${detail}`)
        setMsgText('')
      } else if (d.results) {
        const detail = (d.results || []).map((r: any) => `${r.to}: ${r.error || 'gagal'}`).join(', ')
        setSendResult(`⚠️ Sebagian gagal — ${detail}`)
      } else {
        setSendResult(`❌ ${d.error || 'Gagal mengirim'}`)
      }
    } catch {
      setSendResult('❌ Koneksi ke dashboard API gagal')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}><h1>🔄 Memuat...</h1></div>
  }

  const online = agents.filter(a => a.online)
  const relayOk = health?.ok === true

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
      <header style={{ marginBottom: 28, borderBottom: '1px solid #1e2a3a', paddingBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>📡 AgentBus Relay</h1>
        <p style={{ color: '#888', margin: '8px 0 0' }}>
          {relayOk ? '🟢 Relay hidup' : '🔴 Relay mati'} •
          {' '}{online.length} online dari {agents.length} agent •
          refresh tiap 15 detik
        </p>
        {error && <p style={{ color: '#ff4d6d' }}>⚠️ {error}</p>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={cardStyle}>
          <div style={labelStyle}>Status Relay</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: relayOk ? '#00d4aa' : '#ff4d6d' }}>
            {relayOk ? 'HIDUP' : 'MATI'}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Agent Online</div>
          <div style={{ fontSize: 28, fontWeight: 'bold' }}>{online.length}<span style={{ color: '#888', fontSize: 18 }}>/{agents.length}</span></div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Cek Terakhir</div>
          <div style={{ fontSize: 18 }}>
            {health?.ts ? new Date(health.ts).toLocaleString('id-ID') : '-'}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Agent Terdaftar</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {agents.map(a => (
          <div key={a.id} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{a.online ? '🟢' : '⚪'}</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 17 }}>{a.name || a.id}</div>
                <div style={{ color: '#888', fontSize: 13, fontFamily: 'monospace' }}>{a.id}</div>
              </div>
            </div>
            {a.capabilities?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {a.capabilities.map(c => (
                  <span key={c} style={{
                    display: 'inline-block', background: '#1e2a3a', borderRadius: 20,
                    padding: '3px 10px', fontSize: 12, marginRight: 6, marginBottom: 4,
                  }}>{c}</span>
                ))}
              </div>
            )}
            <div style={{ color: '#888', fontSize: 13 }}>
              Terakhir terlihat: {timeAgo(a.last_seen)}
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && !error && (
        <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>Belum ada agent terdaftar.</p>
      )}

      <h2 style={{ fontSize: 20, marginBottom: 16, marginTop: 32 }}>✉️ Kirim Perintah</h2>
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <div style={labelStyle}>Target</div>
            <select value={target} onChange={e => setTarget(e.target.value)} style={inputStyle}>
              <option value="all">Semua agent</option>
              <option value="musashi">musashi</option>
              <option value="kelya">kelya</option>
              <option value="rella">rella</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Jenis</div>
            <select value={msgType} onChange={e => setMsgType(e.target.value)} style={inputStyle}>
              <option value="chat">Chat</option>
              <option value="task_request">Task request</option>
            </select>
          </div>
        </div>
        <div style={labelStyle}>Pesan</div>
        <textarea
          value={msgText}
          onChange={e => setMsgText(e.target.value)}
          placeholder="Tulis perintah untuk agent..."
          rows={3}
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
        />
        <button
          onClick={sendCommand}
          disabled={sending || !msgText.trim()}
          style={{
            marginTop: 12, padding: '10px 24px', fontSize: 15, fontWeight: 'bold',
            background: '#00d4aa', border: 'none', borderRadius: 8, cursor: 'pointer',
            color: '#0a0e14', opacity: sending || !msgText.trim() ? 0.5 : 1,
          }}
        >
          {sending ? 'Mengirim...' : 'Kirim'}
        </button>
        {sendResult && (
          <p style={{ marginTop: 12, fontSize: 14, color: sendResult.startsWith('✅') ? '#00d4aa' : '#ffb020' }}>
            {sendResult}
          </p>
        )}
      </div>

      <footer style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #1e2a3a', color: '#555', fontSize: 13 }}>
        AgentBus Relay Dashboard • data via API relay (server-side proxy)
      </footer>
    </div>
  )
}
