import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { getRecord, Tables } from '@/app/lib/airtable'

interface OrgFields {
  Name?: string
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')

  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
  }

  try {
    const record = await getRecord<OrgFields>(Tables.Orgs, orgId)

    if (!record) {
      return NextResponse.json({ error: 'Org not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: record.fields.Name || 'Unknown',
    })
  } catch (error) {
    console.error('Error fetching org details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
