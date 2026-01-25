'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

interface HostedEventsProps {
  userName: string
}

interface EventData {
  id: string
  name: string
  startDate: string
  endDate?: string
  description?: string
  assignedRooms?: string
  notes?: string
  type?: string
  status?: string
  url?: string
  host?: string
}

export default function HostedEvents({ userName }: HostedEventsProps) {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHostedEvents() {
      if (!userName) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/portal/api/hosted-events?userName=${encodeURIComponent(userName)}`
        )
        const data = await response.json()

        if (response.ok && data.events) {
          setEvents(data.events)
        } else {
          setError(data.message || 'failed to load events')
        }
      } catch (err) {
        setError('failed to load hosted events')
      } finally {
        setLoading(false)
      }
    }

    fetchHostedEvents()
  }, [userName])

  if (loading) {
    return (
      <>
        <h2>events you manage</h2>
        <p className="loading">loading events...</p>
      </>
    )
  }

  if (error) {
    return (
      <>
        <h2>events you manage</h2>
        <p className="error">{error}</p>
      </>
    )
  }

  return (
    <>
      <h2>events you manage</h2>

      {events.length === 0 ? (
        <p>you don't have any upcoming events.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>event</th>
              <th>date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const startDate = new Date(event.startDate)
              const formattedDate = format(startDate, 'MMM d')
              const formattedTime = format(startDate, 'h:mm a')

              return (
                <tr key={event.id}>
                  <td>
                    {event.name}
                    {event.assignedRooms && (
                      <span className="muted">
                        {' '}
                        ({event.assignedRooms})
                      </span>
                    )}
                    {event.status && event.status !== 'Confirmed' && (
                      <span className="muted"> · {event.status.toLowerCase()}</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formattedDate}, {formattedTime}
                  </td>
                  <td>
                    <Link
                      href={`/portal/events/${event.id}/edit`}
                      className="btn small"
                    >
                      edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: '15px' }}>
        <a
          href="https://airtable.com/appkHZ2UvU6SouT5y/pagHlAqA2JFG7nNP2/form"
          target="_blank"
          rel="noopener noreferrer"
        >
          submit a new event
        </a>
      </p>
    </>
  )
}
