'use client'
import { useState } from 'react'
import { Event, formatEventTime } from '../../lib/events'
import { format, isAfter, isSameDay, startOfDay } from 'date-fns'
import { ExternalLink } from 'lucide-react'

function EventTypeTag({ type }: { type: string }) {
  const colorMap = {
    public: 'bg-green-100 text-green-800',
    private: 'bg-red-100 text-red-800',
    members: 'bg-amber-100 text-amber-800',
  }
  const colorClasses =
    colorMap[type.toLowerCase()] || 'bg-gray-100 text-gray-800'

  return (
    <span
      className={`absolute top-4 right-4 px-2 py-1 text-xs font-medium ${colorClasses}`}
    >
      {type.toLowerCase()}
    </span>
  )
}

function EventCard({ event }: { event: Event }) {
  const isLong = event.notes && event.notes.length > 480
  const [expanded, setExpanded] = useState(!isLong)

  return (
    <div className="bg-white p-6 shadow-sm border border-amber-100 relative">
      {event.type && <EventTypeTag type={event.type} />}
      <div className="flex items-center gap-2 mb-2">
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-900 hover:text-amber-900 flex items-center gap-2 group"
            title="Event details"
          >
            <h3 className="text-xl font-semibold">{event.name}</h3>
            <ExternalLink
              size={16}
              className="text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
            />
          </a>
        ) : (
          <h3 className="text-xl font-semibold text-amber-900">{event.name}</h3>
        )}
      </div>
      <p className="text-sm mb-2 text-amber-800 font-semibold">
        {formatEventTime(event)}
        {event.host && <span className="font-normal"> - {event.host}</span>}
      </p>

      {event.location && (
        <p className="text-gray-600 text-sm mb-2">📍 {event.location}</p>
      )}
      {event.notes && (
        <p className="text-gray-700 mt-2 whitespace-pre-wrap">
          {expanded ? event.notes : event.notes.slice(0, 480)}
          {!expanded && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-amber-700 hover:text-amber-900 underline ml-2 cursor-pointer"
            >
              ... more
            </button>
          )}
        </p>
      )}
    </div>
  )
}

export default function EventsList({ events }: { events: Event[] }) {
  const today = startOfDay(new Date())

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

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {sortedDays.map(({ date, events: dayEvents }) => (
        <div key={date.toISOString()}>
          <p className="text-sm uppercase tracking-wide text-amber-700 mb-3">
            {format(date, 'EEEE, MMMM d')}
          </p>
          <div className="space-y-4">
            {dayEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-gray-500 text-center py-8">No upcoming events</p>
      )}
    </div>
  )
}
