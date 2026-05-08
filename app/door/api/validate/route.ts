import { getEventByToken, formatEventTime } from '@/app/lib/events'
import { isWithinEventWindow, getEffectiveEnd } from '@/app/lib/event-access'

const ipThrottleMap = new Map<string, { count: number; resetAt: number }>()
const IP_WINDOW_MS = 60_000
const IP_MAX = 30

function checkIpThrottle(ip: string): boolean {
  const now = Date.now()
  const entry = ipThrottleMap.get(ip)
  if (!entry || now > entry.resetAt) {
    ipThrottleMap.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS })
    return true
  }
  if (entry.count >= IP_MAX) return false
  entry.count++
  return true
}

function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!checkIpThrottle(ip)) {
      console.warn(`[door-validate] ip=${ip} throttled`)
      return Response.json(
        { status: 'not-found' },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const { token } = await request.json()

    if (!token || typeof token !== 'string' || !/^[A-Za-z0-9]{12}$/.test(token)) {
      return Response.json({ status: 'not-found' }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const event = await getEventByToken(token)
    if (!event) {
      console.log(`[door-validate] ip=${ip} not-found`)
      return Response.json({ status: 'not-found' }, { headers: { 'Cache-Control': 'no-store' } })
    }

    const active = isWithinEventWindow(event.startDate, event.endDate)
    const effectiveEnd = getEffectiveEnd(event.startDate, event.endDate)

    return Response.json(
      {
        status: active ? 'active' : 'inactive',
        eventName: event.name,
        formattedHours: formatEventTime(event, true),
        startsAt: event.startDate.toISOString(),
        endsAt: effectiveEnd.toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error validating door token:', error)
    return Response.json({ status: 'error' }, { status: 500 })
  }
}
