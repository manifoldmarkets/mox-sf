import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { findRecords, Tables } from '@/app/lib/airtable'

export interface PersonForMapping {
  id: string
  name: string
  email: string
  discordUsername: string | null
}

interface PersonFields {
  Name?: string
  Email?: string
  'Discord Username'?: string
}

export async function GET() {
  const session = await getSession()

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const records = await findRecords<PersonFields>(
      Tables.People,
      '{Email} != ""',
      {
        fields: ['Name', 'Email', 'Discord Username'],
        sort: [{ field: 'Name', direction: 'asc' }],
      }
    )

    const allPeople: PersonForMapping[] = records.map((record) => ({
      id: record.id,
      name: record.fields.Name || '',
      email: record.fields.Email || '',
      discordUsername: record.fields['Discord Username'] || null,
    }))

    return NextResponse.json({ people: allPeople })
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
