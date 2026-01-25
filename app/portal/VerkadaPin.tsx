'use client'

import { useState, useEffect } from 'react'

interface VerkadaPinProps {
  isViewingAs?: boolean
}

export default function VerkadaPin({ isViewingAs = false }: VerkadaPinProps) {
  const [pin, setPin] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

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
        <h2>front door access</h2>
        <p className="loading">loading...</p>
      </>
    )
  }

  if (error) {
    return (
      <>
        <h2>front door access</h2>
        <p className="error">{error}</p>
      </>
    )
  }

  if (!hasAccess || !pin) {
    return (
      <>
        <h2>front door access</h2>
        <p>
          door access is not available for your account. please contact a staff
          member to set up verkada access.
        </p>
      </>
    )
  }

  return (
    <>
      <h2>front door access</h2>

      <p>
        your personal PIN code. you can share this with guests, but you need to
        be in the building when they use it.
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
          <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
            to change this user's PIN, use the verkada admin portal
          </p>
        )}
      </div>
    </>
  )
}
