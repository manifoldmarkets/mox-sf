import { Metadata } from 'next'
import {
  getPastEvents,
  sortPastEventsByPriorityAndDate,
} from '@/app/lib/events'
import HistoryClient from './HistoryClient'

export const metadata: Metadata = {
  title: 'History | Mox',
  description: 'Explore the history of events and gatherings hosted at Mox',
}

export default async function PastEventsPage() {
  let rawEvents: Awaited<ReturnType<typeof getPastEvents>> = []
  try {
    rawEvents = await getPastEvents()
  } catch (e) {
    console.error('Failed to fetch past events:', e)
  }
  const events = sortPastEventsByPriorityAndDate(rawEvents)

  return <HistoryClient initialEvents={events} />
}
