import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { updateRecord, Tables } from '@/app/lib/airtable'

interface UpdateMapping {
  personId: string
  discordUsername: string
}

interface PersonFields {
  'Discord Username'?: string
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const mappings: UpdateMapping[] = body.mappings

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return NextResponse.json({ error: 'No mappings provided' }, { status: 400 })
    }

    if (mappings.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 mappings per request' }, { status: 400 })
    }

    // Validate all mappings
    for (const mapping of mappings) {
      if (!mapping.personId || typeof mapping.personId !== 'string') {
        return NextResponse.json({ error: 'Invalid personId' }, { status: 400 })
      }
      if (!mapping.discordUsername || typeof mapping.discordUsername !== 'string') {
        return NextResponse.json({ error: 'Invalid discordUsername' }, { status: 400 })
      }
      // Basic Discord username validation (2-32 chars, allows letters, numbers, underscores, periods)
      if (mapping.discordUsername.length < 2 || mapping.discordUsername.length > 32) {
        return NextResponse.json(
          { error: `Invalid Discord username length: ${mapping.discordUsername}` },
          { status: 400 }
        )
      }
    }

    const results: { success: string[]; failed: string[] } = { success: [], failed: [] }

    // Update each record
    for (const mapping of mappings) {
      try {
        await updateRecord<PersonFields>(Tables.People, mapping.personId, {
          'Discord Username': mapping.discordUsername,
        })
        results.success.push(mapping.personId)
      } catch (error) {
        console.error(`Failed to update ${mapping.personId}:`, error)
        results.failed.push(mapping.personId)
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.success.length,
      failed: results.failed.length,
      results,
    })
  } catch (error) {
    console.error('Error updating Discord usernames:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
