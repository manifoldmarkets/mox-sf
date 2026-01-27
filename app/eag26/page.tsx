'use client'

import { useState } from 'react'
import Link from 'next/link'

const STRIPE_LINK = 'https://buy.stripe.com/EAG_PLACEHOLDER_EAG26'
const PRICE_PER_PASS = 25

export default function EAG26DayPassPage() {
  const [quantity, setQuantity] = useState(1)

  const total = quantity * PRICE_PER_PASS
  const buyUrl = `${STRIPE_LINK}?quantity=${quantity}`

  return (
    <>
      <Link href="/" className="back-link">
        &larr; back to home
      </Link>

      <h1>EAG day pass</h1>

      <p>
        special rate for EAG 2026 attendees. drop by Mox during your time in SF!
      </p>

      <div className="alert info">
        <strong>Feb 9 &mdash; Feb 20</strong>
        <br />
        Mox is a semipublic coworking space hosting AI safety organizations and
        fellowships, and a host to many EAG SF satellite events.
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
          <div style={{ marginBottom: '5px', color: 'var(--text-secondary)' }}>
            full day access (9 AM &ndash; 11 PM)
          </div>

          <div
            style={{
              fontSize: '3em',
              fontWeight: 'bold',
              margin: '10px 0',
            }}
          >
            ${PRICE_PER_PASS}
            <span style={{ fontSize: '0.4em', fontWeight: 'normal' }}>/pass</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              margin: '20px 0',
            }}
          >
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{ width: '44px', height: '44px', fontSize: '1.2em' }}
            >
              &minus;
            </button>
            <span style={{ fontSize: '1.5em', fontWeight: 'bold', minWidth: '40px' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              style={{ width: '44px', height: '44px', fontSize: '1.2em' }}
            >
              +
            </button>
          </div>

          {quantity > 1 && (
            <div style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
              {quantity} passes &times; ${PRICE_PER_PASS} = <strong>${total}</strong>
            </div>
          )}

          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
            style={{ padding: '12px 24px', fontSize: '1.1em' }}
          >
            buy {quantity > 1 ? `${quantity} passes` : 'day pass'} {quantity > 1 ? `— $${total}` : ''}
          </a>
        </div>

        <p className="muted" style={{ marginTop: '15px' }}>
          after purchase, you'll receive an email with activation link(s). click
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
