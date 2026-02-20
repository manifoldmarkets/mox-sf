import { getEvents, Event } from '../lib/events'
import { Metadata } from 'next'
import EventsClient from './EventsClient'
import { isAfter, isSameDay, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import DataErrorBanner from '../components/DataErrorBanner'

export const metadata: Metadata = {
  title: 'Events | Mox',
  description: 'Upcoming events and gatherings at Mox',
}

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  let allEvents: Event[] = []
  let dataError = false
  try {
    allEvents = await getEvents()
  } catch (e) {
    console.error('Failed to fetch events:', e)
    dataError = true
  }

  // Filter to only future events (using Pacific timezone since Mox is in SF)
  const pacificTz = 'America/Los_Angeles'
  const nowInPacific = toZonedTime(new Date(), pacificTz)
  const todayInPacific = startOfDay(nowInPacific)
  const futureEvents = allEvents.filter((event) => {
    const eventDateInPacific = toZonedTime(event.startDate, pacificTz)
    return (
      isAfter(eventDateInPacific, todayInPacific) ||
      isSameDay(eventDateInPacific, todayInPacific)
    )
  })

  // Sort by start time
  futureEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  return (
    <>
      {dataError && <DataErrorBanner />}
      <EventsClient initialEvents={futureEvents} />
    </>
  )
}
