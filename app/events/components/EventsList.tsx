'use client'
import { Event, formatEventTime } from '../../lib/events'

export default function EventsList({ events }: { events: Event[] }) {
  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white p-6 rounded-lg shadow-sm border border-amber-100"
        >
          <h3 className="text-xl font-semibold text-amber-900 mb-2">
            {event.fields.Name}
          </h3>
          <p className="text-amber-800 mb-2">{formatEventTime(event)}</p>
          {event.fields.Location && (
            <p className="text-gray-600 text-sm mb-2">
              📍 {event.fields.Location}
            </p>
          )}
          {event.fields.Notes && (
            <p className="text-gray-700 mt-2">{event.fields.Notes}</p>
          )}
          {event.fields.Type && (
            <span className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm mt-3">
              {event.fields.Type}
            </span>
          )}
          {event.fields.URL && (
            <div className="mt-4">
              <a
                href={event.fields.URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:text-amber-900 underline"
              >
                Event details →
              </a>
            </div>
          )}
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-gray-500 text-center py-8">No upcoming events</p>
      )}
    </div>
  )
}