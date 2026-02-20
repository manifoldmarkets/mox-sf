import { NextResponse } from 'next/server'
import { getRecords, Tables } from '@/app/lib/airtable'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Minimal query — fetch 1 record to check Airtable connectivity
    await getRecords(Tables.People, { maxRecords: 1, fields: ['Name'] })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Health check failed:', e)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}

