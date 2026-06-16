import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mox Summer Season',
  description:
    'A summer season of Mox talks, workshops, discussions, and social events at the frontier of ideas.',
  openGraph: {
    title: 'Mox Summer Season',
    description:
      'A summer season of Mox talks, workshops, discussions, and social events at the frontier of ideas.',
    url: 'https://moxsf.com/summerseason',
  },
}

export default function SummerSeasonPage() {
  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#f4e5bd',
      }}
    >
      <iframe
        src="/summerseason/index.html"
        title="Mox Summer Season"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
        }}
      />
    </main>
  )
}
