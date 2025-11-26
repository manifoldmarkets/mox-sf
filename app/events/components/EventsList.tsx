'use client'
import { useState } from 'react'
import { Event, formatEventTime } from '../../lib/events'
import { format, isAfter, isSameDay, startOfDay } from 'date-fns'

function EventTypeTag({ type }: { type: string }) {
  const colorMap = {
    public: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    private: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    members: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  }
  const colorClasses =
    colorMap[type.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium ${colorClasses}`}
    >
      {type.toLowerCase()}
    </span>
  )
}

function EventCard({ event }: { event: Event }) {
  const isLong = event.description && event.description.length > 480
  const [expanded, setExpanded] = useState(!isLong)

  // Validate URL
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  const hasValidUrl = isValidUrl(event.url)

  const CardContent = (
    <>
      {/* Title and Link */}
      <div className="flex items-start justify-between gap-3 mb-2">
        {hasValidUrl ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-bold text-lg leading-tight inline-flex items-center gap-2 flex-1"
          >
            {event.name}
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <h3 className="text-amber-900 dark:text-amber-400 font-bold text-lg leading-tight flex-1">
            {event.name}
          </h3>
        )}
      </div>

      <p className="text-sm mb-2 text-amber-800 dark:text-amber-500 font-sans font-semibold">
        {formatEventTime(event)}
        {event.host && <span className="font-normal"> | {event.host}</span>}
      </p>

      {event.type && (
        <div className="mb-2">
          <EventTypeTag type={event.type} />
        </div>
      )}

      {event.location && (
        <p className="text-text-secondary dark:text-text-secondary-dark text-sm mb-2">📍 {event.location}</p>
      )}
      {event.description && (
        <p className="text-text-primary dark:text-text-primary-dark mt-2 whitespace-pre-line text-sm leading-snug break-words">
          {expanded ? event.description : event.description.slice(0, 480)}
          {!expanded && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 underline ml-2 cursor-pointer"
            >
              ... more
            </button>
          )}
        </p>
      )}
    </>
  )

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100/50 dark:hover:bg-gray-700/80 transition-colors overflow-hidden">
      {CardContent}
    </div>
  )
}

export default function EventsList({ events }: { events: Event[] }) {
  const today = startOfDay(new Date())
  const [showAll, setShowAll] = useState(false)

  // Filter out past events, then sort by start time
  const futureEvents = events.filter((event) => {
    return isAfter(event.startDate, today) || isSameDay(event.startDate, today)
  })
  futureEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  // Group events by day
  const eventsByDay = futureEvents.reduce(
    (groups, event) => {
      const date = event.startDate
      const dayKey = format(date, 'yyyy-MM-dd')
      if (!groups[dayKey]) {
        groups[dayKey] = {
          date,
          events: [],
        }
      }
      groups[dayKey].events.push(event)
      return groups
    },
    {} as Record<string, { date: Date; events: Event[] }>
  )

  // Sort days chronologically
  const sortedDays = Object.values(eventsByDay).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )

  // By default show 5 days' worth of events.
  const THRESHOLD = 5
  const totalEvents = futureEvents.length
  const visibleDays = showAll ? sortedDays : sortedDays.slice(0, THRESHOLD)

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {visibleDays.map(({ date, events: dayEvents }) => (
        <div key={date.toISOString()}>
          <p className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3 font-sans">
            {format(date, 'EEEE, MMMM d')}
          </p>
          <div className="space-y-1">
            {dayEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
      {!showAll && totalEvents > THRESHOLD && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors cursor-pointer"
        >
          Show all upcoming events
        </button>
      )}
      {events.length === 0 && (
        <p className="text-text-secondary dark:text-text-secondary-dark text-center py-8">No upcoming events</p>
      )}
    </div>
  )
}
