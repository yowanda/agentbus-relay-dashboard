'use client'

import { useState } from 'react'

export default function Login() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      const d = await res.json()
      if (d.ok) {
        window.location.href = '/'
      } else {
        setErr(d.error || 'Gagal masuk')
      }
    } catch {
      setErr('Koneksi gagal')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0e14', color: '#e6e6e6', fontFamily: 'system-ui, sans-serif',
    }}>
      <form onSubmit={submit} style={{
        background: '#111a26', border: '1px solid #1e2a3a', borderRadius: 12,
        padding: 32, width: 320,
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>📡 AgentBus Relay</h1>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 20px' }}>Masuk untuk melihat dashboard</p>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: 15,
            background: '#0a0e14', border: '1px solid #1e2a3a', borderRadius: 8,
            color: '#e6e6e6', marginBottom: 12,
          }}
        />
        {err && <p style={{ color: '#ff4d6d', fontSize: 13, margin: '0 0 12px' }}>{err}</p>}
        <button type="submit" disabled={busy} style={{
          width: '100%', padding: '10px', fontSize: 15, fontWeight: 'bold',
          background: '#00d4aa', border: 'none', borderRadius: 8, cursor: 'pointer',
          color: '#0a0e14', opacity: busy ? 0.6 : 1,
        }}>
          {busy ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
