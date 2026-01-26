'use client'

import { useState, useEffect } from 'react'

interface VerkadaPinProps {
  isViewingAs?: boolean
  tier?: string | null
}

export default function VerkadaPin({
  isViewingAs = false,
  tier,
}: VerkadaPinProps) {
  const [pin, setPin] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [guestPin, setGuestPin] = useState<string | null>(null)

  const isGuestProgram = tier === 'Program' || tier === 'Guest Program'

  useEffect(() => {
    async function fetchPin() {
      try {
        const response = await fetch('/portal/api/verkada-pin')
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'failed to fetch PIN')
          setLoading(false)
          return
        }

        setPin(data.pin)
        setHasAccess(data.hasAccess)
        setLoading(false)
      } catch (err) {
        setError('failed to load door access information')
        setLoading(false)
      }
    }

    fetchPin()
  }, [])

  // Fetch guest PIN for guest program members
  useEffect(() => {
    if (!isGuestProgram) return

    async function fetchGuestPin() {
      try {
        const response = await fetch('/portal/api/verkada-guest-pin')
        const data = await response.json()

        if (response.ok && data.pin) {
          setGuestPin(data.pin)
        }
      } catch (err) {
        console.error('Failed to fetch guest PIN:', err)
      }
    }

    fetchGuestPin()
  }, [isGuestProgram])

  const handleRegenerate = async () => {
    setShowConfirm(false)
    setRegenerating(true)
    setError(null)

    try {
      const response = await fetch('/portal/api/verkada-pin', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'failed to regenerate PIN')
        setRegenerating(false)
        return
      }

      setPin(data.pin)
      setRegenerating(false)
    } catch (err) {
      setError('failed to regenerate PIN')
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <>
        <h3>door code</h3>
        <p className="loading">loading...</p>
      </>
    )
  }

  if (error) {
    return (
      <>
        <h3>door code</h3>
        <p className="error">{error}</p>
      </>
    )
  }

  if (!hasAccess || !pin) {
    // Show guest PIN for guest program members even if they don't have personal access
    if (isGuestProgram && guestPin) {
      return (
        <>
          <h3>door code</h3>
          <p>as a guest program member, use this shared PIN code to enter:</p>
          <div className="pin-display">{guestPin}#</div>
        </>
      )
    }

    return (
      <>
        <h3>front door access</h3>
        <p>
          door access is not available for your account. please contact a staff
          member to set up verkada access.
        </p>
      </>
    )
  }

  return (
    <>
      <h3>door code</h3>

      <p>
        your personal PIN code (weekly code is in the Discord). this is for guests or deliveries.
      </p>

      <div className="pin-display">{pin}#</div>

      <div style={{ marginTop: '15px' }}>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={regenerating || isViewingAs}
          >
            {regenerating ? 'generating...' : 'regenerate PIN'}
          </button>
        ) : (
          <div className="alert warning">
            <p>
              <strong>regenerate PIN?</strong> your current PIN ({pin}#) will
              stop working immediately.
            </p>
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleRegenerate} className="danger">
                yes, regenerate
              </button>{' '}
              <button onClick={() => setShowConfirm(false)}>cancel</button>
            </div>
          </div>
        )}

        {isViewingAs && (
          <p className="muted" style={{ marginTop: '10px' }}>
            to change this user's PIN, use the verkada admin portal
          </p>
        )}
      </div>

      {/* Verkada Pass App */}
      <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
        <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>verkada pass app</h4>
        <p>
          install the Verkada Pass app to unlock the door via Bluetooth — no code needed.
          sign in with the same email you use for this portal.
        </p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="https://apps.apple.com/app/verkada-pass/id1462898419"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            App Store (iPhone)
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.verkada.pass"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            Google Play (Android)
          </a>
        </div>
      </div>
    </>
  )
}
