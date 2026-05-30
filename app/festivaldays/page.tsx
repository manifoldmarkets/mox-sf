'use client'

import Link from 'next/link'
import { useState } from 'react'

function ScheduleDay({
  date,
  title,
  children,
}: {
  date: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontWeight: 'bold' }}>
        {date}
        {title ? <> &mdash; {title}</> : null}
      </div>
      <div style={{ marginTop: '6px' }}>{children}</div>
    </div>
  )
}

export default function FestivalDaysPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/festivaldays/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Failed to sign up. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Link href="/" className="back-link">
        &larr; back to home
      </Link>

      {/* HERO */}
      <h1>festival days at Mox</h1>

      <p>
        Festival-season coworking at Mox for <strong>LessOnline</strong> &amp;{' '}
        <strong>Manifest</strong> attendees &mdash; whether you fly in early,
        leave late, or just want to hang out more.
      </p>

      <p>
        <strong>Wed June 3 &ndash; Tue June 16, 2026.</strong> Standard hours 9
        AM &ndash; 11 PM; pass-holders welcome 24/7.
      </p>

      <hr />

      {/* EMAIL SIGNUP — the one live action for now */}
      <section>
        <h2>get updates</h2>

        <p>
          We&rsquo;re putting together coworking, carpools, dinners, and more
          for festival season. Drop your email and we&rsquo;ll be in touch with
          passes and details.
        </p>

        {submitted ? (
          <div className="alert success">
            You&rsquo;re on the list! We&rsquo;ll be in touch soon. &#x1F389;
          </div>
        ) : (
          <div
            style={{
              border: '2px solid var(--border-dark)',
              padding: '20px',
              background: 'var(--bg-secondary)',
            }}
          >
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              {error && (
                <div className="alert error" style={{ marginTop: '15px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="btn primary"
                style={{ width: '100%', marginTop: '15px' }}
              >
                {isSubmitting ? 'signing up...' : 'keep me posted'}
              </button>
            </form>
          </div>
        )}
      </section>

      <hr />

      {/* SCHEDULE */}
      <section>
        <h2>schedule</h2>

        <ScheduleDay
          date="ONGOING"
          title="All-you-can-eat festival coworking"
        >
          <p>
            Wed June 3 &ndash; Tue June 16. Standard entry 9 AM &ndash; 11 PM;
            welcome to stay 24/7.
          </p>
          <p className="muted" style={{ marginBottom: 0 }}>
            Location: Mox, 1680 Mission St, SF
            <br />
            $25/day w/ valid festival pass, or $100 for the full two weeks.
          </p>
        </ScheduleDay>

        <ScheduleDay date="WED JUNE 3" title="Mox Early Birds Bar Crawl">
          <p>
            6 PM The Crafty Fox &middot; 7:30 PM Standard Deviant &middot; 9 PM
            Zeitgeist
          </p>
          <p style={{ marginBottom: 0 }}>
            Kick off festival season with a casual early-bird drink.{' '}
            <span className="muted">Signups: to follow.</span>
          </p>
        </ScheduleDay>

        <ScheduleDay date="THU JUNE 4">
          <p>
            <strong>Free public coworking</strong>, 9 AM &ndash; 11 PM, Mox. Open
            to all, free.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Members Dinner</strong>, 6:30 PM, Mox &mdash; open to MF/LO
            ticketholders by RSVP. <span className="muted">Signups: to follow.</span>
          </p>
        </ScheduleDay>

        <ScheduleDay date="FRI JUNE 5">
          <p>
            <strong>Free public coworking</strong>, 9 AM &ndash; 11 PM, Mox. Open
            to all, free.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Mox &rarr; Lighthaven Carpool</strong>, 1:00 / 3:00 / 5:00
            PM, departs Mox.{' '}
            <span className="muted">Signups: moxsf.com/festivaldays</span>
          </p>
        </ScheduleDay>

        <ScheduleDay date="FRI JUNE 12">
          <p style={{ marginBottom: 0 }}>
            <strong>Mox &rarr; Lighthaven Carpool</strong>, 1:00 / 3:00 / 5:00
            PM, departs Mox.{' '}
            <span className="muted">Signups: moxsf.com/festivaldays</span>
          </p>
        </ScheduleDay>

        <ScheduleDay date="MON JUNE 15">
          <p>
            <strong>Festival Season Hangover Brunch</strong>, 9 AM &ndash; 3 PM,
            Mox. Pancakes? Mimosas?
          </p>
          <p>
            <strong>Free public coworking</strong>, 9 AM &ndash; 11 PM, Mox. Open
            to all, free.
          </p>
          <p>
            <strong>Mox Movie Night: Slumdog Millionaire</strong>, 8 PM, Mox
            &mdash; hosted by Jen. <span className="muted">Signups: to follow.</span>
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Post-Festival Archimedes Banya</strong>, 7&ndash;10 PM (last
            admit 9 PM), carpool from Mox 6:30 PM. 748 Innes Ave, SF 94124.
            Admission $67. <span className="muted">Signups: to follow.</span>
          </p>
        </ScheduleDay>
      </section>

      <hr />

      {/* LOCATION */}
      <section>
        <h2>location</h2>
        <p>
          <strong>1680 Mission St, San Francisco</strong>
          <br />
          <span className="muted">between 12th &amp; 13th St</span>
        </p>
        <p className="muted">
          Mox is a semipublic coworking space hosting AI-safety organizations
          and fellowships.
        </p>
      </section>

      <hr />

      {/* MORE */}
      <section>
        <h2>more about Mox</h2>
        <p>
          <Link href="/membership">&rarr; membership info</Link>
        </p>
        <p>
          <Link href="/events">&rarr; upcoming events</Link>
        </p>
        <p>
          <Link href="/discord">&rarr; join our discord</Link>
        </p>
      </section>

      <hr />

      <p className="muted">
        questions? email us at{' '}
        <a href="mailto:team@moxsf.com">team@moxsf.com</a>
      </p>

      {/*
        ===================================================================
        SECOND PASS — passes/pricing + access/door-code. Deferred for now;
        we're collecting interested emails (above) and showing the schedule
        until payment + access are wired up.
        ===================================================================

        PASSES / PRICING
          - $25 / day with a valid festival pass
          - $100 for the full two weeks
          - Free public days, open to all (no pass needed):
            Thu June 4, Fri June 5, Mon June 15
          - TODO(payment): choose Stripe Payment Link vs. Stripe Checkout.

        ACCESS / DOOR CODE
          - Pass-holders get a door code by email (mirror /eag26's flow).
          - Free public days: no pass or code needed.
          - TODO(door-access): not built yet.
        ===================================================================
      */}
    </>
  )
}
