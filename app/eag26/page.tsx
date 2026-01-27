'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function EAG26DayPassPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const isFreePass = code === 'table'

  const handleCheckout = () => {
    const url = isFreePass
      ? 'https://buy.stripe.com/6oU14p2QU4k9cZNdOSbbG08?prefilled_promo_code=TABLE'
      : 'https://buy.stripe.com/6oU14p2QU4k9cZNdOSbbG08'
    window.location.href = url
  }

  return (
    <>
      <Link href="/" className="back-link">
        &larr; back to home
      </Link>

      <h1>EAG day pass</h1>

      <p>
        special rate for EAG 2026 attendees, Feb 9 &mdash; Feb 20.
      </p>

      <div className="alert info">
        Mox is a semipublic coworking space hosting AI safety organizations and
        fellowships, and a host to{' '}
        <a
          href="https://docs.google.com/document/d/14fm12_piAKRTLm4R5o_4DS43eCf84kWKuoerO4Sv3uo/edit?tab=t.0#heading=h.fwd10a41j1u4"
          target="_blank"
          rel="noopener noreferrer"
        >
          many EAG SF satellite events
        </a>
        . drop by during your time in SF!
      </div>

      <hr />

      <section>
        <h2>get a day pass</h2>

        <div
          style={{
            border: '2px solid var(--border-dark)',
            padding: '20px',
            background: 'var(--bg-secondary)',
            textAlign: 'center',
          }}
        >


          <div
            style={{
              fontSize: '3em',
              fontWeight: 'bold',
              margin: '10px 0',
            }}
          >
            {isFreePass ? 'FREE' : '$25'}
            {!isFreePass && (
              <span style={{ fontSize: '0.4em', fontWeight: 'normal' }}>/pass</span>
            )}
          </div>
          <div style={{ marginBottom: '5px', color: 'var(--text-secondary)' }}>
            full day access (9 AM &ndash; 11 PM)
          </div>
          <button
            onClick={handleCheckout}
            className="btn primary"
            style={{ padding: '12px 24px', fontSize: '1.1em', marginTop: '20px' }}
          >
            {isFreePass ? 'get free pass' : 'buy day pass'}
          </button>
        </div>

        <p className="muted" style={{ marginTop: '15px' }}>
          after purchase, you'll receive an email with an activation link. click
          the link on the day of your visit to get your door code.
        </p>
      </section>

      <hr />

      <section>
        <h2>location</h2>
        <p>
          <strong>1680 Mission St, San Francisco</strong>
          <br />
          <span className="muted">between 12th & 13th St</span>
        </p>
        <p className="muted">
          enter the door code on the keypad at the front door.
        </p>
      </section>

      <hr />

      <section>
        <h2>what's included</h2>
        <ul>
          <li>monitors & fast wifi</li>
          <li>coffee, tea & snacks</li>
          <li>meeting rooms</li>
          <li>member events</li>
        </ul>
      </section>

      <hr />

      <section>
        <h2>more about Mox</h2>
        <p>
          <Link href="/people">&rarr; see who's at Mox</Link>
        </p>
        <p>
          <Link href="/events">&rarr; upcoming events</Link>
        </p>
        <p>
          <Link href="https://lu.ma/mox" target="_blank" rel="noopener noreferrer">
            &rarr; EAG satellite events at Mox (lu.ma)
          </Link>
        </p>
        <p>
          <Link href="/membership">&rarr; membership info</Link>
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
