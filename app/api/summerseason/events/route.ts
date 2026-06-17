import { NextResponse } from 'next/server'
import { getSummerSeasonEvents } from '@/app/lib/summerseason-events'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const result = await getSummerSeasonEvents()
    return NextResponse.json(result.events, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Summer-Season-Raw-Records': String(result.rawRecordCount),
        'X-Summer-Season-Save-The-Dates': String(result.saveTheDateCount),
      },
    })
  } catch (error) {
    console.error('[summerseason/events] Airtable fetch failed:', error)
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown Airtable fetch error',
      },
      { status: 503 }
    )
  }
}
