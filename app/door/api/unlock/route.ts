import { getEventByToken } from '@/app/lib/events'
import { isWithinEventWindow } from '@/app/lib/event-access'
import { adminUnlockDoor } from '@/app/lib/verkada'

const throttleMap = new Map<string, { count: number; resetAt: number }>()
const THROTTLE_WINDOW_MS = 30_000
const THROTTLE_MAX = 10

function checkThrottle(token: string): boolean {
  const now = Date.now()
  const entry = throttleMap.get(token)
  if (!entry || now > entry.resetAt) {
    throttleMap.set(token, { count: 1, resetAt: now + THROTTLE_WINDOW_MS })
    return true
  }
  if (entry.count >= THROTTLE_MAX) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string' || !/^[A-Za-z0-9]{12}$/.test(token)) {
      return Response.json({ success: false, reason: 'invalid' })
    }

    if (!checkThrottle(token)) {
      return Response.json(
        { success: false, reason: 'throttled' },
        { status: 429 }
      )
    }

    const event = await getEventByToken(token)
    if (!event) {
      return Response.json({ success: false, reason: 'not-found' })
    }

    if (!isWithinEventWindow(event.startDate, event.endDate)) {
      console.log(
        `[door-unlock] event=${event.id} name="${event.name}" ok=false reason=inactive`
      )
      return Response.json({ success: false, reason: 'inactive' })
    }

    const result = await adminUnlockDoor()
    console.log(
      `[door-unlock] event=${event.id} name="${event.name}" ok=${result.ok}`
    )

    if (result.ok) {
      return Response.json({ success: true })
    }
    return Response.json({ success: false, reason: 'verkada-error' })
  } catch (error) {
    console.error('Error processing door unlock:', error)
    return Response.json({ success: false, reason: 'error' }, { status: 500 })
  }
}
