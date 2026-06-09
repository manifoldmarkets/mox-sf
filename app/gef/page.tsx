import type { Metadata } from 'next'
import GefLanding from './GefLanding'

export const metadata: Metadata = {
  title: 'Global Expert Fellowship | Mox',
  description:
    'A Global Expert Fellowship for international researchers, founders, and domain specialists building frontier technology projects at Mox in San Francisco.',
  openGraph: {
    title: 'Global Expert Fellowship | Mox',
    description:
      'Bring your research or startup to SF for a season with the Mox community.',
    url: 'https://moxsf.com/gef',
    siteName: 'Mox SF',
    images: [
      {
        url: '/images/014.jpg',
        width: 1920,
        height: 1440,
        alt: 'Mox community event',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Expert Fellowship | Mox',
    description:
      'Bring your research or startup to SF for a season with the Mox community.',
    images: ['/images/014.jpg'],
  },
}

export default function Page() {
  return <GefLanding />
}
