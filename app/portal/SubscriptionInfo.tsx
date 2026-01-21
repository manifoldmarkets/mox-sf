'use client'

import { useEffect, useState } from 'react'

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
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [resumeDate, setResumeDate] = useState<string>('')
  const [pauseReason, setPauseReason] = useState('')
  const [pauseLoading, setPauseLoading] = useState(false)
  const [pauseError, setPauseError] = useState<string | null>(null)

  // Helper to get default resume date (one month from today)
  const getDefaultResumeDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().split('T')[0]
  }

  const handlePauseClick = () => {
    setResumeDate(getDefaultResumeDate())
    setShowPauseModal(true)
    setPauseError(null)
  }

  const handleResumeDateChange = (newDate: string) => {
    setResumeDate(newDate)

    // Clear error when user changes date
    if (pauseError === 'Resume date must be in the future') {
      setPauseError(null)
    }

    // Validate immediately if a date is selected
    if (newDate) {
      const selectedDate = new Date(newDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        setPauseError('Resume date must be in the future')
      }
    }
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
          setError(data.message || 'No active subscription')
        }
      } catch (err) {
        setError('Failed to load subscription')
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
        alert('Failed to open billing portal. Please try again.')
        setBillingLoading(false)
      }
    } catch (err) {
      alert('Failed to open billing portal. Please try again.')
      setBillingLoading(false)
    }
  }

  const handlePauseSubmit = async () => {
    setPauseError(null)

    if (!pauseReason.trim()) {
      setPauseError('Please provide a reason for pausing')
      return
    }

    // Validate resume date if provided
    if (resumeDate) {
      const selectedDate = new Date(resumeDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        setPauseError('Resume date must be in the future')
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
        setShowPauseModal(false)
        setPauseReason('')
        setResumeDate('')
      } else {
        setPauseError(data.error || 'Failed to pause subscription')
      }
    } catch (err) {
      setPauseError('Failed to pause subscription')
    } finally {
      setPauseLoading(false)
    }
  }

  const handleResumeSubmit = async () => {
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
        setPauseError(data.error || 'Failed to resume subscription')
      }
    } catch (err) {
      setPauseError('Failed to resume subscription')
    } finally {
      setPauseLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-6">
        <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">
          Subscription
        </h2>
        <p className="text-text-secondary dark:text-text-secondary-dark">
          Loading subscription details...
        </p>
      </div>
    )
  }

  if (!stripeCustomerId || error) {
    return (
      <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-6">
        <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">
          Subscription
        </h2>
        <p className="text-text-secondary dark:text-text-secondary-dark">
          No active subscription found
        </p>
      </div>
    )
  }

  // Show cancelled subscription with renewal option
  if (cancelledData) {
    return (
      <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
          <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode font-display">
            Subscription
          </h2>
          <a
            href="/portal/renew"
            className="px-4 py-2 bg-brand dark:bg-brand-dark-mode text-white text-sm font-medium hover:bg-brand-dark dark:hover:bg-brand transition-colors text-center"
          >
            Renew Membership
          </a>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
            Your subscription has been cancelled
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            We'd love to have you back! Click "Renew Membership" to rejoin.
          </p>
        </div>
      </div>
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
      <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode font-display">
            Subscription
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {!isPaused && (
              <button
                onClick={handlePauseClick}
                className="px-4 py-2 bg-text-tertiary dark:bg-text-tertiary-dark text-white text-sm font-medium hover:bg-text-secondary dark:hover:bg-text-secondary-dark transition-colors font-sans"
              >
                Pause
              </button>
            )}
            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              className="px-4 py-2 bg-brand dark:bg-brand-dark-mode text-white text-sm font-medium hover:bg-brand-dark dark:hover:bg-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans"
            >
              {billingLoading ? (
                'Loading...'
              ) : (
                <>
                  Change tier
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {isPaused && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 mb-4 font-sans">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Your subscription is taking a break
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {isIndefinitePause
                    ? "We'll bill you when you're ready to resume. Honor system—you still have access if you need it."
                    : `We'll resume billing on ${pausedUntilDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Honor system—you still have access if you need it.`}
                </p>
              </div>
              <button
                onClick={handleResumeSubmit}
                disabled={pauseLoading}
                className="px-3 py-1.5 bg-yellow-600 dark:bg-yellow-700 text-white text-sm font-medium hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50"
              >
                {pauseLoading ? 'Resuming...' : 'Resume'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 font-sans">
          <div className="bg-background-subtle dark:bg-background-subtle-dark p-4 border border-border-light dark:border-border-light-dark">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark font-medium mb-1">
              Plan
            </p>
            <p className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
              {subscription.tier}
            </p>
          </div>
          <div className="bg-background-subtle dark:bg-background-subtle-dark p-4 border border-border-light dark:border-border-light-dark">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark font-medium mb-1">
              Rate
            </p>
            <p className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
              {subscription.rate}
            </p>
          </div>
          <div className="bg-background-subtle dark:bg-background-subtle-dark p-4 border border-border-light dark:border-border-light-dark">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark font-medium mb-1">
              Renewal Date
            </p>
            <p className="text-base font-semibold text-text-primary dark:text-text-primary-dark">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {showPauseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full p-6 font-sans">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Pause Subscription
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                When should we resume billing? (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={resumeDate}
                  onChange={(e) => handleResumeDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {resumeDate && (
                  <button
                    type="button"
                    onClick={() => handleResumeDateChange('')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    title="Clear date (pause indefinitely)"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {resumeDate
                  ? 'Billing will resume on this date (you can also resume anytime before). You can also leave this blank to pause indefinitely.'
                  : 'No date set - pausing indefinitely. You can resume or set a date anytime.'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for pause
              </label>
              <textarea
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Hey, it really helps us to know why you're pausing, and especially if there's anything we can do or could have done better."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is meant to be easy. You'll still have entry access if you
                need it.
              </p>
            </div>

            {pauseError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 text-sm">
                {pauseError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePauseSubmit}
                disabled={pauseLoading}
                className="flex-1 px-4 py-2 bg-amber-800 dark:bg-amber-700 text-white font-medium hover:bg-amber-900 dark:hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                {pauseLoading ? 'Pausing...' : 'Confirm Pause'}
              </button>
              <button
                onClick={() => {
                  setShowPauseModal(false)
                  setPauseError(null)
                  setPauseReason('')
                  setResumeDate('')
                }}
                disabled={pauseLoading}
                className="flex-1 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white font-medium hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
