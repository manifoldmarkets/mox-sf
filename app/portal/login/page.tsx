'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/portal/api/session')
        if (response.ok) {
          const data = await response.json()
          if (data.isLoggedIn) {
            router.push('/portal')
            return
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/portal/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Check your email! We sent you a login link.')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to send email. Please try again.')
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page dark:bg-background-page-dark px-4">
        <div className="text-text-tertiary dark:text-text-tertiary-dark">
          Checking session...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-page dark:bg-background-page-dark px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand dark:text-brand-dark-mode mb-2 font-display">
            Member Portal
          </h1>
          <p className="text-text-tertiary dark:text-text-tertiary-dark font-sans">
            Sign in to edit your profile and manage your membership
          </p>
        </div>

        <div className="bg-background-surface dark:bg-background-surface-dark shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2 font-sans"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand font-sans"
                placeholder="your@email.com"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>

            {message && (
              <div
                className={`p-4 font-sans ${
                  status === 'success'
                    ? 'bg-success-bg dark:bg-success-bg-dark text-success-text dark:text-success-text-dark border border-success-bg dark:border-success-bg-dark'
                    : 'bg-error-bg dark:bg-error-bg-dark text-error-text dark:text-error-text-dark border border-error-bg dark:border-error-bg-dark'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-brand dark:bg-brand text-white py-2 px-4 hover:bg-brand-dark dark:hover:bg-brand-dark disabled:bg-text-muted dark:disabled:bg-text-muted-dark disabled:cursor-not-allowed transition-colors font-sans"
            >
              {status === 'loading' ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-tertiary dark:text-text-tertiary-dark font-sans">
            <p>We'll email you a secure link to access your profile.</p>
            <p className="mt-1">The link expires in 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
