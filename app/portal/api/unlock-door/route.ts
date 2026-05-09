import { getSession } from '@/app/lib/session'
import { getRecord, Tables } from '@/app/lib/airtable'
import { isActiveMember } from '@/app/lib/membership'
import { adminUnlockDoor } from '@/app/lib/verkada'

const throttleMap = new Map<string, { count: number; resetAt: number }>()
const THROTTLE_WINDOW_MS = 30_000
const THROTTLE_MAX = 10

function checkThrottle(userId: string): boolean {
  const now = Date.now()
  const entry = throttleMap.get(userId)
  if (!entry || now > entry.resetAt) {
    throttleMap.set(userId, { count: 1, resetAt: now + THROTTLE_WINDOW_MS })
    return true
  }
  if (entry.count >= THROTTLE_MAX) return false
  entry.count++
  return true
}

export async function POST() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const effectiveUserId = session.viewingAsUserId || session.userId

    if (!checkThrottle(effectiveUserId)) {
      return Response.json(
        { success: false, error: 'Too many unlock attempts. Wait a moment.' },
        { status: 429 }
      )
    }

    const record = await getRecord<{ Status?: string; Tier?: string }>(
      Tables.People,
      effectiveUserId
    )
    if (
      !isActiveMember({
        status: record?.fields.Status ?? null,
        tier: record?.fields.Tier ?? null,
      })
    ) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const result = await adminUnlockDoor()
    console.log(
      `[portal-unlock] user=${effectiveUserId} ok=${result.ok}`
    )
    if (result.ok) {
      return Response.json({ success: true })
    }
    return Response.json({ success: false, error: result.error })
  } catch (error) {
    console.error('Error processing portal unlock:', error)
    return Response.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
