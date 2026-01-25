'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

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
        setMessage('check your email! we sent you a login link.')
      } else {
        setStatus('error')
        setMessage(data.error || 'something went wrong. please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('failed to send email. please try again.')
    }
  }

  if (checkingSession) {
    return (
      <>
        <h1>member portal</h1>
        <p className="loading">checking session...</p>
      </>
    )
  }

  return (
    <>
      <Link href="/" className="back-link">
        ← back to home
      </Link>

      <h1>member portal</h1>

      <p>sign in to edit your profile and manage your membership.</p>

      <hr />

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">email address:</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={status === 'loading' || status === 'success'}
          />
        </div>

        {message && (
          <p className={status === 'success' ? 'success' : 'error'}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="primary"
        >
          {status === 'loading' ? 'sending...' : 'send login link'}
        </button>
      </form>

      <p className="muted" style={{ marginTop: '20px' }}>
        we'll email you a secure link to access your profile. the link expires
        in 24 hours.
      </p>
    </>
  )
}
