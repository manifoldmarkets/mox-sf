import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member Portal | Mox',
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
