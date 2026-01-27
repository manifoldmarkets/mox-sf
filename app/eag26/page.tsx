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

        <p>full day access to Mox (9 AM &ndash; 11 PM).</p>

        <div style={{ margin: '20px 0' }}>
          <label>quantity:</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '8px',
            }}
          >
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{ width: '40px' }}
            >
              -
            </button>
            <span style={{ fontSize: '1.2em', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              style={{ width: '40px' }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{ margin: '20px 0' }}>
          <div className="pin-display">
            ${total}
            {quantity > 1 && (
              <span style={{ fontSize: '0.5em', fontWeight: 'normal', marginLeft: '10px' }}>
                ({quantity} &times; ${PRICE_PER_PASS})
              </span>
            )}
          </div>
        </div>

        <a
          href={buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn primary"
        >
          buy {quantity > 1 ? `${quantity} passes` : 'day pass'}
        </a>

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
