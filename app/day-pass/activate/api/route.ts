import { findRecord, updateRecord, Tables } from '@/app/lib/airtable'
import { escapeAirtableString } from '@/app/lib/airtable-helpers'
import { env } from '@/app/lib/env'

interface DayPassFields {
  Name?: string
  Status?: string
  Username?: string
  'Date Activated'?: string
  'Pass Type'?: string
}

async function fetchVerkadaUserPin(): Promise<string | null> {
  try {
    const UUID = env.VERKADA_UUID
    if (!UUID) {
      console.error('VERKADA_UUID environment variable not set')
      return null
    }

    // Generate Verkada API token
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

    // Fetch user access info to get PIN
    const userRes = await fetch(
      `https://api.verkada.com/access/v1/access_users/user?user_id=${UUID}`,
      {
        headers: {
          accept: 'application/json',
          'x-verkada-auth': token,
        },
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

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return Response.json({ success: false, status: 'not-found' })
    }

    // Truncate payment ID to last 6 chars to match how it's stored in Airtable
    // For multi-pass purchases, IDs end with "-1", "-2", etc. so we need to preserve that
    const truncatedId = paymentId.includes('-')
      ? paymentId.slice(0, -2).slice(-6) + paymentId.slice(-2) // e.g., "cs_live_abc123-1" -> "c123-1"
      : paymentId.slice(-6) // e.g., "cs_live_abc123" -> "bc123"

    // Fetch day pass record from Airtable
    const escapedPaymentId = escapeAirtableString(truncatedId)
    const record = await findRecord<DayPassFields>(
      Tables.DayPasses,
      `{Name}='${escapedPaymentId}'`
    )

    if (!record) {
      return Response.json({ success: false, status: 'not-found' })
    }

    const fields = record.fields

    // Check if pass is expired or already used
    if (fields.Status === 'Expired') {
      return Response.json({ success: false, status: 'expired' })
    }

    // If status is "Unused", activate it and update the record
    let dateActivated = fields['Date Activated']
    if (fields.Status === 'Unused') {
      dateActivated = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      try {
        await updateRecord<DayPassFields>(Tables.DayPasses, record.id, {
          Status: 'Activated',
          'Date Activated': dateActivated,
        })
      } catch (error) {
        console.error('Failed to update Airtable record:', error)
        // Continue anyway - we can still provide the door code
      }
    }

    // Get door code from Verkada user
    const doorCode = await fetchVerkadaUserPin()
    if (!doorCode) {
      console.error('Failed to fetch door code from Verkada')
      return Response.json({ success: false, status: 'error' })
    }

    const passType = fields['Pass Type'] || 'Day Pass'
    console.log(
      `Activated ${passType} for ${fields.Username}, door code: ${doorCode}`
    )

    // Calculate expiration date based on pass type
    // All passes expire at 11pm on the last day
    let expiresAt: string | null = null
    if (dateActivated) {
      const activatedDate = new Date(dateActivated)
      if (passType === 'Week Pass') {
        activatedDate.setDate(activatedDate.getDate() + 6) // 7 days total including activation day
      }
      // Day Pass and Happy Hour Pass expire same day at 11pm
      expiresAt = activatedDate.toISOString().split('T')[0]
    }

    return Response.json({
      success: true,
      doorCode,
      passType,
      userName: fields.Username || 'Guest',
      expiresAt,
    })
  } catch (error) {
    console.error('Error processing day pass activation:', error)
    return Response.json({ success: false, status: 'error' })
  }
}
