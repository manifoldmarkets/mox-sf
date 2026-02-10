'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function EAG26DayPassPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [isEAGAttendee, setIsEAGAttendee] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [doorCode, setDoorCode] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/eag26/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          website,
          isEAGAttendee,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setDoorCode(data.doorCode)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Link href="/" className="back-link">
        &larr; back to home
      </Link>

      <h1>EAG day pass</h1>

      <p>
        Free entry for EAG SF 2026 attendees and their guests, Feb 9 &mdash; 17!
      </p>

      <div className="alert info">
        Mox is a semipublic coworking space hosting AI safety organizations and
        fellowships, and a host to{' '}
        <a
          href="https://docs.google.com/document/d/1wscXdZkkOLJmOt5MXxv9o5AGYbA2RIo6qV5VjDi-idM/edit?tab=t.0#heading=h.yqiqt79rz7aw"
          target="_blank"
          rel="noopener noreferrer"
        >
          many EAG SF satellite events
        </a>
        . drop by during your time in SF!
      </div>

      <hr />

      {doorCode ? (
        <section>
          <h2>your door code</h2>
          <div
            style={{
              border: '2px solid var(--border-dark)',
              padding: '20px',
              background: 'var(--bg-secondary)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '3em',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                margin: '10px 0',
              }}
            >
              {doorCode}
            </div>
            <p>
              you'll also get this emailed to you!
            </p>
            <p>valid 9 AM &ndash; 8 PM every day through Tuesday, Feb 17
            </p>
          </div>
        </section>
      ) : (
        <section>
          <h2>get a free day pass</h2>

          <div
            style={{
              border: '2px solid var(--border-dark)',
              padding: '20px',
              background: 'var(--bg-secondary)',
            }}
          >

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-dark)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-dark)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="website" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Personal website, LinkedIn, or other profile
                </label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-dark)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isEAGAttendee}
                    onChange={(e) => setIsEAGAttendee(e.target.checked)}
                    required
                    style={{ marginTop: '3px' }}
                  />
                  <span>
                    I confirm that I am an EAG SF 2026 attendee or the guest of one.
                  </span>
                </label>
              </div>

              {error && (
                <div className="alert error" style={{ marginBottom: '15px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !name || !email || !website || !isEAGAttendee}
                className="btn primary"
                style={{ padding: '12px 24px', fontSize: '1.1em', width: '100%' }}
              >
                {isSubmitting ? 'submitting...' : 'get door code'}
              </button>
            </form>
            <div style={{ marginTop: '15px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              full day access (9 AM &ndash; 8 PM)
            </div>
          </div>
        </section>
      )}

      <hr />

      <section>
        <h2>location</h2>
        <p>
          <strong>1680 Mission St, San Francisco</strong>
          <br />
          <span className="muted">between 12th & 13th St</span>
        </p>
      </section>

      <hr />

      <section>
        <h2>Mox Floorplan</h2>
        <ul>
          <li>Floor 4: Hangouts & EAs floor, nap rooms, gym, printing
          </li>
          <li>Floor 3: Startups floor, hotdesks, cafeteria
          </li>
          <li>Floor 2: AI safety floor, hotdesks, podcasting room
          </li>
          <li>Floor 1: Events hall, bike storage
          </li>
        </ul>
      </section>

      <hr />

      <section>
        <h2>more about Mox</h2>
        <p>
          <Link href="/membership">&rarr; membership info</Link>
        </p>
        <p>
          <Link href="/events">&rarr; upcoming events</Link>
        </p>
        <p>
          <Link href="/discord">&rarr; join our discord</Link>
        </p>
      </section>

      <hr />

      <p className="muted">
        questions? email us at{' '}
        <a href="mailto:team@moxsf.com">team@moxsf.com</a>
      </p>
    </>
  )
}
