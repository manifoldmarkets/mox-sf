import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mox — Lobby Display',
}

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ isolation: 'isolate' }}>
      {children}
    </div>
  )
}
