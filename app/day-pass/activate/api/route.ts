import { findRecord, updateRecord, Tables } from '@/app/lib/airtable'
import { escapeAirtableString } from '@/app/lib/airtable-helpers'

interface DayPassFields {
  Name?: string
  Status?: string
  Username?: string
  'Date Activated'?: string
}

async function fetchVerkadaUserPin(): Promise<string | null> {
  try {
    const UUID = process.env.VERKADA_UUID
    if (!UUID) {
      console.error('VERKADA_UUID environment variable not set')
      return null
    }

    // Generate Verkada API token
    const tokenRes = await fetch('https://api.verkada.com/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.VERKADA_MEMBER_KEY,
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

    // Fetch day pass record from Airtable
    const escapedPaymentId = escapeAirtableString(paymentId)
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
    if (fields.Status === 'Unused') {
      try {
        await updateRecord<DayPassFields>(Tables.DayPasses, record.id, {
          Status: 'Activated',
          'Date Activated': new Date().toISOString().split('T')[0], // YYYY-MM-DD format
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

    // // Determine pass type based on the Stripe payment links
    // let passType = 'Day Pass'
    // const stripeLink = fields['Stripe link (from User)'] || ''
    // if (stripeLink.includes('dRm9AV636cQF8Jx26a')) {
    //   passType = 'Happy Hour Pass'
    // } else if (stripeLink.includes('00weVf3UY3g5f7V7qu')) {
    //   passType = 'Day Pass'
    // }
    // // TODO: Consider storing pass type directly in Airtable for more robust classification

    console.log(`Activated pass for ${fields.Username}, door code: ${doorCode}`)

    return Response.json({
      success: true,
      doorCode,
      // passType,
      userName: fields.Username || 'Guest'
    })

  } catch (error) {
    console.error('Error processing day pass activation:', error)
    return Response.json({ success: false, status: 'error' })
  }
}
