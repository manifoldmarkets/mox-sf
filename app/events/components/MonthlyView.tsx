'use client'
import { Event, filterEventsByDay } from '../../lib/events'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
} from 'date-fns'

function DayCard({
  day,
  events,
  isToday: isDayToday,
}: {
  day: Date | null
  events: Event[]
  isToday: boolean
}) {
  if (!day) {
    return <div className="bg-white p-2 h-32" />
  }

  const dayEvents = filterEventsByDay(events, day)

  return (
    <div
      className={`bg-white p-1 h-32 overflow-y-auto ${
        isDayToday ? 'bg-red-50' : ''
      }`}
    >
      <div className={`font-medium text-gray-700 mb-1 flex justify-center`}>
        <span
          className={`${
            isDayToday
              ? 'bg-red-800 text-white w-7 h-7 rounded-full flex items-center justify-center'
              : ''
          }`}
        >
          {format(day, 'd')}
        </span>
      </div>
      {dayEvents.map((event) => (
        <div
          key={event.id}
          className="text-xs p-1 mb-1 bg-gray-50 border border-gray-200 rounded-md"
          title={event.notes || event.description}
        >
          <span className="text-amber-900 font-medium block">
            <span className="text-amber-600 font-light">
              {format(event.startDate, 'h:mm a').replace(':00', '')}
            </span>{' '}
            {event.name}
          </span>
          {event.location && (
            <div className="text-gray-600 truncate mt-0.5">
              📍 {event.location}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function MonthlyView({ events }: { events: Event[] }) {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const emptyCells = Array(monthStart.getDay()).fill(null)
  const allCells = [...emptyCells, ...days]
  // Add cells until multiple of 7
  while (allCells.length % 7 !== 0) {
    allCells.push(null)
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-2xl overflow-hidden">
      <h3 className="text-xl font-semibold text-amber-900 mb-4 text-center">
        {format(today, 'MMMM yyyy')}
      </h3>

      <div className="grid grid-cols-7 bg-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-gray-700 font-medium bg-white"
          >
            {day}
          </div>
        ))}

        {allCells.map((day, index) => (
          <DayCard
            key={day ? day.toISOString() : `empty-${index}`}
            day={day}
            events={events}
            isToday={day ? isToday(day) : false}
          />
        ))}
      </div>
    </div>
  )
}
