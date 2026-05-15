import { getSession } from '@/app/lib/session'
import { getRecord, updateRecord, Tables } from '@/app/lib/airtable'
import { env } from '@/app/lib/env'
import { sendChannelMessage, DISCORD_CHANNELS } from '@/app/lib/discord'

interface DayPassFields {
  Name?: string
  Status?: string
  'Pass Type'?: string
  'Date Activated'?: string
  User?: string[]
  Email?: string[]
}

interface PersonFields {
  Name?: string
  Email?: string
  Photo?: { url: string }[]
}

async function fetchVerkadaUserPin(): Promise<string | null> {
  try {
    const UUID = env.VERKADA_UUID
    if (!UUID) {
      console.error('VERKADA_UUID environment variable not set')
      return null
    }

    const tokenRes = await fetch('https://api.verkada.com/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': env.VERKADA_MEMBER_KEY,
      },
    })

    if (!tokenRes.ok) {
      console.error('Failed to get Verkada token:', tokenRes.status)
      return null
    }

    const { token } = await tokenRes.json()

    const userRes = await fetch(
      `https://api.verkada.com/access/v1/access_users/user?user_id=${UUID}`,
      {
        headers: { accept: 'application/json', 'x-verkada-auth': token },
      }
    )

    if (!userRes.ok) {
      console.error('Failed to fetch Verkada user data:', userRes.status)
      return null
    }

    const userData = await userRes.json()
    return userData.entry_code || null
  } catch (error) {
    console.error('Error fetching Verkada user PIN:', error)
    return null
  }
}

function computeExpiresAt(
  dateActivated: string,
  passType: string
): string {
  const activated = new Date(dateActivated)
  if (passType === 'Week Pass') {
    activated.setDate(activated.getDate() + 6)
  }
  return activated.toISOString().split('T')[0]
}

async function postActivationToDiscord({
  personName,
  passType,
  expiresAt,
  photoUrl,
}: {
  personName: string
  passType: string
  expiresAt: string
  photoUrl: string | null
}): Promise<void> {
  try {
    const expiryFormatted = new Date(expiresAt + 'T00:00:00').toLocaleDateString(
      'en-US',
      { weekday: 'long', month: 'short', day: 'numeric' }
    )

    await sendChannelMessage(
      DISCORD_CHANNELS.NOTIFICATIONS,
      `🎟️ **${personName}** activated a ${passType}`,
      [
        {
          color: 0xd97706, // amber-600
          fields: [
            { name: 'Pass', value: passType, inline: true },
            { name: 'Expires', value: `11pm ${expiryFormatted}`, inline: true },
          ],
          ...(photoUrl ? { thumbnail: { url: photoUrl } } : {}),
        },
      ]
    )
  } catch (error) {
    console.error('[activate-day-pass] Discord post failed:', error)
    // Don't propagate — Discord failure must not block activation.
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const effectiveUserId = session.viewingAsUserId || session.userId

    const { passId } = await request.json()
    if (!passId || typeof passId !== 'string') {
      return Response.json({ error: 'passId is required' }, { status: 400 })
    }

    const passRecord = await getRecord<DayPassFields>(Tables.DayPasses, passId)
    if (!passRecord) {
      return Response.json({ error: 'Pass not found' }, { status: 404 })
    }

    // Ownership check: the pass must be linked to the current user.
    const linkedUserIds = passRecord.fields.User || []
    if (!linkedUserIds.includes(effectiveUserId)) {
      return Response.json({ error: 'Not your pass' }, { status: 403 })
    }

    const currentStatus = passRecord.fields.Status
    const passType = passRecord.fields['Pass Type'] || 'Day Pass'

    if (currentStatus === 'Expired') {
      return Response.json({ error: 'Pass has expired' }, { status: 400 })
    }

    // Flip status on first activation, otherwise reuse existing activation date.
    let dateActivated = passRecord.fields['Date Activated']
    const isFirstActivation = currentStatus === 'Unused'

    if (isFirstActivation) {
      dateActivated = new Date().toISOString().split('T')[0]
      await updateRecord<DayPassFields>(Tables.DayPasses, passRecord.id, {
        Status: 'Activated',
        'Date Activated': dateActivated,
      })
    }

    const doorCode = await fetchVerkadaUserPin()
    if (!doorCode) {
      return Response.json(
        { error: 'Failed to retrieve door code. Please contact support.' },
        { status: 500 }
      )
    }

    const expiresAt = dateActivated
      ? computeExpiresAt(dateActivated, passType)
      : null

    // Post to Discord only on the transition Unused -> Activated, so re-opening
    // an already-activated pass doesn't double-post.
    if (isFirstActivation && expiresAt) {
      const person = await getRecord<PersonFields>(
        Tables.People,
        effectiveUserId
      )
      const personName = person?.fields.Name || 'Someone'
      const photoUrl = person?.fields.Photo?.[0]?.url || null
      // Fire-and-forget so the user gets their door code without waiting on Discord.
      void postActivationToDiscord({
        personName,
        passType,
        expiresAt,
        photoUrl,
      })
    }

    return Response.json({
      success: true,
      doorCode,
      passType,
      expiresAt,
    })
  } catch (error) {
    console.error('[activate-day-pass] error:', error)
    return Response.json(
      { error: 'Failed to activate pass' },
      { status: 500 }
    )
  }
}
