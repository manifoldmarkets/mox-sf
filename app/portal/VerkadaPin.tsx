'use client'

import { useState, useEffect } from 'react'

interface VerkadaPinProps {
  isViewingAs?: boolean
  tier?: string | null
  isActiveMember?: boolean
}

export default function VerkadaPin({
  isViewingAs = false,
  tier,
  isActiveMember = false,
}: VerkadaPinProps) {
  const [pin, setPin] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [guestPin, setGuestPin] = useState<string | null>(null)
  const [showAppInfo, setShowAppInfo] = useState<boolean>(false)
  const [weeklyCode, setWeeklyCode] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState<boolean>(false)
  const [unlockedAt, setUnlockedAt] = useState<number | null>(null)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const isGuestProgram = tier === 'Program' || tier === 'Guest Program'

  useEffect(() => {
    if (!isActiveMember) {
      setLoading(false)
      return
    }
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
  }, [isActiveMember])

  useEffect(() => {
    if (!isActiveMember) return
    async function fetchWeeklyCode() {
      try {
        const response = await fetch('/portal/api/weekly-door-code')
        if (!response.ok) return
        const data = await response.json()
        if (data.code) setWeeklyCode(data.code)
      } catch (err) {
        console.error('Failed to fetch weekly door code:', err)
      }
    }

    fetchWeeklyCode()
  }, [isActiveMember])

  // Fetch guest PIN for guest program members
  useEffect(() => {
    if (!isGuestProgram || !isActiveMember) return

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
  }, [isGuestProgram, isActiveMember])

  useEffect(() => {
    if (unlockedAt === null) return
    const timer = setTimeout(() => setUnlockedAt(null), 6000)
    return () => clearTimeout(timer)
  }, [unlockedAt])

  const handleUnlock = async () => {
    setUnlocking(true)
    setUnlockError(null)
    try {
      const res = await fetch('/portal/api/unlock-door', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setUnlockedAt(Date.now())
      } else {
        setUnlockError(data.error || "couldn't unlock")
      }
    } catch {
      setUnlockError("couldn't unlock")
    } finally {
      setUnlocking(false)
    }
  }

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

  if (!isActiveMember) {
    return (
      <>
        <h3>door code</h3>
        <p>
          your membership isn&apos;t active right now, so door codes aren&apos;t
          available. email{' '}
          <a href="mailto:team@moxsf.com">team@moxsf.com</a> to sort it out.
        </p>
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

  const justUnlocked = unlockedAt !== null
  const weeklyCodeBlock = weeklyCode && (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ marginBottom: '5px' }}>this week&apos;s shared door code:</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div className="pin-display">{weeklyCode}#</div>
        <button
          onClick={handleUnlock}
          disabled={unlocking || justUnlocked || isViewingAs}
          className={justUnlocked ? '' : 'primary'}
        >
          {unlocking
            ? 'unlocking…'
            : justUnlocked
              ? '✓ unlocked'
              : 'unlock door'}
        </button>
      </div>
      {unlockError && (
        <p className="error" style={{ marginTop: '8px' }}>{unlockError}</p>
      )}
    </div>
  )

  if (!hasAccess || !pin) {
    // Show guest PIN for guest program members even if they don't have personal access
    if (isGuestProgram && guestPin) {
      return (
        <>
          <h3>door code</h3>
          {weeklyCodeBlock}
          <p>as a guest program member, use this shared PIN code to enter:</p>
          <div className="pin-display">{guestPin}#</div>
        </>
      )
    }

    return (
      <>
        <h3>front door access</h3>
        {weeklyCodeBlock}
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

      {weeklyCodeBlock}

      <p className="muted" style={{ fontSize: '0.9em' }}>
        your personal PIN (for guests/deliveries): <code>{pin}#</code>
        {' · '}
        <span
          onClick={() => setShowAppInfo(!showAppInfo)}
          style={{
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            cursor: 'pointer',
          }}
        >
          or use the app
        </span>
        {' · '}
        {!showConfirm ? (
          <span
            onClick={() => !regenerating && !isViewingAs && setShowConfirm(true)}
            style={{
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              cursor: regenerating || isViewingAs ? 'not-allowed' : 'pointer',
              opacity: regenerating || isViewingAs ? 0.5 : 1,
            }}
          >
            {regenerating ? 'regenerating…' : 'regenerate'}
          </span>
        ) : (
          <>
            confirm regenerate?{' '}
            <button onClick={handleRegenerate} className="danger">
              yes
            </button>{' '}
            <button onClick={() => setShowConfirm(false)}>cancel</button>
          </>
        )}
      </p>

      {showAppInfo && (
        <div style={{ marginBottom: '10px', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p style={{ marginBottom: '10px' }}>
            install the Verkada Pass app to unlock via Bluetooth. sign in with the same email you use for this portal.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="https://apps.apple.com/app/verkada-pass/id1477261074"
              target="_blank"
              rel="noopener noreferrer"
              className="btn small"
            >
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.verkada.VerkadaPass"
              target="_blank"
              rel="noopener noreferrer"
              className="btn small"
            >
              Google Play
            </a>
          </div>
        </div>
      )}

      {isViewingAs && (
        <p className="muted" style={{ marginTop: '10px' }}>
          to change this user&apos;s PIN, use the verkada admin portal
        </p>
      )}
    </>
  )
}
