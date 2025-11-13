'use client'
import { Event, filterEventsByDay } from '../../lib/events'
import {
  startOfWeek,
  addDays,
  format,
  differenceInMinutes,
  isSameDay,
} from 'date-fns'

const START_HOUR = 8 // 8am
const END_HOUR = 23 // 11pm
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
)
const HOUR_HEIGHT = 40 // pixels per hour

function EventBlock({ event, index }: { event: Event; index: number }) {
  const start = event.startDate
  const end = event.endDate || addDays(start, 0)

  // Calculate position and height
  const startHour = start.getHours() + start.getMinutes() / 60
  const durationMinutes = differenceInMinutes(end, start)
  const height = (durationMinutes / 60) * HOUR_HEIGHT
  const top = Math.max(0, (startHour - START_HOUR) * HOUR_HEIGHT) // Clamp to top of view

  // Clamp height to stay within view
  const maxHeight = (END_HOUR + 1 - START_HOUR) * HOUR_HEIGHT
  const clampedHeight = Math.min(height, maxHeight - top)

  return (
    <div
      className="absolute left-1 right-1 bg-gray-50 border border-gray-200 overflow-hidden rounded-lg"
      style={{
        top: `${top}px`,
        height: `${clampedHeight}px`,
        zIndex: index, // Later events (higher indices) will be on top
      }}
    >
      <div className="p-2 text-xs">
        <div className="font-medium text-amber-900 line-clamp-3">
          {event.name}
        </div>
        <div className="text-amber-800 mt-0.5">
          {format(start, 'h:mm a').replace(':00', '')}
          {event.endDate &&
            ` - ${format(end, 'h:mm a').replace(':00', '')}`}
        </div>
        {event.location && clampedHeight > 60 && (
          <div className="text-gray-600 truncate mt-0.5">
            📍 {event.location}
          </div>
        )}
      </div>
    </div>
  )
}

export default function WeeklyView({ events }: { events: Event[] }) {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }) // Start from Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Calculate current time position
  const currentHour = today.getHours() + today.getMinutes() / 60
  const timeLinePosition = Math.max(0, (currentHour - START_HOUR) * HOUR_HEIGHT)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header row with days */}
      <div
        className="grid"
        style={{ gridTemplateColumns: '4rem repeat(7, 1fr)' }}
      >
        <div className="p-2" /> {/* Empty corner cell */}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-4 text-center border-l border-gray-200 ${
              isSameDay(day, today) ? 'bg-red-50' : ''
            }`}
          >
            <div className="font-medium text-amber-900">
              {format(day, 'EEE')}
            </div>
            <div className="text-sm text-amber-800">{format(day, 'MMM d')}</div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div
        className="grid"
        style={{ gridTemplateColumns: '4rem repeat(7, 1fr)' }}
      >
        {/* Time labels */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full text-right pr-2 text-sm text-gray-500"
              style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
            >
              {format(new Date().setHours(hour, 0), 'h a')}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayEvents = filterEventsByDay(events, day).sort((a, b) => {
            return a.startDate.getTime() - b.startDate.getTime()
          })

          const isToday = isSameDay(day, today)

          return (
            <div
              key={day.toISOString()}
              className="relative border-l border-gray-200"
              style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
            >
              {/* Hour lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full border-t border-gray-200/50"
                  style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                />
              ))}

              {/* Current time indicator */}
              {isToday &&
                currentHour >= START_HOUR &&
                currentHour <= END_HOUR && (
                  <div
                    className="absolute w-full border-t-2 border-red-600 z-10"
                    style={{ top: `${timeLinePosition}px` }}
                  >
                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-600" />
                  </div>
                )}

              {/* Events */}
              {dayEvents.map((event, index) => (
                <EventBlock key={event.id} event={event} index={index} />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
