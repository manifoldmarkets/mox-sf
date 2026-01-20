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

    // Fetch day pass records from Airtable
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appkHZ2UvU6SouT5y'
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Day%20Passes?filterByFormula={Name}="${paymentId}"`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    )

    if (!airtableResponse.ok) {
      console.error('Airtable API error:', airtableResponse.status)
      return Response.json({ success: false, status: 'error' })
    }

    const data = await airtableResponse.json()

    if (!data.records || data.records.length === 0) {
      return Response.json({ success: false, status: 'not-found' })
    }

    const record = data.records[0]
    const fields = record.fields

    // Check if pass is expired or already used
    if (fields.Status === 'Expired') {
      return Response.json({ success: false, status: 'expired' })
    }

    // If status is "Unused", activate it and update the record
    let dateActivated = fields['Date Activated']
    if (fields.Status === 'Unused') {
      dateActivated = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      // Update the record to mark as activated
      const updateResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Day%20Passes/${record.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              Status: 'Activated',
              'Date Activated': dateActivated,
            }
          })
        }
      )

      if (!updateResponse.ok) {
        console.error('Failed to update Airtable record:', updateResponse.status)
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

    const passType = fields['Pass Type'] || 'Day Pass'
    console.log(`Activated ${passType} for ${fields.Username}, door code: ${doorCode}`)

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
