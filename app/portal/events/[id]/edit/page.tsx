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
  recurringSeries?: string
}

type RepeatFrequency = 'weekly' | 'biweekly' | 'monthly'
type EndConditionType = 'count' | 'until'

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

  // Duplicate event state
  const [showDuplicateSection, setShowDuplicateSection] = useState(false)
  const [duplicateFrequency, setDuplicateFrequency] = useState<RepeatFrequency>('weekly')
  const [endConditionType, setEndConditionType] = useState<EndConditionType>('count')
  const [repeatCount, setRepeatCount] = useState(4)
  const [untilDate, setUntilDate] = useState('')
  const [duplicating, setDuplicating] = useState(false)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  const [duplicateSuccess, setDuplicateSuccess] = useState<string | null>(null)

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

  const handleDuplicateEvent = async () => {
    if (!event) return

    setDuplicating(true)
    setDuplicateError(null)
    setDuplicateSuccess(null)

    try {
      const requestBody: {
        eventId: string
        frequency: RepeatFrequency
        count?: number
        untilDate?: string
      } = {
        eventId: event.id,
        frequency: duplicateFrequency,
      }

      if (endConditionType === 'count') {
        requestBody.count = repeatCount
      } else {
        requestBody.untilDate = untilDate
      }

      const response = await fetch('/portal/api/duplicate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        setDuplicateSuccess(`Created ${data.createdEvents.length} recurring event(s)`)
        // Update the local event state to reflect the recurring status
        setEvent({ ...event, status: 'Recurring' })
        setShowDuplicateSection(false)
      } else {
        setDuplicateError(data.message || 'Failed to create recurring events')
      }
    } catch (err) {
      setDuplicateError('Failed to create recurring events. Please try again.')
    } finally {
      setDuplicating(false)
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

      {/* Duplicate Event Section */}
      {event.status !== 'Cancelled' && (
        <>
          <hr style={{ margin: '20px 0' }} />

          {duplicateError && <p className="error">{duplicateError}</p>}
          {duplicateSuccess && <p className="success">{duplicateSuccess}</p>}

          {!showDuplicateSection ? (
            <button
              onClick={() => setShowDuplicateSection(true)}
              style={{ marginTop: '10px' }}
            >
              create recurring series
            </button>
          ) : (
            <div style={{ marginTop: '10px', padding: '15px', border: '1px solid var(--border-color, #ccc)', borderRadius: '4px' }}>
              <h3 style={{ marginTop: 0 }}>create recurring series</h3>

              <div className="form-group">
                <label htmlFor="frequency">repeat:</label>
                <select
                  id="frequency"
                  value={duplicateFrequency}
                  onChange={(e) => setDuplicateFrequency(e.target.value as RepeatFrequency)}
                >
                  <option value="weekly">weekly (same day of week)</option>
                  <option value="biweekly">bi-weekly (every 2 weeks)</option>
                  <option value="monthly">monthly (same weekday, e.g. 2nd Tuesday)</option>
                </select>
              </div>

              <div className="form-group">
                <label>end condition:</label>
                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="endCondition"
                      checked={endConditionType === 'count'}
                      onChange={() => setEndConditionType('count')}
                    />
                    repeat X times
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="endCondition"
                      checked={endConditionType === 'until'}
                      onChange={() => setEndConditionType('until')}
                    />
                    repeat until date
                  </label>
                </div>
              </div>

              {endConditionType === 'count' ? (
                <div className="form-group">
                  <label htmlFor="repeatCount">number of occurrences:</label>
                  <input
                    type="number"
                    id="repeatCount"
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(Math.max(1, Math.min(52, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="52"
                    style={{ width: '100px' }}
                  />
                  <p className="muted" style={{ marginTop: '5px' }}>
                    creates {repeatCount} additional event{repeatCount !== 1 ? 's' : ''} after this one
                  </p>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="untilDate">repeat until:</label>
                  <input
                    type="date"
                    id="untilDate"
                    value={untilDate}
                    onChange={(e) => setUntilDate(e.target.value)}
                    min={event.startDate?.split('T')[0]}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={handleDuplicateEvent}
                  disabled={duplicating || (endConditionType === 'until' && !untilDate)}
                  className="primary"
                >
                  {duplicating ? 'creating...' : 'create recurring events'}
                </button>
                <button onClick={() => setShowDuplicateSection(false)}>
                  cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
