import { Metadata } from 'next'
import '../portal/portal.css'

export const metadata: Metadata = {
  title: 'EAG Day Pass | Mox',
}

export default function EAG26Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="portal">{children}</div>
}
