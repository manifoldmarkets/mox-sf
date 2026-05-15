'use client'

import { useState } from 'react'
import { PASS_TYPES, type PassTypeId } from '@/app/lib/day-pass-pricing'

const ALL_PASS_TYPES = Object.values(PASS_TYPES)

export default function IssueDayPassForm() {
  const [passTypeId, setPassTypeId] = useState<PassTypeId>('day')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(false)

    if (!recipientName.trim()) {
      setError('recipient name is required')
      return
    }
    if (!recipientEmail.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipientEmail.trim())) {
      setError('valid recipient email is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/portal/api/admin/issue-day-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientEmail: recipientEmail.trim(),
          passTypeId,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
        setRecipientName('')
        setRecipientEmail('')
        setPassTypeId('day')
      } else {
        setError(data.error || 'failed to issue pass')
      }
    } catch {
      setError('network error. please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="form-group">
        <label htmlFor="pass-type">pass type</label>
        <select
          id="pass-type"
          value={passTypeId}
          onChange={(e) => setPassTypeId(e.target.value as PassTypeId)}
        >
          {ALL_PASS_TYPES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="recipient-name">recipient name</label>
        <input
          id="recipient-name"
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="first last"
        />
      </div>

      <div className="form-group">
        <label htmlFor="recipient-email">recipient email</label>
        <input
          id="recipient-email"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="guest@example.com"
        />
        <p className="muted" style={{ marginTop: '5px', fontSize: '0.9em' }}>
          they'll get a magic link to set up their profile and activate the pass.
        </p>
      </div>

      {error && <p className="error">{error}</p>}
      {success && (
        <p style={{ color: 'green' }}>
          pass issued and email sent.
        </p>
      )}

      <button onClick={handleSubmit} disabled={loading} className="primary">
        {loading ? 'issuing...' : 'issue pass'}
      </button>
    </>
  )
}
