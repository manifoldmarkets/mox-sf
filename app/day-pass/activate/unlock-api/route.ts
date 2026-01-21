export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return Response.json({ success: false, error: 'No payment ID provided' })
    }

    // Simple validation: just check that a payment ID was provided
    // Anyone with a valid activate link can unlock
    return await unlockDoor()
  } catch (error) {
    console.error('Error processing door unlock:', error)
    return Response.json({ success: false, error: 'Server error' })
  }
}

async function unlockDoor() {
  try {
    // Generate Verkada API token
    const tokenRes = await fetch('https://api.verkada.com/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.VERKADA_API_KEY,
      },
    })

    if (!tokenRes.ok) {
      console.error('Failed to get Verkada token:', tokenRes.status)
      return Response.json({
        success: false,
        error: 'Failed to authenticate with door system',
      })
    }

    const { token } = await tokenRes.json()

    // Unlock door using token
    const resp = await fetch(
      'https://api.verkada.com/access/v1/door/admin_unlock',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-verkada-auth': token,
        },
        body: JSON.stringify({
          door_id: 'ffa16025-e120-4094-b6be-29a6ed19b84c',
        }),
      }
    )

    const data = await resp.json()

    if (resp.status === 200) {
      return Response.json({ success: true })
    } else {
      console.error('Verkada unlock failed:', data)
      return Response.json({ success: false, error: 'Failed to unlock door' })
    }
  } catch (error) {
    console.error('Error unlocking door:', error)
    return Response.json({ success: false, error: 'Failed to unlock door' })
  }
}
