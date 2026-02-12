'use client'

import { useState, useEffect, useRef } from 'react'

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

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitResult, setSubmitResult] = useState<{ status: string } | null>(null)

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

      setSubmitResult({ status: data.status })
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
        {submitResult.status === 'Confirmed' ? (
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
            </select>
            <p className="muted" style={{ marginTop: '5px' }}>
              if you mark it &apos;Confirmed&apos;, it will automatically show up on the events calendar.
            </p>
          </div>

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
            <button type="submit" disabled={submitting} className="primary">
              {submitting ? 'submitting...' : 'submit event'}
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
