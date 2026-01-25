'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SubscriptionInfoProps {
  stripeCustomerId: string | null
}

interface SubscriptionData {
  tier: string
  rate: string
  renewalDate: string
  status: string
  pausedUntil?: string | null
  isPaused?: boolean
}

interface CancelledData {
  cancelled: true
  customerEmail: string | null
}

export default function SubscriptionInfo({
  stripeCustomerId,
}: SubscriptionInfoProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  )
  const [cancelledData, setCancelledData] = useState<CancelledData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [showPauseForm, setShowPauseForm] = useState(false)
  const [resumeDate, setResumeDate] = useState<string>('')
  const [pauseReason, setPauseReason] = useState('')
  const [pauseLoading, setPauseLoading] = useState(false)
  const [pauseError, setPauseError] = useState<string | null>(null)

  const getDefaultResumeDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().split('T')[0]
  }

  useEffect(() => {
    async function fetchSubscription() {
      if (!stripeCustomerId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/portal/api/subscription?customerId=${stripeCustomerId}`
        )
        const data = await response.json()

        if (response.ok && data.subscription) {
          setSubscription(data.subscription)
        } else if (data.cancelled) {
          setCancelledData({
            cancelled: true,
            customerEmail: data.customerEmail,
          })
        } else {
          setError(data.message || 'no active subscription')
        }
      } catch (err) {
        setError('failed to load subscription')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [stripeCustomerId])

  const handleManageBilling = async () => {
    if (!stripeCustomerId) return

    setBillingLoading(true)
    try {
      const response = await fetch('/portal/api/create-billing-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeCustomerId }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert('failed to open billing portal. please try again.')
        setBillingLoading(false)
      }
    } catch (err) {
      alert('failed to open billing portal. please try again.')
      setBillingLoading(false)
    }
  }

  const handlePauseSubmit = async () => {
    setPauseError(null)

    if (!pauseReason.trim()) {
      setPauseError('please provide a reason for pausing')
      return
    }

    if (resumeDate) {
      const selectedDate = new Date(resumeDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        setPauseError('resume date must be in the future')
        return
      }
    }

    setPauseLoading(true)
    try {
      const response = await fetch('/portal/api/pause-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeDate: resumeDate || null,
          reason: pauseReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const subResponse = await fetch(
          `/portal/api/subscription?customerId=${stripeCustomerId}`
        )
        const subData = await subResponse.json()
        if (subData.subscription) {
          setSubscription(subData.subscription)
        }
        setShowPauseForm(false)
        setPauseReason('')
        setResumeDate('')
      } else {
        setPauseError(data.error || 'failed to pause subscription')
      }
    } catch (err) {
      setPauseError('failed to pause subscription')
    } finally {
      setPauseLoading(false)
    }
  }

  const handleResume = async () => {
    setPauseLoading(true)

    try {
      const response = await fetch('/portal/api/pause-subscription', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        const subResponse = await fetch(
          `/portal/api/subscription?customerId=${stripeCustomerId}`
        )
        const subData = await subResponse.json()
        if (subData.subscription) {
          setSubscription(subData.subscription)
        }
      } else {
        setPauseError(data.error || 'failed to resume subscription')
      }
    } catch (err) {
      setPauseError('failed to resume subscription')
    } finally {
      setPauseLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <h2>subscription</h2>
        <p className="loading">loading subscription details...</p>
      </>
    )
  }

  if (!stripeCustomerId || error) {
    return (
      <>
        <h2>subscription</h2>
        <p>no active subscription found</p>
      </>
    )
  }

  if (cancelledData) {
    return (
      <>
        <h2>subscription</h2>
        <div className="alert warning">
          <p>
            <strong>your subscription has been cancelled.</strong>
          </p>
          <p>
            we'd love to have you back!{' '}
            <Link href="/portal/renew">renew membership</Link>
          </p>
        </div>
      </>
    )
  }

  if (!subscription) {
    return null
  }

  const renewalDate = new Date(subscription.renewalDate)
  const formattedDate = renewalDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const isPaused = subscription.isPaused
  const pausedUntilDate = subscription.pausedUntil
    ? new Date(subscription.pausedUntil)
    : null
  const isIndefinitePause = isPaused && !pausedUntilDate

  return (
    <>
      <h2>subscription</h2>

      {isPaused && (
        <div className="alert warning">
          <p>
            <strong>your subscription is paused.</strong>{' '}
            {isIndefinitePause
              ? "we'll resume billing when you're ready."
              : `billing resumes on ${pausedUntilDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
          </p>
          <p style={{ marginTop: '10px' }}>
            <button onClick={handleResume} disabled={pauseLoading}>
              {pauseLoading ? 'resuming...' : 'resume now'}
            </button>
          </p>
        </div>
      )}

      <p>
        <strong>{subscription.tier}</strong> · {subscription.rate} · renews {formattedDate}
      </p>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleManageBilling}
          disabled={billingLoading}
          className="primary"
        >
          {billingLoading ? 'loading...' : 'manage billing / change tier'}
        </button>

        {!isPaused && (
          <button onClick={() => setShowPauseForm(!showPauseForm)}>
            {showPauseForm ? 'cancel' : 'pause subscription'}
          </button>
        )}
      </div>

      {showPauseForm && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h3 style={{ marginTop: 0 }}>pause subscription</h3>

          <div className="form-group">
            <label htmlFor="resumeDate">when should we resume billing? (optional)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="date"
                id="resumeDate"
                value={resumeDate}
                onChange={(e) => setResumeDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ flex: 1 }}
              />
              {resumeDate && (
                <button type="button" onClick={() => setResumeDate('')}>
                  clear
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
              {resumeDate
                ? 'billing will resume on this date. you can also resume anytime before.'
                : 'leave blank to pause indefinitely. you can resume anytime.'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="pauseReason">reason for pause:</label>
            <textarea
              id="pauseReason"
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              rows={3}
              placeholder="it really helps us to know why you're pausing, and if there's anything we could do better."
            />
          </div>

          {pauseError && <p className="error">{pauseError}</p>}

          <button
            onClick={handlePauseSubmit}
            disabled={pauseLoading}
            className="primary"
          >
            {pauseLoading ? 'pausing...' : 'confirm pause'}
          </button>
        </div>
      )}
    </>
  )
}
