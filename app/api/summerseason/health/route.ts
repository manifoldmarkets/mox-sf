import { NextResponse } from 'next/server'
import { getSummerSeasonEvents } from '@/app/lib/summerseason-events'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const envStatus = {
    AIRTABLE_API_KEY: Boolean(process.env.AIRTABLE_API_KEY),
    AIRTABLE_BASE_ID: Boolean(process.env.AIRTABLE_BASE_ID),
  }

  try {
    const result = await getSummerSeasonEvents()
    return NextResponse.json(
      {
        ok: true,
        env: envStatus,
        rawRecordCount: result.rawRecordCount,
        eventCount: result.events.length,
        saveTheDateCount: result.saveTheDateCount,
        skippedRecordCount: result.skippedRecordCount,
        generatedAt: result.generatedAt,
        sampleEvents: result.events.slice(0, 3).map((event) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          category: event.category,
          tbd: Boolean(event.tbd),
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('[summerseason/health] Airtable health check failed:', error)
    return NextResponse.json(
      {
        ok: false,
        env: envStatus,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown Airtable health check error',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
