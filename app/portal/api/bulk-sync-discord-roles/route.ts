import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { syncDiscordRole, isDiscordConfigured } from '@/app/lib/discord'
import { findRecords, Tables } from '@/app/lib/airtable'

interface PersonFields {
  Name?: string
  'Discord Username'?: string
  Tier?: string
  Status?: string
}

interface PersonWithDiscord {
  id: string
  name: string
  discordUsername: string
  tier: string | null
  status: string | null
}

/**
 * POST: Bulk sync Discord roles for all members with linked Discord usernames
 * Staff only
 */
export async function POST() {
  const session = await getSession()

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (!isDiscordConfigured()) {
    return NextResponse.json({ error: 'Discord integration not configured' }, { status: 503 })
  }

  try {
    // Fetch all people with Discord usernames from Airtable
    const records = await findRecords<PersonFields>(
      Tables.People,
      'AND({Discord Username} != "", {Status} = "Joined")',
      {
        fields: ['Name', 'Discord Username', 'Tier', 'Status'],
      }
    )

    const people: PersonWithDiscord[] = records
      .filter((record) => record.fields['Discord Username'])
      .map((record) => ({
        id: record.id,
        name: record.fields.Name || '',
        discordUsername: record.fields['Discord Username']!,
        tier: record.fields.Tier || null,
        status: record.fields.Status || null,
      }))

    // Sync each person's Discord role
    const results: {
      success: Array<{ name: string; discordUsername: string; role: string }>
      failed: Array<{ name: string; discordUsername: string; error: string }>
      skipped: Array<{ name: string; discordUsername: string; reason: string }>
    } = {
      success: [],
      failed: [],
      skipped: [],
    }

    for (const person of people) {
      // Add delay to avoid Discord rate limiting (they allow ~5-10 req/sec)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const result = await syncDiscordRole(person.discordUsername, person.tier, person.status)

      if (result.success) {
        results.success.push({
          name: person.name,
          discordUsername: person.discordUsername,
          role: result.roleAssigned || 'unknown',
        })
      } else if (result.error?.includes('not found')) {
        results.skipped.push({
          name: person.name,
          discordUsername: person.discordUsername,
          reason: result.error,
        })
      } else {
        results.failed.push({
          name: person.name,
          discordUsername: person.discordUsername,
          error: result.error || 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      total: people.length,
      synced: results.success.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      results,
    })
  } catch (error) {
    console.error('Error bulk syncing Discord roles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
