import { Event } from '../lib/events'
import { format, differenceInDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import Link from 'next/link'

interface EventsCardCompactProps {
  events: Event[]
}

export default function EventsCardCompact({ events }: EventsCardCompactProps) {
  // Show only upcoming events, limit to 5
  const upcomingEvents = events
    .filter((event) => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 5)

  const formatEventDate = (date: Date) => {
    // Convert to PST timezone
    const eventDate = toZonedTime(date, 'America/Los_Angeles')
    const now = toZonedTime(new Date(), 'America/Los_Angeles')
    const daysUntil = differenceInDays(eventDate, now)

    // If more than 7 days away, show just "Mon Nov 25"
    if (daysUntil > 7) {
      return format(eventDate, 'EEE MMM d')
    }

    // If within a week, show "Tue at 7pm" (or "Tue at 7:30pm")
    const dayOfWeek = format(eventDate, 'EEE')
    const minutes = eventDate.getMinutes()
    const timeFormat = minutes === 0 ? 'ha' : 'h:mma'
    const time = format(eventDate, timeFormat).toLowerCase()
    return `${dayOfWeek} at ${time}`
  }

  const getDateTimeParts = (date: Date) => {
    // Convert to PST timezone
    const eventDate = toZonedTime(date, 'America/Los_Angeles')
    const now = toZonedTime(new Date(), 'America/Los_Angeles')
    const daysUntil = differenceInDays(eventDate, now)

    if (daysUntil > 7) {
      return {
        day: format(eventDate, 'EEE'),
        date: format(eventDate, 'MMM d'),
      }
    }

    const minutes = eventDate.getMinutes()
    const timeFormat = minutes === 0 ? 'ha' : 'h:mma'
    return {
      day: format(eventDate, 'EEE'),
      date: format(eventDate, timeFormat).toLowerCase(),
    }
  }

  return (
    <div className="space-y-1">
      {upcomingEvents.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
          No upcoming events
        </p>
      ) : (
        upcomingEvents.map((event) => {
          const { day, date } = getDateTimeParts(event.startDate)

          return (
            <Link
              key={event.id}
              href={event.url ?? '/events'}
              className="flex items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-700/80 transition-colors border border-gray-200 dark:border-gray-600 overflow-hidden"
            >
              <div className="flex-shrink-0 w-14 h-full text-center py-1 bg-gray-600 dark:bg-gray-600 font-sans flex flex-col items-center justify-center gap-0">
                <div className="text-sm font-bold text-white uppercase leading-none">
                  {day}
                </div>
                <div className="text-xs font-semibold text-white leading-none">
                  {date}
                </div>
              </div>
              <h3 className="text-sm text-gray-900 dark:text-gray-100 leading-tight flex-1 px-2 py-1.5 truncate">
                {event.name}
              </h3>
              <div className="flex-shrink-0 pr-3 text-amber-900 dark:text-amber-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
