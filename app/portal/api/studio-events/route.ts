import { createSign } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { isActiveMember } from '@/app/lib/membership'
import { getUserProfile } from '../../profile'
import { env } from '@/app/lib/env'

export const runtime = 'nodejs'

const CALENDAR_ID =
  'c_acc9eff7dc86650092fc61257917d3ae04511f0268ac5c6744008fecc8347476@group.calendar.google.com'
const TIME_ZONE = 'America/Los_Angeles'

function encode(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

async function getGoogleAccessToken() {
  const email = env.STUDIO_CALENDAR_SERVICE_ACCOUNT_EMAIL
  const privateKey = env.STUDIO_CALENDAR_PRIVATE_KEY.replace(/\\n/g, '\n')
  if (!email || !privateKey) throw new Error('Studio calendar is not configured')

  const now = Math.floor(Date.now() / 1000)
  const header = encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = encode(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const unsigned = `${header}.${claims}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  const assertion = `${unsigned}.${encode(signer.sign(privateKey))}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  if (!response.ok) throw new Error('Could not connect to Google Calendar')
  const token = await response.json() as { access_token: string }
  return token.access_token
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const effectiveUserId = session.viewingAsUserId || session.userId
  const profile = await getUserProfile(effectiveUserId)
  if (!profile || !isActiveMember({ status: profile.status, tier: profile.tier })) {
    return NextResponse.json({ error: 'Active membership required' }, { status: 403 })
  }

  try {
    const body = await request.json() as {
      title?: string
      start?: string
      end?: string
      description?: string
    }
    const title = body.title?.trim()
    const start = body.start?.trim()
    const end = body.end?.trim()

    if (!title || title.length > 150 || !start || !end) {
      return NextResponse.json({ error: 'Name, start, and end are required' }, { status: 400 })
    }
    if (end <= start) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }
    const duration = new Date(end).getTime() - new Date(start).getTime()
    if (!Number.isFinite(duration) || duration > 3 * 60 * 60 * 1000) {
      return NextResponse.json({ error: '3h limit exceeded' }, { status: 400 })
    }

    const accessToken = await getGoogleAccessToken()
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title,
          description: body.description?.trim().slice(0, 1000) || undefined,
          start: { dateTime: start, timeZone: TIME_ZONE },
          end: { dateTime: end, timeZone: TIME_ZONE },
          extendedProperties: {
            private: {
              createdByMoxMember: profile.email,
              createdVia: 'mox-member-portal',
            },
          },
        }),
      }
    )

    if (!response.ok) {
      console.error('[studio-calendar] Google insert failed:', response.status, await response.text())
      return NextResponse.json({ error: 'Could not add event' }, { status: 502 })
    }

    const event = await response.json() as { id: string }
    return NextResponse.json({ event: { id: event.id } })
  } catch (error) {
    console.error('[studio-calendar] Create event failed:', error)
    return NextResponse.json({ error: 'Could not add event' }, { status: 500 })
  }
}
