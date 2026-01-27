'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type ActivationState = 'loading' | 'success' | 'expired' | 'not-found' | 'error'

function ActivatePageContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [state, setState] = useState<ActivationState>('loading')
  const [doorCode, setDoorCode] = useState<string>('')
  const [passType, setPassType] = useState<string>('EAG Day Pass')
  const [userName, setUserName] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlockSuccess, setUnlockSuccess] = useState(false)
  const [unlockError, setUnlockError] = useState(false)

  useEffect(() => {
    if (!id) {
      setState('not-found')
      return
    }

    fetch('/eag26/activate/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setState('success')
          setDoorCode(data.doorCode)
          setPassType(data.passType || 'EAG Day Pass')
          setUserName(data.userName)
          setExpiresAt(data.expiresAt || '')
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
      const response = await fetch('/eag26/activate/unlock-api', {
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
    } catch {
      setUnlockError(true)
    } finally {
      setUnlocking(false)
    }
  }

  if (state === 'loading') {
    return (
      <>
        <h1>activating pass...</h1>
        <p className="loading">loading your door code...</p>
      </>
    )
  }

  if (state === 'success') {
    return (
      <>
        <h1>welcome, {userName}!</h1>

        <p className="muted">{passType} activated</p>

        {expiresAt && (
          <p className="muted">
            expires 11pm{' '}
            {new Date(expiresAt + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}

        <hr />

        <section>
          <h2>door code</h2>
          <div className="pin-display">{doorCode}#</div>
          <p className="muted">enter this code on the keypad at the front door.</p>
        </section>

        <section style={{ marginTop: '20px' }}>
          <button
            onClick={handleUnlockDoor}
            disabled={unlocking || unlockSuccess}
            className={unlockSuccess ? 'primary' : ''}
            style={{ width: '100%' }}
          >
            {unlocking
              ? 'unlocking...'
              : unlockSuccess
                ? 'door unlocked!'
                : 'unlock door remotely'}
          </button>
          {unlockError && (
            <p className="error" style={{ marginTop: '10px' }}>
              couldn't unlock. try the code on the keypad.
            </p>
          )}
        </section>

        <hr />

        <section>
          <h2>location</h2>
          <p>
            <strong>1680 Mission St, San Francisco</strong>
            <br />
            <span className="muted">between 12th & 13th St</span>
          </p>
        </section>

        <hr />

        <p className="muted">
          questions? email us at{' '}
          <a href="mailto:team@moxsf.com">team@moxsf.com</a>
        </p>
      </>
    )
  }

  if (state === 'expired') {
    return (
      <>
        <h1>pass expired</h1>

        <p>this pass has expired. get a new one to visit.</p>

        <Link href="/eag26" className="btn primary">
          get an EAG day pass
        </Link>
      </>
    )
  }

  if (state === 'not-found') {
    return (
      <>
        <h1>pass not found</h1>

        <p>check your email for the correct link, or get a new pass.</p>

        <Link href="/eag26" className="btn primary">
          get an EAG day pass
        </Link>
      </>
    )
  }

  // Error state
  return (
    <>
      <h1>something went wrong</h1>

      <p>try refreshing, or contact us for help.</p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => window.location.reload()}>refresh</button>
        <a href="mailto:team@moxsf.com" className="btn primary">
          contact us
        </a>
      </div>
    </>
  )
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <>
          <h1>activating pass...</h1>
          <p className="loading">loading...</p>
        </>
      }
    >
      <ActivatePageContent />
    </Suspense>
  )
}
