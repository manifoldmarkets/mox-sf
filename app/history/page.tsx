import { Metadata } from 'next'
import {
  Event,
  getPastEvents,
  sortPastEventsByPriorityAndDate,
} from '@/app/lib/events'
import HistoryClient from './HistoryClient'
import DataErrorBanner from '../components/DataErrorBanner'

export const metadata: Metadata = {
  title: 'History | Mox',
  description: 'Explore the history of events and gatherings hosted at Mox',
}

export default async function PastEventsPage() {
  let rawEvents: Event[] = []
  let dataError = false
  try {
    rawEvents = await getPastEvents()
  } catch (e) {
    console.error('Failed to fetch past events:', e)
    dataError = true
  }
  const events = sortPastEventsByPriorityAndDate(rawEvents)

  return (
    <>
      {dataError && <DataErrorBanner />}
      <HistoryClient initialEvents={events} />
    </>
  )
}
