'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type PageState = 'loading' | 'active' | 'inactive' | 'not-found' | 'error'

interface ValidateResponse {
  status: PageState
  eventName?: string
  formattedHours?: string
}

function DoorPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('evt')
  const [state, setState] = useState<PageState>('loading')
  const [eventName, setEventName] = useState('')
  const [formattedHours, setFormattedHours] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlockedAt, setUnlockedAt] = useState<number | null>(null)
  const [unlockError, setUnlockError] = useState('')

  useEffect(() => {
    if (!token) {
      setState('not-found')
      return
    }

    fetch('/door/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data: ValidateResponse) => {
        setState(data.status)
        if (data.eventName) setEventName(data.eventName)
        if (data.formattedHours) setFormattedHours(data.formattedHours)
      })
      .catch(() => setState('error'))
  }, [token])

  useEffect(() => {
    if (unlockedAt === null) return
    const timer = setTimeout(() => setUnlockedAt(null), 8000)
    return () => clearTimeout(timer)
  }, [unlockedAt])

  const handleUnlock = async () => {
    if (!token) return
    setUnlocking(true)
    setUnlockError('')
    try {
      const res = await fetch('/door/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.success) {
        setUnlockedAt(Date.now())
      } else if (data.reason === 'inactive') {
        setUnlockError("This link isn't active right now.")
        setState('inactive')
      } else if (data.reason === 'throttled') {
        setUnlockError('Too many attempts. Wait a moment and try again.')
      } else {
        setUnlockError("Couldn't unlock. Try again, or contact us.")
      }
    } catch {
      setUnlockError("Couldn't unlock. Try again, or contact us.")
    } finally {
      setUnlocking(false)
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (state === 'active') {
    const justUnlocked = unlockedAt !== null
    return (
      <div className="min-h-screen bg-slate-50 text-gray-800">
        <div className="max-w-md mx-auto pt-8 pb-8 px-6">
          <div className="bg-amber-50 border-2 border-amber-200 p-6 mb-6 text-center">
            <div className="text-sm text-amber-700 mb-1">Event</div>
            <div className="text-2xl font-bold text-amber-900 mb-2">
              {eventName}
            </div>
            <div className="text-sm text-amber-800">{formattedHours}</div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={unlocking}
            className={`w-full py-6 text-xl font-semibold transition-all mb-4 ${
              justUnlocked
                ? 'bg-green-600 text-white'
                : unlocking
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-800 text-white hover:bg-amber-900'
            }`}
          >
            {unlocking
              ? 'Unlocking...'
              : justUnlocked
                ? '✓ Door open — go on in'
                : 'Unlock Door'}
          </button>

          {unlockError && (
            <p className="text-sm text-red-600 text-center mb-4">
              {unlockError}
            </p>
          )}

          <div className="bg-white border border-slate-200 p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <div className="font-semibold text-gray-800">
                  1680 Mission St
                </div>
                <div className="text-sm text-gray-500">
                  Tap Unlock when you&apos;re at the front door
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400">
            Questions?{' '}
            <a
              href="mailto:team@moxsf.com"
              className="text-amber-800 hover:text-amber-600"
            >
              team@moxsf.com
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'inactive') {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-800">
        <div className="max-w-md mx-auto pt-16 pb-8 px-6 text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Not active right now
          </h1>
          {eventName && (
            <p className="text-gray-700 mb-1 font-semibold">{eventName}</p>
          )}
          {formattedHours && (
            <p className="text-gray-600 mb-6">{formattedHours}</p>
          )}
          <p className="text-sm text-gray-500">
            This unlock link only works during the event hours above.
          </p>
        </div>
      </div>
    )
  }

  if (state === 'not-found') {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-800">
        <div className="max-w-md mx-auto pt-16 pb-8 px-6 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">
            Link not valid
          </h1>
          <p className="text-gray-600 mb-6">
            Check the link you were sent, or contact the event organizer.
          </p>
          <a
            href="mailto:team@moxsf.com"
            className="inline-block px-6 py-3 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <div className="max-w-md mx-auto pt-16 pb-8 px-6 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          Try refreshing, or contact us for help.
        </p>
        <div className="space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all"
          >
            Refresh
          </button>
          <a
            href="mailto:team@moxsf.com"
            className="inline-block px-6 py-3 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DoorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <DoorPageContent />
    </Suspense>
  )
}
