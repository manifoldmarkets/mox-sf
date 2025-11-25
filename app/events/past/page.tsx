import { Metadata } from 'next'
import { getPastEvents, sortPastEventsByPriorityAndDate } from '@/app/lib/events'
import PastEventsContent from './components/PastEventsContent'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Past Events | Mox',
  description: 'Browse past events hosted at Mox',
}

export default async function PastEventsPage() {
  const rawEvents = await getPastEvents()
  const events = sortPastEventsByPriorityAndDate(rawEvents)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-page-dark text-text-primary dark:text-text-primary-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header - aligned to match events column */}
        <div className="flex gap-4">
          {/* Invisible spacer to match month label width */}
          <div className="flex-shrink-0 w-24 hidden lg:block"></div>

          {/* Header content */}
          <div className="flex-1 min-w-0">
            {/* Back to Events link */}
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-amber-900 dark:text-amber-700 hover:text-amber-950 dark:hover:text-amber-600 text-sm font-medium mb-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Upcoming Events
            </Link>

          </div>
        </div>

        {/* Title, Toggle, and Events List */}
        <PastEventsContent events={events} />
      </div>
    </div>
  )
}
