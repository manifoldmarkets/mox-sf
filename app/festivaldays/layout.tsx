import { Metadata } from 'next'
import '../portal/portal.css'

export const metadata: Metadata = {
  title: 'Festival Days | Mox',
  description:
    'Festival-season coworking at Mox during LessOnline & Manifest, June 3–16 2026.',
}

export default function FestivalDaysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="portal">{children}</div>
}
