import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mox Keypad',
  description: "Enter pin code here, once you're at the front door of Mox!",
  openGraph: {
    images: ['/mox-door.png'],
  },
}

export default function DoorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
