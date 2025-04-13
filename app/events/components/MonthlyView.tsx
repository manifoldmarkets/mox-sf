'use client'
import { Event, filterEventsByDay } from '../../lib/events'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  parseISO,
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
      className={`bg-white p-2 h-32 overflow-y-auto ${
        isDayToday ? 'bg-amber-50' : ''
      }`}
    >
      <div className="font-medium text-gray-700 mb-1">{format(day, 'd')}</div>
      {dayEvents.map((event) => (
        <div
          key={event.id}
          className="text-xs p-1 mb-1 bg-amber-100 rounded"
          title={event.fields.Notes || event.fields.Description}
        >
          <span className="text-amber-900 font-medium block">
            <span className="text-amber-600">
              {format(parseISO(event.fields['Start Date']), 'h:mm a').replace(
                ':00',
                ''
              )}
            </span>{' '}
            {event.fields.Name}
          </span>
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
    <div className="bg-white rounded-lg border border-amber-100 p-4">
      <h3 className="text-xl font-semibold text-amber-900 mb-4 text-center">
        {format(today, 'MMMM yyyy')}
      </h3>

      <div className="grid grid-cols-7 gap-px bg-amber-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-amber-900 font-medium bg-amber-50"
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
