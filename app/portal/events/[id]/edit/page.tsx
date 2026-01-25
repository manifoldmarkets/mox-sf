'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

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

const TYPE_OPTIONS = ['Public', 'Members', 'Private']

function formatDateTimeForInput(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function EventEditPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(
          `/portal/api/hosted-events?eventId=${encodeURIComponent(eventId)}`
        )
        const data = await response.json()

        if (response.ok && data.event) {
          setEvent(data.event)
        } else {
          setError(data.message || 'event not found')
        }
      } catch (err) {
        setError('failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleFieldChange = (
    field: keyof EventData,
    value: string | undefined
  ) => {
    if (event) {
      setEvent({ ...event, [field]: value })
    }
  }

  const handleSave = async () => {
    if (!event) return

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      })

      const data = await response.json()

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setSaveError(data.message || 'failed to save changes')
      }
    } catch (err) {
      setSaveError('failed to save changes. please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEvent = async () => {
    if (!event) return

    setCancelling(true)
    setSaveError(null)

    try {
      const cancelledEvent = { ...event, status: 'Cancelled' }
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelledEvent),
      })

      const data = await response.json()

      if (response.ok) {
        setEvent(cancelledEvent)
        setShowCancelConfirm(false)
      } else {
        setSaveError(data.message || 'failed to cancel event')
      }
    } catch (err) {
      setSaveError('failed to cancel event. please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const handleReactivate = async () => {
    if (!event) return

    setSaving(true)
    setSaveError(null)

    try {
      const reactivatedEvent = { ...event, status: 'Confirmed' }
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reactivatedEvent),
      })

      const data = await response.json()

      if (response.ok) {
        setEvent(reactivatedEvent)
      } else {
        setSaveError(data.message || 'failed to reactivate event')
      }
    } catch (err) {
      setSaveError('failed to reactivate event. please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Link href="/portal" className="back-link">
          ← back to portal
        </Link>
        <h1>edit event</h1>
        <p className="loading">loading...</p>
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Link href="/portal" className="back-link">
          ← back to portal
        </Link>
        <h1>edit event</h1>
        <p className="error">{error || 'event not found'}</p>
      </>
    )
  }

  return (
    <>
      <Link href="/portal" className="back-link">
        ← back to portal
      </Link>

      <h1>edit event</h1>

      <p>
        <strong>{event.name}</strong>
        {event.status && (
          <>
            {' '}
            - <span className={`badge ${event.status.toLowerCase()}`}>{event.status}</span>
          </>
        )}
      </p>

      {saveError && <p className="error">{saveError}</p>}
      {saveSuccess && <p className="success">changes saved!</p>}

      <hr />

      <div className="form-group">
        <label htmlFor="name">event name:</label>
        <input
          type="text"
          id="name"
          value={event.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="startDate">start date & time:</label>
        <input
          type="datetime-local"
          id="startDate"
          value={formatDateTimeForInput(event.startDate)}
          onChange={(e) => handleFieldChange('startDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="endDate">end date & time:</label>
        <input
          type="datetime-local"
          id="endDate"
          value={formatDateTimeForInput(event.endDate)}
          onChange={(e) =>
            handleFieldChange('endDate', e.target.value || undefined)
          }
        />
      </div>

      {event.assignedRooms && (
        <div className="form-group">
          <label>assigned rooms:</label>
          <input type="text" value={event.assignedRooms} disabled />
          <p className="muted" style={{ marginTop: '5px' }}>
            room assignment is managed by staff
          </p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="type">type:</label>
        <select
          id="type"
          value={event.type || ''}
          onChange={(e) => handleFieldChange('type', e.target.value)}
        >
          <option value="">select type...</option>
          {TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">event description:</label>
        <textarea
          id="description"
          value={event.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          rows={4}
          placeholder="describe your event..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">internal notes:</label>
        <textarea
          id="notes"
          value={event.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          rows={2}
          placeholder="internal notes (optional)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="url">event URL:</label>
        <input
          type="url"
          id="url"
          value={event.url || ''}
          onChange={(e) => handleFieldChange('url', e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {event.status !== 'Cancelled' && (
          <button onClick={handleSave} disabled={saving} className="primary">
            {saving ? 'saving...' : 'save changes'}
          </button>
        )}

        {event.status === 'Cancelled' ? (
          <button onClick={handleReactivate} disabled={saving}>
            {saving ? 'reactivating...' : 'reactivate event'}
          </button>
        ) : showCancelConfirm ? (
          <>
            <button
              onClick={handleCancelEvent}
              disabled={cancelling}
              className="danger"
            >
              {cancelling ? 'cancelling...' : 'yes, cancel event'}
            </button>
            <button onClick={() => setShowCancelConfirm(false)}>
              no, keep event
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowCancelConfirm(true)}
            disabled={saving || cancelling}
            className="danger"
          >
            cancel event
          </button>
        )}
      </div>
    </>
  )
}
