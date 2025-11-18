import EventsSection from '../components/EventsSection'
import { getEvents } from '../lib/events'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events | Mox',
}

export default async function EventsPage() {
  const events = await getEvents()
  return (
    <div className="min-h-screen bg-primary-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white font-playfair mb-2">
            Events
          </h2>
          <p className="text-primary-100 text-sm">What's happening at Mox</p>
        </div>
        <EventsSection fullPage={false} events={events} />
      </div>
    </div>
  )
}
