'use client'
import { Event, filterEventsByDay, getEventColors } from '../../lib/events'
import { startOfWeek, addDays, format, isToday } from 'date-fns'
import { useGridSnappedWidth } from '../hooks/useGridSnappedWidth'

const NUM_WEEKS = 4
const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function EventCard({ event, gridSize }: { event: Event; gridSize: number }) {
  const colors = getEventColors(event.type)

  const content = (
    <div
      className="px-1 text-xs min-[816px]:text-sm overflow-hidden"
      style={{ lineHeight: `${gridSize}px` }}
    >
      <span className={`font-medium ${colors.text} font-sans`}>
        {event.name}
      </span>
    </div>
  )

  const cardClass = `block ${colors.bg} border-l min-[816px]:border-l-2 ${colors.border} shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)] dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.15)] ${colors.hover} transition-colors overflow-hidden`
  const style = { minHeight: `${gridSize}px`, width: `calc(100% - 4px)` }

  if (event.url) {
    return (
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
        style={style}
      >
        {content}
      </a>
    )
  }

  return <div className={cardClass} style={style}>{content}</div>
}

function DayCell({
  day,
  events,
  isDayToday,
  isSunday,
  isFirstDay,
  gridSize,
  gridHeight,
}: {
  day: Date
  events: Event[]
  isDayToday: boolean
  isSunday: boolean
  isFirstDay: boolean
  gridSize: number
  gridHeight: number
}) {
  const dayEvents = filterEventsByDay(events, day)

  return (
    <div
      className={`flex flex-col ${!isFirstDay ? 'shadow-[-1.5px_0_0_0_rgb(209,213,219)] dark:shadow-[-1.5px_0_0_0_rgb(75,85,99)]' : ''} ${isDayToday ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
    >
      {/* Date header row */}
      <div className="flex items-center h-5 min-[816px]:h-7 px-1">
        <span
          className={`flex items-center justify-center text-xs min-[816px]:text-base font-light tabular-nums ${
            isDayToday
              ? 'text-white font-medium bg-red-600 rounded-full w-5 h-5 min-[816px]:w-7 min-[816px]:h-7'
              : isSunday
                ? 'text-red-600 dark:text-red-500'
                : 'text-gray-800 dark:text-gray-200'
          }`}
        >
          {format(day, 'd')}
        </span>
      </div>

      {/* Grid area with events */}
      <div
        style={{
          height: gridHeight,
          backgroundImage: `
            linear-gradient(to right, rgb(209 213 219 / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(209 213 219 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: '-0.5px 0',
        }}
      >
        <div className="flex flex-col overflow-y-auto h-full">
          {dayEvents.map((event) => (
            <EventCard key={event.id} event={event} gridSize={gridSize} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WeekdayHeader({ day, index }: { day: string; index: number }) {
  const textColor =
    index === 6
      ? 'text-red-600 dark:text-red-500'
      : index === 5
        ? 'text-gray-500 dark:text-gray-400'
        : 'text-gray-700 dark:text-gray-300'

  return (
    <div
      className={`py-1 min-[816px]:py-2 px-1 text-center first:shadow-none shadow-[-1.5px_0_0_0_rgb(209,213,219)] dark:shadow-[-1.5px_0_0_0_rgb(75,85,99)] ${textColor}`}
    >
      <span className="font-medium text-[10px] min-[816px]:text-xs tracking-wider">{day}</span>
    </div>
  )
}

function CalendarWeek({
  week,
  weekIndex,
  events,
  gridSize,
  gridHeight,
}: {
  week: Date[]
  weekIndex: number
  events: Event[]
  gridSize: number
  gridHeight: number
}) {
  return (
    <div className="grid grid-cols-7 border-b border-gray-300 dark:border-gray-600 last:border-b-0">
      {week.map((day, dayIndex) => (
        <div
          key={`${weekIndex}-${dayIndex}`}
          className="first:border-l-0"
        >
          <DayCell
            day={day}
            events={events}
            isDayToday={isToday(day)}
            isSunday={dayIndex === 6}
            isFirstDay={dayIndex === 0}
            gridSize={gridSize}
            gridHeight={gridHeight}
          />
        </div>
      ))}
    </div>
  )
}

export default function MonthlyView({ events }: { events: Event[] }) {
  const today = new Date()
  const { containerRef, snappedWidth, gridSize, gridHeight } = useGridSnappedWidth()

  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weeks: Date[][] = []
  for (let week = 0; week < NUM_WEEKS; week++) {
    const weekDays: Date[] = []
    for (let day = 0; day < 7; day++) {
      weekDays.push(addDays(weekStart, week * 7 + day))
    }
    weeks.push(weekDays)
  }

  return (
    <div ref={containerRef}>
      {/* Month header - centered relative to viewport, outside scroll container */}
      <div className="px-3 py-3 text-center">
        <span className="text-lg min-[816px]:text-xl text-gray-600 dark:text-gray-300 uppercase tracking-wider font-light">
          {format(today, 'MMMM yyyy')}
        </span>
      </div>

      {/* Scrollable calendar grid */}
      <div className="overflow-x-auto">
        <div
          className="border-gray-300 dark:border-gray-600 mx-auto"
          style={{
            borderWidth: '1.5px',
            borderStyle: 'solid',
            ...(snappedWidth ? { width: snappedWidth } : {})
          }}
        >
          <div className="grid grid-cols-7 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
            {WEEKDAYS.map((day, index) => (
              <WeekdayHeader key={day} day={day} index={index} />
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <CalendarWeek
              key={weekIndex}
              week={week}
              weekIndex={weekIndex}
              events={events}
              gridSize={gridSize}
              gridHeight={gridHeight}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
