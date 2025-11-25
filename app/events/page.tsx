import EventsSection from '../components/EventsSection'
import { getEvents } from '../lib/events'
import { Metadata } from 'next'
import Link from 'next/link'

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
          <p className="text-primary-100 text-sm mb-3">What's happening at Mox</p>

          {/* Past Events link */}
          <Link
            href="/events/past"
            className="inline-flex items-center gap-2 text-primary-100 hover:text-white text-sm font-medium transition-colors"
          >
            View Past Events
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        <EventsSection fullPage={false} events={events} />
      </div>
    </div>
  )
}
