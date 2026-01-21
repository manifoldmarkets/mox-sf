'use client'
import { Event, filterEventsByDay } from '../../lib/events'
import {
  addDays,
  format,
  differenceInMinutes,
  isSameDay,
} from 'date-fns'

const START_HOUR = 8 // 8am
const END_HOUR = 23 // 11pm (grid ends at 11pm)
// Hours array for drawing hour lines (8am through 9pm, not including 10pm line at bottom)
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
)
const HOUR_HEIGHT = 32 // pixels per hour
// Total grid height spans from 8am to 10pm = 14 hours
const GRID_HOURS = END_HOUR - START_HOUR

// Key hours to show on sidebar: 9am, 12pm, 3pm, 6pm, 9pm
const TIME_MARKERS = [9, 12, 15, 18, 21]

function formatHour(hour: number): string {
  if (hour === 12) return '12'
  if (hour > 12) return String(hour - 12)
  return String(hour)
}

// Color schemes by event type
function getEventColors(type?: string): {
  bg: string
  border: string
  text: string
  hover: string
} {
  const eventType = type?.toLowerCase()
  switch (eventType) {
    case 'public':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-600',
        text: 'text-emerald-900',
        hover: 'hover:bg-emerald-100',
      }
    case 'members':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-600',
        text: 'text-blue-900',
        hover: 'hover:bg-blue-100',
      }
    case 'private':
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-600',
        text: 'text-rose-900',
        hover: 'hover:bg-rose-100',
      }
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-500',
        text: 'text-gray-900',
        hover: 'hover:bg-gray-100',
      }
  }
}

function EventBlock({ event, index }: { event: Event; index: number }) {
  const start = event.startDate
  const end = event.endDate || addDays(start, 0)

  // Calculate position and height
  const startHour = start.getHours() + start.getMinutes() / 60
  const durationMinutes = differenceInMinutes(end, start)
  const height = (durationMinutes / 60) * HOUR_HEIGHT
  const top = Math.max(0, (startHour - START_HOUR) * HOUR_HEIGHT)

  // Clamp height to stay within view
  const maxHeight = GRID_HOURS * HOUR_HEIGHT
  const clampedHeight = Math.min(height, maxHeight - top)

  const colors = getEventColors(event.type)

  const content = (
    <div className="p-1 text-[9px]">
      <div
        className={`font-medium ${colors.text} line-clamp-3 leading-tight uppercase tracking-wide font-sans`}
      >
        {event.name}
      </div>
      {clampedHeight > 40 && (
        <div className={`${colors.text} opacity-70 mt-0.5 text-[8px] normal-case`}>
          {format(start, 'h:mma').replace(':00', '').toLowerCase()}
        </div>
      )}
    </div>
  )

  const blockClass = `absolute left-0 right-0 ${colors.bg} border-l-3 ${colors.border} overflow-hidden ${colors.hover} transition-colors`

  if (event.url) {
    return (
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className={blockClass}
        style={{
          top: `${top}px`,
          height: `${clampedHeight}px`,
          zIndex: index,
        }}
      >
        {content}
      </a>
    )
  }

  return (
    <div
      className={blockClass}
      style={{
        top: `${top}px`,
        height: `${clampedHeight}px`,
        zIndex: index,
      }}
    >
      {content}
    </div>
  )
}

export default function WeeklyView({ events }: { events: Event[] }) {
  const today = new Date()
  // Start from today, show 5 days on mobile, 7 on desktop
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  // Calculate current time position
  const currentHour = today.getHours() + today.getMinutes() / 60
  const timeLinePosition = Math.max(0, (currentHour - START_HOUR) * HOUR_HEIGHT)

  const gridHeight = GRID_HOURS * HOUR_HEIGHT

  // TODO: Move away from amber as a theme color
  return (
    <div className="-mx-4 md:mx-0 md:rounded-lg md:border md:border-gray-300 overflow-hidden">
      {/* Header row with days */}
      <div className="grid grid-cols-[16px_1fr_16px] md:grid-cols-[20px_1fr_20px]">
        <div /> {/* Left spacer */}
        <div className="grid grid-cols-5 md:grid-cols-7 border-b border-gray-300">
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              className={`py-2 px-1 text-center border-l border-gray-300 first:border-l-0 ${
                index >= 5 ? 'hidden md:block' : ''
              } ${
                isSameDay(day, today) ? 'bg-slate-200' : ''
              }`}
            >
              <div className="font-medium text-gray-900 text-sm">
                {format(day, 'EEE')}
              </div>
              <div className="text-xs text-gray-600">
                {format(day, 'MMM d')}
              </div>
            </div>
          ))}
        </div>
        <div /> {/* Right spacer */}
      </div>

      {/* Time grid with sidebars */}
      <div className="grid grid-cols-[16px_1fr_16px] md:grid-cols-[20px_1fr_20px]">
        {/* Left time markers */}
        <div className="relative" style={{ height: `${gridHeight}px` }}>
          {TIME_MARKERS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full text-[9px] text-gray-500 text-center leading-none"
              style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT - 4}px` }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="grid grid-cols-5 md:grid-cols-7">
          {days.map((day, dayIndex) => {
            const dayEvents = filterEventsByDay(events, day).sort((a, b) => {
              return a.startDate.getTime() - b.startDate.getTime()
            })

            const isToday = isSameDay(day, today)

            return (
              <div
                key={day.toISOString()}
                className={`relative border-l border-gray-300 first:border-l-0 ${
                  dayIndex >= 5 ? 'hidden md:block' : ''
                } ${isToday ? 'bg-slate-100' : ''}`}
                style={{ height: `${gridHeight}px` }}
              >
                {/* Hour lines */}
                {HOURS.map((hour) => {
                  const isMarkerHour = TIME_MARKERS.includes(hour)
                  return (
                    <div key={hour}>
                      <div
                        className={`absolute w-full ${isMarkerHour ? 'border-t-[1.5px] border-gray-300' : 'border-t-[1.5px] border-gray-200'}`}
                        style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                      />
                      <div
                        className="absolute w-full h-px border-dashed-spaced"
                        style={{
                          top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
                        }}
                      />
                    </div>
                  )
                })}

                {/* Current time indicator */}
                {isToday &&
                  currentHour >= START_HOUR &&
                  currentHour <= END_HOUR && (
                    <div
                      className="absolute w-full border-t-2 border-red-500 z-10"
                      style={{ top: `${timeLinePosition}px` }}
                    >
                      <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
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

        {/* Right time markers */}
        <div className="relative" style={{ height: `${gridHeight}px` }}>
          {TIME_MARKERS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full text-[9px] text-gray-500 text-center leading-none"
              style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT - 4}px` }}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
