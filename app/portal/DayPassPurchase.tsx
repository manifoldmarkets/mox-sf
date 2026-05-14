'use client'

import { useState } from 'react'
import {
  MEMBER_PASS_TYPES,
  formatPrice,
  type PassTypeId,
  type PassType,
} from '@/app/lib/day-pass-pricing'

interface DayPassPurchaseProps {
  stripeCustomerId: string | null
  userName: string
  userEmail: string
}

export default function DayPassPurchase({
  stripeCustomerId,
  userName,
  userEmail,
}: DayPassPurchaseProps) {
  const [passTypeId, setPassTypeId] = useState<PassTypeId>('day')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = MEMBER_PASS_TYPES.find(
    (p) => p.id === passTypeId
  ) as PassType
  const priceLabel = formatPrice(selected.memberPriceCents as number)

  const handlePurchase = async () => {
    setError(null)

    const trimmedName = guestName.trim()
    const trimmedEmail = guestEmail.trim()
    if (!trimmedName) {
      setError('please enter your guest’s name.')
      return
    }
    if (!trimmedEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      setError('please enter a valid email for your guest.')
      return
    }
    if (trimmedEmail.toLowerCase() === userEmail.toLowerCase()) {
      setError(
        'this pass is for a guest. for yourself, use your member access.'
      )
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/portal/api/create-day-pass-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeCustomerId,
          purchaserName: userName,
          purchaserEmail: userEmail,
          guestName: trimmedName,
          guestEmail: trimmedEmail,
          passTypeId,
        }),
      })

      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(
          data.details || data.error || 'failed to create checkout session'
        )
        setLoading(false)
      }
    } catch {
      setError('network error. please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <h3>buy a day pass for a guest</h3>

      <p>
        bring a friend to mox. they’ll get a magic link to set up a quick
        profile and activate their pass when they arrive.
      </p>

      <div className="form-group">
        <label htmlFor="pass-type">pass type</label>
        <select
          id="pass-type"
          value={passTypeId}
          onChange={(e) => setPassTypeId(e.target.value as PassTypeId)}
        >
          {MEMBER_PASS_TYPES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} — {formatPrice(p.memberPriceCents as number)}
            </option>
          ))}
        </select>
        <p className="muted" style={{ marginTop: '5px', fontSize: '0.9em' }}>
          {selected.description}
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="guest-name">guest’s name</label>
        <input
          id="guest-name"
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="first last"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="guest-email">guest’s email</label>
        <input
          id="guest-email"
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="guest@example.com"
          required
        />
        <p className="muted" style={{ marginTop: '5px', fontSize: '0.9em' }}>
          we’ll email them a link to activate the pass.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <button onClick={handlePurchase} disabled={loading} className="primary">
        {loading ? 'loading...' : `purchase ${selected.label.toLowerCase()} (${priceLabel})`}
      </button>
    </>
  )
}
