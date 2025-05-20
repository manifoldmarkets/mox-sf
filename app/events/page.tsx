import EventsSection from '../components/EventsSection'
import { getEvents } from '../lib/events'

export default async function EventsPage() {
  const events = await getEvents()
  return <EventsSection fullPage={false} events={events} />
}
