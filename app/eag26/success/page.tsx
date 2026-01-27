'use client'

import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <>
      <Link href="/" className="back-link">
        &larr; back to home
      </Link>

      <h1>purchase complete!</h1>

      <p>
        thank you for your purchase. you'll receive an email shortly with
        activation link(s) for your pass(es).
      </p>

      <p>
        click the link on the day of your visit to get your door code.
      </p>

      <hr />

      <section>
        <h2>in the meantime</h2>
        <p>
          <button
            onClick={() => {
              window.location.href = 'https://buy.stripe.com/6oU14p2QU4k9cZNdOSbbG08'
            }}
            className="btn primary"
            style={{ marginBottom: '20px' }}
          >
            buy another pass
          </button>
        </p>
        <p>
          <Link href="/events">&rarr; check out upcoming events</Link>
        </p>
        <p>
          <Link
            href="https://lu.ma/mox"
            target="_blank"
            rel="noopener noreferrer"
          >
            &rarr; EAG satellite events at Mox
          </Link>
        </p>
        <p>
          <Link href="/people">&rarr; see who's at Mox</Link>
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
