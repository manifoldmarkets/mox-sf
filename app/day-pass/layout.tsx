import { Metadata } from 'next'
import '../portal/portal.css'

export const metadata: Metadata = {
  title: 'Day Passes | Mox',
}

export default function DayPassLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="portal">{children}</div>
}
