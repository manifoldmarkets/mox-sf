'use client'

import { useState } from 'react'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchaseDayPass = async () => {
    if (!stripeCustomerId) {
      setError('no stripe customer ID found. please contact support.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/portal/api/create-day-pass-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeCustomerId,
          userName,
          userEmail,
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        const errorMsg =
          data.details || data.error || 'failed to create checkout session'
        setError(errorMsg)
        setLoading(false)
      }
    } catch (err) {
      setError('network error. please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <h2>guest day pass</h2>

      <p>
        want to bring a friend to mox? buy them a day pass for <strong>$25</strong>.
        they'll get full access for the day including wifi, coffee, and meeting
        rooms.
      </p>

      {error && <p className="error">{error}</p>}

      <button
        onClick={handlePurchaseDayPass}
        disabled={loading || !stripeCustomerId}
      >
        {loading ? 'loading...' : 'purchase day pass ($25)'}
      </button>

      <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
        after purchase, you'll receive an activation link to share with your
        guest.
      </p>
    </>
  )
}
