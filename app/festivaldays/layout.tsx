import { Metadata } from 'next'
import './summerseason.css'

export const metadata: Metadata = {
  title: 'Mox Summer Season',
  description:
    'A summer season of Mox talks, workshops, discussions, and social events at the frontier of ideas.',
}

export default function FestivalDaysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
