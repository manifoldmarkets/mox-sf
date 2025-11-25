'use client'
import { useState } from 'react'
import { Event } from '@/app/lib/events'
import PastEventsList from './PastEventsList'

interface PastEventsContentProps {
  events: Event[]
}

export default function PastEventsContent({ events }: PastEventsContentProps) {
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  // Filter events based on featured toggle
  const filteredEvents = showFeaturedOnly
    ? events.filter(event => event.featured)
    : events

  return (
    <>
      {/* Header with toggle - aligned to match events column */}
      <div className="flex gap-4 mb-2">
        {/* Invisible spacer to match month label width */}
        <div className="flex-shrink-0 w-24 hidden lg:block"></div>

        {/* Title and toggle inline */}
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-700 font-display">
            Past Events
          </h1>

          {/* Featured toggle - styled like "Show faces" toggle, inline with title */}
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className="flex items-center gap-3 cursor-pointer text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
            role="switch"
            aria-checked={showFeaturedOnly}
          >
            <span className="text-sm font-semibold">Show featured only</span>
            <div className={`relative inline-flex h-6 w-11 items-center transition-colors ${showFeaturedOnly ? 'bg-amber-900 dark:bg-amber-900' : 'bg-gray-300 dark:bg-gray-700'}`}>
              <span className={`inline-block h-5 w-5 transform bg-white transition-transform ${showFeaturedOnly ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>
      </div>


      {/* Events List */}
      <PastEventsList events={filteredEvents} />
    </>
  )
}
