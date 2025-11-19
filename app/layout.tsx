import './globals.css'
import {
  Playfair_Display,
  Lora,
  Merriweather,
  Fira_Sans,
  Geist_Mono,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: ['300', '400', '700'],
})

const firaSans = Fira_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata = {
  metadataBase: new URL('https://moxsf.com'),
  title: 'Mox',
  description:
    'Mox is a coworking & events space in SF. For startups and charities; hackers and researchers; writers and other masters of craft',
  keywords:
    'coworking, San Francisco, startups, EA, AI safety, events space, Mission District',
  openGraph: {
    title: 'Mox SF',
    description:
      'Mox is a coworking & events space in SF. For startups and charities; hackers and researchers; writers and other masters of craft',
    url: 'https://moxsf.com',
    siteName: 'Mox SF',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/003.jpg',
        width: 1512,
        height: 1009,
        alt: 'Mox SF Coworking Space',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mox SF',
    description:
      'Mox is a coworking & events space in SF. For startups and charities; hackers and researchers; writers and other masters of craft',
    images: ['/images/003.jpg'],
  },
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/rte2kgi.css" />
      </head>
      <body
        className={`${playfair.variable} ${lora.variable} ${merriweather.variable} ${firaSans.variable} ${geistMono.variable} font-sans`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
