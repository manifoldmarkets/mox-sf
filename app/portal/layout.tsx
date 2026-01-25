import { Metadata } from 'next'
import './portal.css'

export const metadata: Metadata = {
  title: 'Member Portal | Mox',
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="portal">{children}</div>
}
