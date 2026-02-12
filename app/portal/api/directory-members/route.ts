import { NextResponse } from 'next/server'
import { findRecords, Tables } from '@/app/lib/airtable'
import { getSession } from '@/app/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const records = await findRecords(
      Tables.People,
      'AND({Show in directory}=TRUE(), {Status}="Joined")',
      {
        fields: ['Name'],
        sort: [{ field: 'Name', direction: 'asc' }],
      }
    )

    const members = records
      .filter((r) => r.fields.Name)
      .map((r) => ({
        id: r.id,
        name: (r.fields as Record<string, unknown>).Name as string,
      }))

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching directory members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
