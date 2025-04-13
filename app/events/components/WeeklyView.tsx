'use client'
import { Event, formatEventTime } from '../../lib/events'
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns'

export default function WeeklyView({ events }: { events: Event[] }) {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Start from Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[800px] gap-4">
        {days.map((day) => {
          const dayEvents = events.filter((event) => {
            try {
              if (!event.fields?.['Start Date']) return false
              const eventDate = parseISO(event.fields['Start Date'])
              if (!eventDate || isNaN(eventDate.getTime())) return false
              return isSameDay(eventDate, day)
            } catch (error) {
              console.error('Error parsing date:', error)
              return false
            }
          })

          return (
            <div
              key={day.toISOString()}
              className="flex-1 min-w-[200px] bg-white rounded-lg p-4 border border-amber-100"
            >
              <h3 className="font-semibold text-amber-900 mb-4">
                {format(day, 'EEEE, MMM d')}
              </h3>
              <div className="space-y-4">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-amber-50 rounded-md"
                  >
                    <p className="font-medium text-amber-900">
                      {event.fields.Name}
                    </p>
                    <p className="text-sm text-amber-800">
                      {format(parseISO(event.fields['Start Date']), 'h:mm a')}
                      {event.fields['End Date'] && ` - ${format(parseISO(event.fields['End Date']), 'h:mm a')}`}
                    </p>
                    {event.fields.URL && (
                      <a
                        href={event.fields.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-700 hover:text-amber-900 underline mt-1 block"
                      >
                        Event details →
                      </a>
                    )}
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <p className="text-gray-400 text-sm">No events</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}