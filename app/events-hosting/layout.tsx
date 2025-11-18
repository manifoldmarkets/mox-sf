import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Host Your Event | Mox',
}

export default function EventsHostingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
