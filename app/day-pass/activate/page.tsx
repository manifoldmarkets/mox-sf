'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type ActivationState = 'loading' | 'success' | 'expired' | 'not-found' | 'error'

function ActivatePageContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [state, setState] = useState<ActivationState>('loading')
  const [doorCode, setDoorCode] = useState<string>('')
  // const [passType, setPassType] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlockSuccess, setUnlockSuccess] = useState(false)
  const [unlockError, setUnlockError] = useState(false)

  useEffect(() => {
    if (!id) {
      setState('not-found')
      return
    }

    // Validate the payment ID and get activation status
    fetch('/day-pass/activate/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setState('success')
          setDoorCode(data.doorCode)
          // setPassType(data.passType)
          setUserName(data.userName)
        } else if (data.status === 'expired') {
          setState('expired')
        } else if (data.status === 'not-found') {
          setState('not-found')
        } else {
          setState('error')
        }
      })
      .catch(() => setState('error'))
  }, [id])

  const handleUnlockDoor = async () => {
    setUnlocking(true)
    setUnlockError(false)
    setUnlockSuccess(false)

    try {
      const response = await fetch('/day-pass/activate/unlock-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: id }),
      })

      const data = await response.json()

      if (data.success) {
        setUnlockSuccess(true)
      } else {
        setUnlockError(true)
      }
    } catch (error) {
      setUnlockError(true)
    } finally {
      setUnlocking(false)
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating your day pass...</p>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-800">
        <div className="max-w-2xl mx-auto pt-20 px-6">
          <div className="bg-white shadow-xl p-8 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-600 text-2xl">✓</span>
            </div>

            <h1 className="text-3xl font-bold mb-4 font-display text-green-700">
              Welcome to Mox, {userName}!
            </h1>

            <p className="text-gray-600 mb-8">
              {/* Your {passType} has been activated, and will expire at midnight. Here's your door code: */}
              Your pass has been activated, and will expire at midnight. Here's
              your door code:
            </p>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-amber-700 mb-2">Door Code</p>
              <p className="text-4xl font-bold text-amber-800 tracking-wider">
                {doorCode}#
              </p>
            </div>

            <div className="mb-8">
              <button
                onClick={handleUnlockDoor}
                disabled={unlocking}
                className={`w-full px-8 py-4 font-semibold transition-all duration-200 ${
                  unlocking
                    ? 'bg-gray-400 cursor-not-allowed'
                    : unlockSuccess
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-amber-800 hover:bg-amber-900'
                } text-white`}
              >
                {unlocking
                  ? 'Unlocking...'
                  : unlockSuccess
                    ? '✓ Door Unlocked!'
                    : 'Unlock Door Now'}
              </button>
              {unlockError && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  Failed to unlock door. Please try again or use the door code.
                </p>
              )}
            </div>

            <div className="space-y-4 text-left bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-800">Getting to Mox:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Address:</strong> 1680 Mission Street, San Francisco
                </p>
                <p>
                  <strong>Entry:</strong> Use the door code above at the main
                  entrance
                </p>
                {/* <p><strong>Hours:</strong> {passType === 'Happy Hour Pass' ? '4:00 PM - 11:00 PM' : '9:00 AM - 11:00 PM'}</p> */}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Questions? Contact{' '}
                <a
                  href="mailto:rachel@moxsf.com"
                  className="text-amber-800 hover:text-amber-600"
                >
                  rachel@moxsf.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-800">
        <div className="max-w-2xl mx-auto pt-20 px-6">
          <div className="bg-white shadow-xl p-8 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-orange-600 text-2xl">⚠</span>
            </div>

            <h1 className="text-3xl font-bold mb-4 font-display text-orange-700">
              Pass Expired
            </h1>

            <p className="text-gray-600 mb-8">
              This day pass has already been used or has expired. Please
              purchase a new pass if you'd like to visit Mox.
            </p>

            <a
              href="/day-pass"
              className="inline-block px-8 py-4 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all duration-200"
            >
              Purchase New Pass
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'not-found') {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-800">
        <div className="max-w-2xl mx-auto pt-20 px-6">
          <div className="bg-white shadow-xl p-8 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl">✗</span>
            </div>

            <h1 className="text-3xl font-bold mb-4 font-display text-red-700">
              Pass Not Found
            </h1>

            <p className="text-gray-600 mb-8">
              We couldn't find a day pass with this ID. Please check your email
              for the correct activation link.
            </p>

            <a
              href="/day-pass"
              className="inline-block px-8 py-4 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all duration-200"
            >
              Purchase New Pass
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      <div className="max-w-2xl mx-auto pt-20 px-6">
        <div className="bg-white shadow-xl p-8 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">!</span>
          </div>

          <h1 className="text-3xl font-bold mb-4 font-display text-red-700">
            Something Went Wrong
          </h1>

          <p className="text-gray-600 mb-8">
            We're having trouble processing your request. Please try again or
            contact support.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-8 py-4 bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-all duration-200 mr-4"
            >
              Try Again
            </button>
            <a
              href="mailto:rachel@moxsf.com"
              className="inline-block px-8 py-4 bg-amber-800 text-white font-semibold hover:bg-amber-900 transition-all duration-200"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActivatePage() {
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
      <ActivatePageContent />
    </Suspense>
  )
}
