'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

interface DirectoryMember {
  id: string
  name: string
}

interface SubmitEventClientProps {
  userId: string
  userName: string
}

interface ScrapedData {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  imageUrl?: string
  url?: string
  hostNames?: string[]
  source: string
}

function formatDateTimeForInput(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const TYPE_OPTIONS = ['Public', 'Members', 'Private']
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface RecurrenceInstance {
  date: string // datetime-local format
  url: string
}

export default function SubmitEventClient({ userId, userName }: SubmitEventClientProps) {
  // URL fetch state
  const [eventUrl, setEventUrl] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Form visibility
  const [showForm, setShowForm] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('Idea')
  const [notes, setNotes] = useState('')

  // Recurrence state
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [recurrenceDays, setRecurrenceDays] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [recurrenceEndType, setRecurrenceEndType] = useState<'for' | 'until'>('for')
  const [recurrenceCount, setRecurrenceCount] = useState(4)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [manualInstances, setManualInstances] = useState<RecurrenceInstance[] | null>(null)

  // Co-hosts state
  const [coHosts, setCoHosts] = useState<DirectoryMember[]>([])
  const [allMembers, setAllMembers] = useState<DirectoryMember[]>([])
  const [coHostSearch, setCoHostSearch] = useState('')
  const [showCoHostDropdown, setShowCoHostDropdown] = useState(false)
  const coHostRef = useRef<HTMLDivElement>(null)

  // Load members list once
  useEffect(() => {
    fetch('/portal/api/directory-members')
      .then((r) => r.json())
      .then((data) => {
        if (data.members) setAllMembers(data.members)
      })
      .catch(() => {})
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (coHostRef.current && !coHostRef.current.contains(e.target as Node)) {
        setShowCoHostDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredMembers = allMembers.filter(
    (m) =>
      m.id !== userId &&
      !coHosts.some((c) => c.id === m.id) &&
      m.name.toLowerCase().includes(coHostSearch.toLowerCase())
  )

  // Auto-select day of week from startDate when switching to Recurring
  useEffect(() => {
    if (!startDate || status !== 'Recurring') return
    const d = new Date(startDate)
    if (isNaN(d.getTime())) return
    const ourIndex = (d.getDay() + 6) % 7 // Convert Sun=0 to Mon=0 index
    setRecurrenceDays((prev) => {
      if (prev.some(Boolean)) return prev
      const next = [...prev]
      next[ourIndex] = true
      return next
    })
  }, [startDate, status])

  // Generate recurrence dates for preview
  const recurrenceDates = useMemo(() => {
    if (status !== 'Recurring' || !startDate) return []
    const start = new Date(startDate)
    if (isNaN(start.getTime())) return []

    const dates: Date[] = []

    if (recurrenceFrequency === 'monthly') {
      const limit = recurrenceEndType === 'for' ? recurrenceCount : 52
      const endLimit =
        recurrenceEndType === 'until' && recurrenceEndDate
          ? new Date(recurrenceEndDate + 'T23:59:59')
          : null

      for (let i = 0; i < limit; i++) {
        const d = new Date(start)
        d.setMonth(d.getMonth() + i)
        if (endLimit && d > endLimit) break
        dates.push(d)
      }
    } else {
      const interval = recurrenceFrequency === 'biweekly' ? 2 : 1
      const selectedDays = recurrenceDays.reduce<number[]>((acc, selected, i) => {
        if (selected) acc.push(i)
        return acc
      }, [])
      if (selectedDays.length === 0) return []

      const limit = recurrenceEndType === 'for' ? recurrenceCount : 52
      const endLimit =
        recurrenceEndType === 'until' && recurrenceEndDate
          ? new Date(recurrenceEndDate + 'T23:59:59')
          : null

      // Find Monday of the week containing startDate
      const ourDayIndex = (start.getDay() + 6) % 7
      const monday = new Date(start)
      monday.setDate(monday.getDate() - ourDayIndex)
      monday.setHours(0, 0, 0, 0)

      for (let week = 0; week < limit; week++) {
        for (const dayIdx of selectedDays) {
          const d = new Date(monday)
          d.setDate(d.getDate() + week * 7 * interval + dayIdx)
          d.setHours(start.getHours(), start.getMinutes(), 0, 0)
          if (d < start) continue
          if (endLimit && d > endLimit) continue
          dates.push(d)
        }
      }
      dates.sort((a, b) => a.getTime() - b.getTime())
    }

    return dates.slice(0, 52)
  }, [
    status,
    startDate,
    recurrenceFrequency,
    recurrenceDays,
    recurrenceEndType,
    recurrenceCount,
    recurrenceEndDate,
  ])

  // Sync generated dates into editable instances when recurrence config changes
  useEffect(() => {
    setManualInstances(null)
  }, [recurrenceFrequency, recurrenceDays, recurrenceEndType, recurrenceCount, recurrenceEndDate, startDate])

  const displayInstances: RecurrenceInstance[] = manualInstances ?? recurrenceDates.map((d) => ({
    date: formatDateTimeForInput(d.toISOString()),
    url: '',
  }))

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitResult, setSubmitResult] = useState<{ status: string; count?: number } | null>(null)

  const handleFetchUrl = async () => {
    if (!eventUrl.trim()) return

    setFetching(true)
    setFetchError(null)

    try {
      const response = await fetch('/portal/api/fetch-event-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: eventUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setFetchError(data.error || 'Failed to fetch event details')
        return
      }

      const scraped: ScrapedData = data.data

      // Populate form fields
      if (scraped.name) setName(scraped.name)
      if (scraped.description) setDescription(scraped.description)
      if (scraped.startDate) {
        setStartDate(formatDateTimeForInput(scraped.startDate))
        if (scraped.endDate) {
          setEndDate(formatDateTimeForInput(scraped.endDate))
        } else {
          // Infer 3 hour duration if no end time provided
          const start = new Date(scraped.startDate)
          const inferred = new Date(start.getTime() + 3 * 60 * 60 * 1000)
          setEndDate(formatDateTimeForInput(inferred.toISOString()))
        }
      }
      if (scraped.imageUrl) setImageUrl(scraped.imageUrl)

      // Match scraped host names to directory members as co-hosts
      if (scraped.hostNames && scraped.hostNames.length > 0 && allMembers.length > 0) {
        const matched = scraped.hostNames
          .map((hostName) => {
            const lower = hostName.toLowerCase()
            return allMembers.find(
              (m) => m.id !== userId && m.name.toLowerCase() === lower
            )
          })
          .filter((m): m is DirectoryMember => m !== undefined)
        if (matched.length > 0) {
          setCoHosts(matched)
        }
      }

      setShowForm(true)
    } catch {
      setFetchError('Failed to fetch event details. Please try again.')
    } finally {
      setFetching(false)
    }
  }

  const handleFillManually = () => {
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      const body: Record<string, unknown> = {
        name,
        startDate: new Date(startDate).toISOString(),
        type,
        status,
        url: eventUrl.trim() || undefined,
        imageUrl: imageUrl || undefined,
        notes: notes || undefined,
      }

      if (endDate) {
        body.endDate = new Date(endDate).toISOString()
      }

      if (description) {
        body.description = description
      }

      if (coHosts.length > 0) {
        body.coHosts = coHosts.map((c) => c.id)
      }

      if (status === 'Recurring' && displayInstances.length > 0) {
        body.recurrenceInstances = displayInstances.map((inst) => ({
          date: new Date(inst.date).toISOString(),
          url: inst.url || undefined,
        }))
      }

      const response = await fetch('/portal/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Failed to submit event')
        return
      }

      setSubmitResult({ status: data.status, count: data.count })
    } catch {
      setSubmitError('Failed to submit event. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Success state
  if (submitResult) {
    return (
      <div className="alert success">
        {submitResult.status === 'Recurring' ? (
          <p>
            {submitResult.count} recurring events created! we&apos;ll review them and
            get back to you shortly.
          </p>
        ) : submitResult.status === 'Confirmed' ? (
          <p>
            event submitted and confirmed! it will appear on the{' '}
            <a href="/events">events calendar</a>.
          </p>
        ) : (
          <p>event submitted! we&apos;ll review it and get back to you shortly.</p>
        )}
        <p style={{ marginTop: '10px' }}>
          <a href="/portal/submit-event">submit another event</a>
          {' · '}
          <a href="/portal">back to portal</a>
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Step 1: URL Input */}
      {!showForm && (
        <section>
          <div className="form-group">
            <label htmlFor="eventUrl">event link:</label>
            <input
              type="url"
              id="eventUrl"
              value={eventUrl}
              onChange={(e) => setEventUrl(e.target.value)}
              placeholder="https://lu.ma/your-event or https://partiful.com/e/..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleFetchUrl()
                }
              }}
            />
          </div>

          {fetchError && <p className="error">{fetchError}</p>}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleFetchUrl}
              disabled={fetching || !eventUrl.trim()}
              className="primary"
            >
              {fetching ? 'fetching...' : 'fetch details'}
            </button>
            <span className="muted">or</span>
            <button onClick={handleFillManually}>fill in manually</button>
          </div>
        </section>
      )}

      {/* Step 2: Event Form */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <p className="muted">
            submitting as <strong>{userName}</strong>
          </p>

          <div className="form-group" ref={coHostRef}>
            <label>co-hosts:</label>
            {coHosts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '5px' }}>
                {coHosts.map((host) => (
                  <span
                    key={host.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9em',
                    }}
                  >
                    {host.name}
                    <button
                      type="button"
                      onClick={() => setCoHosts(coHosts.filter((c) => c.id !== host.id))}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '0 2px',
                        fontSize: '1em',
                        color: 'inherit',
                      }}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={coHostSearch}
              onChange={(e) => {
                setCoHostSearch(e.target.value)
                setShowCoHostDropdown(true)
              }}
              onFocus={() => setShowCoHostDropdown(true)}
              placeholder="search public members..."
            />
            {showCoHostDropdown && coHostSearch && filteredMembers.length > 0 && (
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}
              >
                {filteredMembers.slice(0, 10).map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      setCoHosts([...coHosts, member])
                      setCoHostSearch('')
                      setShowCoHostDropdown(false)
                    }}
                    style={{
                      padding: '5px 10px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--border-color)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none'
                    }}
                  >
                    {member.name}
                  </div>
                ))}
              </div>
            )}
            <p className="muted" style={{ marginTop: '5px' }}>
              optional. mention non-member hosts in notes.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="name">event name: *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">start date & time: *</label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">end date & time: *</label>
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="eventUrlField">event URL:</label>
            <input
              type="url"
              id="eventUrlField"
              value={eventUrl}
              onChange={(e) => setEventUrl(e.target.value)}
              placeholder="https://lu.ma/your-event or https://partiful.com/e/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">event description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="what's this event about? help people decide if they should come! this will appear publicly."
            />
          </div>

          {imageUrl && (
            <div className="form-group">
              <label>event poster preview:</label>
              <img
                src={imageUrl}
                alt="Event poster"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  border: '1px solid var(--border-color)',
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="type">who&apos;s invited? *</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">select...</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="muted" style={{ marginTop: '5px' }}>
              Public = open to public. Members = Mox members only. Private = just you and whoever you invite.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="status">is this an idea or already confirmed? *</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Idea">Idea</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Recurring">Recurring</option>
            </select>
            <p className="muted" style={{ marginTop: '5px' }}>
              if you mark it &apos;Confirmed&apos;, it will automatically show up on the events calendar.
              &apos;Recurring&apos; is for events that repeat regularly (e.g. weekly meetups).
            </p>
          </div>

          {status === 'Recurring' && startDate && (
            <div
              style={{
                padding: '15px',
                border: '1px solid var(--border-color)',
                marginBottom: '15px',
              }}
            >
              <div className="form-group">
                <label>repeats:</label>
                <select
                  value={recurrenceFrequency}
                  onChange={(e) =>
                    setRecurrenceFrequency(e.target.value as 'weekly' | 'biweekly' | 'monthly')
                  }
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every other week</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {recurrenceFrequency !== 'monthly' && (
                <div className="form-group">
                  <label>days of the week:</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {DAY_LABELS.map((label, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const next = [...recurrenceDays]
                          next[i] = !next[i]
                          if (next.some(Boolean)) setRecurrenceDays(next)
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: recurrenceDays[i]
                            ? '2px solid #e44'
                            : '1px solid var(--border-color)',
                          background: recurrenceDays[i] ? '#e44' : 'none',
                          color: recurrenceDays[i] ? '#fff' : 'var(--text-color)',
                          cursor: 'pointer',
                          fontSize: '0.85em',
                          fontWeight: recurrenceDays[i] ? 'bold' : 'normal',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: recurrenceDates.length > 0 ? '15px' : 0 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setRecurrenceEndType('until')}
                      style={{
                        padding: '4px 12px',
                        border: 'none',
                        background:
                          recurrenceEndType === 'until' ? 'var(--text-color)' : 'none',
                        color:
                          recurrenceEndType === 'until' ? 'var(--bg-color)' : 'var(--text-color)',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                      }}
                    >
                      until
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurrenceEndType('for')}
                      style={{
                        padding: '4px 12px',
                        border: 'none',
                        borderLeft: '1px solid var(--border-color)',
                        background:
                          recurrenceEndType === 'for' ? 'var(--text-color)' : 'none',
                        color:
                          recurrenceEndType === 'for' ? 'var(--bg-color)' : 'var(--text-color)',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                      }}
                    >
                      for
                    </button>
                  </div>

                  {recurrenceEndType === 'for' ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min={2}
                        max={52}
                        value={recurrenceCount}
                        onChange={(e) =>
                          setRecurrenceCount(
                            Math.max(2, Math.min(52, parseInt(e.target.value) || 2))
                          )
                        }
                        style={{
                          width: '60px',
                          border: '1px solid var(--border-color)',
                          padding: '4px 8px',
                        }}
                      />
                      <span className="muted">
                        {recurrenceFrequency === 'monthly' ? 'months' : 'weeks'}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      min={startDate ? startDate.split('T')[0] : undefined}
                      style={{ width: '140px' }}
                    />
                  )}
                </div>
              </div>

              {displayInstances.length > 0 && (
                <div>
                  <label style={{ marginBottom: '8px', display: 'block' }}>
                    {displayInstances.length} times:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {displayInstances.map((inst, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '6px',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="datetime-local"
                          value={inst.date}
                          onChange={(e) => {
                            const next = [...displayInstances]
                            next[i] = { ...next[i], date: e.target.value }
                            setManualInstances(next)
                          }}
                          style={{ width: '180px', flex: '0 0 auto' }}
                        />
                        <input
                          type="url"
                          value={inst.url}
                          onChange={(e) => {
                            const next = [...displayInstances]
                            next[i] = { ...next[i], url: e.target.value }
                            setManualInstances(next)
                          }}
                          placeholder="event url (optional)"
                          style={{ flex: 1, minWidth: 0 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = displayInstances.filter((_, j) => j !== i)
                            setManualInstances(next)
                          }}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: '4px 6px',
                            fontSize: '1em',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">notes for Mox staff:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="how many people do you expect? any room preferences or AV needs? anything else we should know?"
            />
          </div>

          {submitError && <p className="error">{submitError}</p>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting || (status === 'Recurring' && displayInstances.length === 0)}
              className="primary"
            >
              {submitting
                ? 'submitting...'
                : status === 'Recurring' && displayInstances.length > 0
                  ? `submit ${displayInstances.length} events`
                  : 'submit event'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setFetchError(null)
              }}
            >
              back
            </button>
          </div>
        </form>
      )}
    </>
  )
}
