export async function POST(request: Request) {
  const res = await request.json()
  const pin = res.pin as String

  if (pin === process.env.MASTER_PIN || pin === process.env.DAILY_PIN) {
    try {
      return unlockDoor()
    } catch (error) {
      console.error('Error unlocking door:', error)
      return Response.json({ success: false, error: 'Failed to unlock door' })
    }
  }

  return Response.json({ success: false })
}

async function unlockDoor() {
  // Generate Verkada API token
  const tokenRes = await fetch('https://api.verkada.com/token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'x-api-key': process.env.VERKADA_API_KEY,
    },
  })
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
  // TODO: our API should return proper error codes in the responses
  if (resp.status === 200) {
    return Response.json({ success: true })
  } else {
    return Response.json({ success: false, error: data })
  }
}

/* doors response:
Doors [
  {
    acu_id: '02a68420-416e-4bdf-9427-88a898d7c863',
    acu_name: 'TD52 · DDDH-EXQ7-T3NC',
    api_control_enabled: false,
    camera_info: {
      inside_camera_id: null,
      intercom_camera_id: '02a68420-416e-4bdf-9427-88a898d7c863',
      outside_camera_id: null
    },
    door_id: 'ffa16025-e120-4094-b6be-29a6ed19b84c',
    name: 'Main Lobby Entrance  Door',
    site: {
      name: '1680 Mission St, SF',
      site_id: '086b26b3-1cb4-4943-a6f6-8831f15dcf9a'
    }
  }
]
*/
