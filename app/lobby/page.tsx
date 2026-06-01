import { getEvents } from '../lib/events'
import { isAfter, isSameDay, startOfDay } from 'date-fns'
import { toZonedTime, format as formatTz } from 'date-fns-tz'
import LobbyClient from './LobbyClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LobbyPage() {
  let events: Awaited<ReturnType<typeof getEvents>> = []
  try {
    events = await getEvents()
  } catch (e) {
    console.error('Failed to fetch events for lobby:', e)
  }

  const pacificTz = 'America/Los_Angeles'
  const nowInPacific = toZonedTime(new Date(), pacificTz)
  const todayInPacific = startOfDay(nowInPacific)

  const upcomingEvents = events
    .filter((event) => {
      const eventDateInPacific = toZonedTime(event.startDate, pacificTz)
      return (
        isAfter(eventDateInPacific, todayInPacific) ||
        isSameDay(eventDateInPacific, todayInPacific)
      )
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  return <LobbyClient events={upcomingEvents} />
}
