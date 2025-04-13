'use client'
import { Event, filterEventsByDay } from '../../lib/events'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  parseISO,
} from 'date-fns'

export default function MonthlyView({ events }: { events: Event[] }) {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const emptyCells = Array(monthStart.getDay()).fill(null)
  const allCells = [...emptyCells, ...days]

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
        
        {allCells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="bg-white p-2 h-32" />
          }

          const dayEvents = filterEventsByDay(events, day)

          return (
            <div
              key={day.toISOString()}
              className={`bg-white p-2 h-32 overflow-y-auto ${
                isToday(day) ? 'bg-amber-50' : ''
              }`}
            >
              <div className="font-medium text-gray-700 mb-1">
                {format(day, 'd')}
              </div>
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="text-xs p-1 mb-1 bg-amber-100 rounded"
                  title={event.fields.Notes || event.fields.Description}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-amber-800">
                      {format(parseISO(event.fields['Start Date']), 'h:mm a')}
                    </span>
                    {event.fields.Type && (
                      <span className="text-xs text-amber-600">
                        · {event.fields.Type}
                      </span>
                    )}
                  </div>
                  <span className="text-amber-900">{event.fields.Name}</span>
                  {event.fields.URL && (
                    <a
                      href={event.fields.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-700 hover:text-amber-900 underline mt-1 block"
                    >
                      Details →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}