import EventsSection from '../components/EventsSection'
import { getEvents } from '../lib/events'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events | Mox',
}

export default async function EventsPage() {
  const events = await getEvents()
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-400 font-playfair mb-2">
            Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">What's happening at Mox</p>
        </div>
        <EventsSection fullPage={false} events={events} />
      </div>
    </div>
  )
}
