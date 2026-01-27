'use client'

import Link from 'next/link'

export default function DayPassPage() {
  const handleDayCheckout = () => {
    window.location.href = 'https://buy.stripe.com/00weVf3UY3g5f7V7qubbG02'
  }

  const handleHappyHourCheckout = () => {
    window.location.href = 'https://buy.stripe.com/dRm9AV636cQF8Jx26abbG03'
  }

  const handleWeekCheckout = () => {
    window.location.href = 'https://buy.stripe.com/5kQ7sNezC5od8JxcKObbG01'
  }

  return (
    <>
      <Link href="/" className="back-link">
        &larr; back to home
      </Link>

      <h1>day passes</h1>

      <p>drop in for a day, evening, or week.</p>

      <div className="alert info">
        know a member? you can visit for free as their guest.
      </div>

      <hr />

      <section>
        <h2>day pass</h2>

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
            $70
            <span style={{ fontSize: '0.4em', fontWeight: 'normal' }}>/pass</span>
          </div>

          <button
            onClick={handleDayCheckout}
            className="btn primary"
            style={{ padding: '12px 24px', fontSize: '1.1em', marginTop: '20px' }}
          >
            buy day pass
          </button>
        </div>

        <p className="muted" style={{ marginTop: '15px' }}>
          after purchase, you'll receive an email with an activation link.
        </p>
      </section>

      <hr />

      <section>
        <h2>happy hour pass</h2>

        <div
          style={{
            border: '2px solid var(--border-dark)',
            padding: '20px',
            background: 'var(--bg-secondary)',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '5px', color: 'var(--text-secondary)' }}>
            evening access (after 4 PM)
          </div>

          <div
            style={{
              fontSize: '3em',
              fontWeight: 'bold',
              margin: '10px 0',
            }}
          >
            $40
            <span style={{ fontSize: '0.4em', fontWeight: 'normal' }}>/pass</span>
          </div>

          <button
            onClick={handleHappyHourCheckout}
            className="btn primary"
            style={{ padding: '12px 24px', fontSize: '1.1em', marginTop: '20px' }}
          >
            buy happy hour pass
          </button>
        </div>

        <p className="muted" style={{ marginTop: '15px' }}>
          after purchase, you'll receive an email with an activation link.
        </p>
      </section>

      <hr />

      <section>
        <h2>week pass</h2>

        <div
          style={{
            border: '2px solid var(--border-dark)',
            padding: '20px',
            background: 'var(--bg-secondary)',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '5px', color: 'var(--text-secondary)' }}>
            7 days of access
          </div>

          <div
            style={{
              fontSize: '3em',
              fontWeight: 'bold',
              margin: '10px 0',
            }}
          >
            $250
            <span style={{ fontSize: '0.4em', fontWeight: 'normal' }}>/pass</span>
          </div>

          <button
            onClick={handleWeekCheckout}
            className="btn primary"
            style={{ padding: '12px 24px', fontSize: '1.1em', marginTop: '20px' }}
          >
            buy week pass
          </button>
        </div>

        <p className="muted" style={{ marginTop: '15px' }}>
          after purchase, you'll receive an email with an activation link.
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

      <p className="muted">
        questions? email us at{' '}
        <a href="mailto:team@moxsf.com">team@moxsf.com</a>
      </p>
    </>
  )
}
