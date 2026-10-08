import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AgentBus Relay Dashboard',
  description: 'Monitor relay agent permanen: status dan agent yang online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0a0e14', color: '#e6e6e6' }}>
        {children}
      </body>
    </html>
  )
}
