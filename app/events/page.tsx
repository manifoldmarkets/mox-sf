import { getEvents } from '../lib/events'
import { Metadata } from 'next'
import EventsClient from './EventsClient'
import { isAfter, isSameDay, startOfDay } from 'date-fns'

export const metadata: Metadata = {
  title: 'Events | Mox',
  description: 'Upcoming events and gatherings at Mox',
}

export default async function EventsPage() {
  const allEvents = await getEvents()

  // Filter to only future events
  const today = startOfDay(new Date())
  const futureEvents = allEvents.filter((event) => {
    return isAfter(event.startDate, today) || isSameDay(event.startDate, today)
  })

  // Sort by start time
  futureEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  return <EventsClient initialEvents={futureEvents} />
}
