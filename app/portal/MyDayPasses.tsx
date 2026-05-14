'use client'

import { useState } from 'react'
import { DayPass, computeExpiresAt, isExpired } from './dayPasses'

interface MyDayPassesProps {
  passes: DayPass[]
}

interface ActivatedState {
  doorCode: string
  expiresAt: string | null
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

interface PassCardProps {
  pass: DayPass
  alreadyActivated?: boolean
}

function PassCard({ pass, alreadyActivated }: PassCardProps) {
  const [activated, setActivated] = useState<ActivatedState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/portal/api/activate-day-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId: pass.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setActivated({ doorCode: data.doorCode, expiresAt: data.expiresAt })
      } else {
        setError(data.error || 'failed to activate. try again.')
      }
    } catch {
      setError('network error. try again.')
    } finally {
      setLoading(false)
    }
  }

  if (activated) {
    return (
      <div
        style={{
          border: '2px solid var(--border-dark)',
          background: 'var(--bg-secondary)',
          padding: '20px',
          marginBottom: '10px',
          textAlign: 'center',
        }}
      >
        <div className="muted" style={{ fontSize: '0.9em' }}>
          door code
        </div>
        <div
          style={{
            fontSize: '2.5em',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            fontFamily: 'monospace',
            margin: '8px 0',
          }}
        >
          {activated.doorCode}#
        </div>
        <div className="muted">
          {pass.passType}
          {activated.expiresAt && (
            <> · expires 11pm {formatDate(activated.expiresAt)}</>
          )}
        </div>
        <p
          className="muted"
          style={{ marginTop: '12px', fontSize: '0.9em' }}
        >
          enter on the keypad at 1680 mission st.
        </p>
      </div>
    )
  }

  const buttonLabel = alreadyActivated ? 'show door code' : 'activate'
  const loadingLabel = alreadyActivated ? 'loading...' : 'activating...'

  return (
    <div
      style={{
        border: alreadyActivated
          ? '2px solid var(--border-dark)'
          : '1px solid var(--border)',
        background: alreadyActivated ? 'var(--bg-secondary)' : undefined,
        padding: '15px',
        marginBottom: '10px',
      }}
    >
      <div>
        <strong>{pass.passType}</strong>
      </div>
      <div className="muted">
        {alreadyActivated
          ? `activated · expires 11pm ${formatDate(computeExpiresAt(pass))}`
          : `purchased ${formatDate(pass.datePurchased?.split('T')[0] || null)}`}
      </div>
      {error && (
        <p className="error" style={{ marginTop: '8px' }}>
          {error}
        </p>
      )}
      <p style={{ marginTop: '10px' }}>
        <button onClick={activate} disabled={loading} className="primary">
          {loading ? loadingLabel : buttonLabel}
        </button>
      </p>
      {!alreadyActivated && (
        <p className="muted" style={{ marginTop: '5px', fontSize: '0.9em' }}>
          activate when you arrive at mox. expires 11pm same day.
        </p>
      )}
    </div>
  )
}

export default function MyDayPasses({ passes }: MyDayPassesProps) {
  if (passes.length === 0) return null

  const unused = passes.filter((p) => p.status === 'Unused' && !isExpired(p))
  const active = passes.filter(
    (p) => p.status === 'Activated' && !isExpired(p)
  )
  const past = passes.filter(
    (p) => p.status === 'Expired' || (p.status === 'Activated' && isExpired(p))
  )

  return (
    <section>
      <h2>my day passes</h2>

      {active.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>active today</h3>
          {active.map((pass) => (
            <PassCard key={pass.id} pass={pass} alreadyActivated />
          ))}
        </div>
      )}

      {unused.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>ready to activate</h3>
          {unused.map((pass) => (
            <PassCard key={pass.id} pass={pass} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <details>
          <summary>past passes ({past.length})</summary>
          <ul style={{ marginTop: '10px' }}>
            {past.map((pass) => (
              <li key={pass.id}>
                {pass.passType} —{' '}
                {pass.dateActivated
                  ? `activated ${formatDate(pass.dateActivated)}`
                  : 'expired unused'}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
