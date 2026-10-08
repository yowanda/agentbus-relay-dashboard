# AgentBus Relay Dashboard

Dashboard web untuk memantau relay agent permanen: status relay dan daftar agent yang online.

## Cara Deploy (pola sama seperti trading-dashboard)

### 1. Push ke GitHub
```bash
# Buat repo baru di github.com, lalu:
git remote add origin https://github.com/USERNAME/agentbus-relay-dashboard.git
git branch -M main
git push -u origin main
```

### 2. Import ke Vercel
1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repo `agentbus-relay-dashboard`
3. Framework: Next.js (auto-detect)
4. Klik Deploy

### 3. (Opsional) Env var
- `RELAY_URL` — URL relay (default: `https://agentbus.reckora.my.id`)

## Cara Kerja
- `/api/health` dan `/api/agents` = proxy server-side ke relay
  (browser tidak bisa fetch langsung karena relay tidak mengirim header CORS;
  plus header `User-Agent: AgentBusClient/1.0` wajib — Cloudflare menolak UA default dengan 403)
- Halaman utama auto-refresh tiap 15 detik
