import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { scrapeEventUrl } from '@/app/lib/event-scraper'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return NextResponse.json({ error: 'URL must start with https://' }, { status: 400 })
    }

    const data = await scrapeEventUrl(url)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching event URL:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch event details'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
