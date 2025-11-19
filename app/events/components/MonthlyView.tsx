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
    return <div className="bg-white dark:bg-gray-800 p-2 h-32" />
  }

  const dayEvents = filterEventsByDay(events, day)

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-1 h-32 overflow-y-auto ${
        isDayToday ? 'bg-red-50 dark:bg-red-900/30' : ''
      }`}
    >
      <div className={`font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-center`}>
        <span
          className={`${
            isDayToday
              ? 'bg-red-800 dark:bg-red-700 text-white w-7 h-7 flex items-center justify-center'
              : ''
          }`}
        >
          {format(day, 'd')}
        </span>
      </div>
      {dayEvents.map((event) => (
        <div
          key={event.id}
          className="text-xs p-1 mb-1 bg-beige-50 dark:bg-gray-700 border border-amber-900 dark:border-amber-800"
          title={event.description || event.name}
        >
          <span className="text-gray-900 dark:text-gray-200 font-medium block">
            <span className="text-gray-700 dark:text-gray-400 font-light">
              {format(event.startDate, 'h:mm a').replace(':00', '')}
            </span>{' '}
            {event.name}
          </span>
          {event.location && (
            <div className="text-gray-600 dark:text-gray-400 truncate mt-0.5">
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 overflow-hidden">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-4 text-center">
        {format(today, 'MMMM yyyy')}
      </h3>

      <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-gray-700 dark:text-gray-300 font-medium bg-white dark:bg-gray-800"
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
