'use client'

import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const categories = {
  ai: { label: 'AI Safety', className: 'blue' },
  vibes: { label: 'Vibestemics', className: 'purple' },
  research: { label: 'Research', className: 'green' },
  social: { label: 'Workshop', className: 'gold' },
} as const

type Category = keyof typeof categories

const events: Array<{
  id: string
  category: Category
  title: string
  date: string
  dayLabel: string
  time: string
  location: string
  listLocation: string
  speaker: string
  role: string
  description: string
  rsvp: string
}> = [
  {
    id: 'catastrophic-risk',
    category: 'ai',
    title: 'Modeling Catastrophic Risks from Advanced AI',
    date: '2025-07-08',
    dayLabel: 'Tuesday',
    time: '6:30 PM - 8:30 PM PT',
    location: 'The Yard, 156 2nd St, San Francisco, CA',
    listLocation: 'The Yard, San Francisco, CA',
    speaker: 'Eliot Kreuger',
    role: 'AI Safety Researcher',
    description:
      "We'll explore how we model and reason about catastrophic risks from advanced AI systems. Topics include threat modeling frameworks, uncertainty, and decision-making under deep uncertainty.",
    rsvp: 'https://partiful.com/e/mox-summer-ai-safety',
  },
  {
    id: 'vibestemics',
    category: 'vibes',
    title: 'Vibestemics: Designing Better Online Communities',
    date: '2025-07-12',
    dayLabel: 'Saturday',
    time: '4:00 PM - 6:00 PM PT',
    location: 'The Commons, Berkeley, CA',
    listLocation: 'The Commons, Berkeley, CA',
    speaker: 'Mira Shah',
    role: 'Community Systems Designer',
    description:
      'A practical salon on social technology, trust loops, and the small design choices that help communities become more thoughtful over time.',
    rsvp: 'https://partiful.com/e/mox-summer-vibestemics',
  },
  {
    id: 'frontier-models',
    category: 'research',
    title: 'Frontier Models: Where Scaling Meets Reasoning',
    date: '2025-07-16',
    dayLabel: 'Wednesday',
    time: '7:00 PM - 9:00 PM PT',
    location: 'Online, Zoom',
    listLocation: 'Online, Zoom',
    speaker: 'Noah Vale',
    role: 'Frontier AI Researcher',
    description:
      'A technical talk on the changing relationship between scale, reasoning, tool use, and evaluation in frontier model development.',
    rsvp: 'https://partiful.com/e/mox-summer-frontier-models',
  },
  {
    id: 'journal-club',
    category: 'ai',
    title: 'AI Safety Journal Club',
    date: '2025-07-20',
    dayLabel: 'Sunday',
    time: '11:00 AM - 1:00 PM PT',
    location: 'The Yard, San Francisco, CA',
    listLocation: 'The Yard, San Francisco, CA',
    speaker: 'Ada Lin',
    role: 'Research Program Lead',
    description:
      'A close read of recent papers in alignment, oversight, and evals, followed by structured discussion over lunch.',
    rsvp: 'https://partiful.com/e/mox-summer-journal-club',
  },
  {
    id: 'coordination',
    category: 'vibes',
    title: 'Social Technology and Coordination Problems',
    date: '2025-07-24',
    dayLabel: 'Thursday',
    time: '6:30 PM - 8:30 PM PT',
    location: 'The Commons, Berkeley, CA',
    listLocation: 'The Commons, Berkeley, CA',
    speaker: 'Theo Park',
    role: 'Coordination Researcher',
    description:
      'A discussion of mechanisms, rituals, and lightweight institutions that help groups coordinate without losing texture or agency.',
    rsvp: 'https://partiful.com/e/mox-summer-coordination',
  },
  {
    id: 'research-lightning',
    category: 'research',
    title: 'Research Lightning Talks',
    date: '2025-07-28',
    dayLabel: 'Monday',
    time: '7:00 PM - 9:00 PM PT',
    location: 'Online, Zoom',
    listLocation: 'Online, Zoom',
    speaker: 'Mox Fellows',
    role: 'Summer Research Cohort',
    description:
      'Short, high-signal presentations from researchers working across AI safety, cognition, governance, and community design.',
    rsvp: 'https://partiful.com/e/mox-summer-lightning',
  },
  {
    id: 'prioritization',
    category: 'social',
    title: 'Cause Prioritization Workshop',
    date: '2025-08-02',
    dayLabel: 'Saturday',
    time: '2:00 PM - 5:00 PM PT',
    location: 'The Yard, San Francisco, CA',
    listLocation: 'The Yard, San Francisco, CA',
    speaker: 'Jon Bell',
    role: 'Strategy Facilitator',
    description:
      'A hands-on workshop for comparing problems, assumptions, neglectedness, tractability, and personal fit.',
    rsvp: 'https://partiful.com/e/mox-summer-prioritization',
  },
  {
    id: 'summer-social',
    category: 'social',
    title: 'Mox Summer Social',
    date: '2025-08-08',
    dayLabel: 'Friday',
    time: '6:00 PM - 9:00 PM PT',
    location: 'TBA, San Francisco, CA',
    listLocation: 'TBA, San Francisco, CA',
    speaker: 'Mox Community',
    role: 'Hosts',
    description:
      'An open social for the season: new friends, old collaborators, and a room full of people who like unusually good questions.',
    rsvp: 'https://partiful.com/e/mox-summer-social',
  },
  {
    id: 'long-view',
    category: 'research',
    title: 'The Long View: Futures Worth Building',
    date: '2025-08-15',
    dayLabel: 'Friday',
    time: '6:30 PM - 8:30 PM PT',
    location: 'Online, Zoom',
    listLocation: 'Online, Zoom',
    speaker: 'Leah Morgan',
    role: 'Futures Researcher',
    description:
      'A talk on positive visions, civilizational steering, and the discipline of making long-term thinking concrete enough to build with.',
    rsvp: 'https://partiful.com/e/mox-summer-long-view',
  },
  {
    id: 'wrap',
    category: 'social',
    title: "Season Wrap: Ideas, Reflections, and What's Next",
    date: '2025-08-22',
    dayLabel: 'Friday',
    time: '6:30 PM - 9:00 PM PT',
    location: 'The Commons, Berkeley, CA',
    listLocation: 'The Commons, Berkeley, CA',
    speaker: 'Mox Team',
    role: 'Season Hosts',
    description:
      'A closing session to reflect on the season, trade notes, and turn promising conversations into next steps.',
    rsvp: 'https://partiful.com/e/mox-summer-wrap',
  },
]

const channelRows: Record<Category, number> = {
  ai: 0,
  vibes: 1,
  research: 2,
  social: 3,
}

function formatMonth(dateString: string) {
  return new Date(`${dateString}T12:00:00`)
    .toLocaleDateString('en-US', {
      month: 'short',
    })
    .toUpperCase()
}

function formatDay(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    day: '2-digit',
  })
}

function formatLongDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function toIcsDate(dateString: string, timeRange: string) {
  const startHour = timeRange.includes('11:00 AM')
    ? '110000'
    : timeRange.includes('2:00 PM')
      ? '140000'
      : timeRange.includes('4:00 PM')
        ? '160000'
        : timeRange.includes('6:00 PM')
          ? '180000'
          : timeRange.includes('6:30 PM')
            ? '183000'
            : '190000'
  const endHour = timeRange.includes('1:00 PM')
    ? '130000'
    : timeRange.includes('5:00 PM')
      ? '170000'
      : timeRange.includes('6:00 PM')
        ? '180000'
        : timeRange.includes('8:30 PM')
          ? '203000'
          : '210000'

  return {
    start: `${dateString.replaceAll('-', '')}T${startHour}`,
    end: `${dateString.replaceAll('-', '')}T${endHour}`,
  }
}

function escapeIcs(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
    .replaceAll('\n', '\\n')
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2v3M17 2v3M3.5 9h17M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5Z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.1 6-11a6 6 0 0 0-12 0c0 5.9 6 11 6 11Z" />
      <path d="M12 12.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
    </svg>
  )
}

export default function FestivalDaysPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [selectedId, setSelectedId] = useState(events[0].id)
  const [detailHidden, setDetailHidden] = useState(false)
  const [toast, setToast] = useState('')
  const [email, setEmail] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const seaRef = useRef<HTMLImageElement>(null)
  const sunRef = useRef<HTMLImageElement>(null)
  const branchesRef = useRef<HTMLImageElement>(null)

  const visibleEvents = useMemo(
    () =>
      activeCategory === 'all'
        ? events
        : events.filter((event) => event.category === activeCategory),
    [activeCategory]
  )

  const selectedEvent =
    visibleEvents.find((event) => event.id === selectedId) ||
    visibleEvents[0] ||
    events[0]
  const selectedCategory = categories[selectedEvent.category]

  useEffect(() => {
    if (!visibleEvents.some((event) => event.id === selectedId)) {
      setSelectedId(visibleEvents[0]?.id || events[0].id)
    }
  }, [selectedId, visibleEvents])

  useEffect(() => {
    const hero = heroRef.current
    const layers = [
      { el: seaRef.current, speed: 0.08 },
      { el: sunRef.current, speed: -0.11 },
      { el: branchesRef.current, speed: 0.16 },
    ]

    if (!hero || layers.some(({ el }) => !el)) return

    let frame = 0
    const updateParallax = () => {
      if (window.innerWidth <= 980) {
        layers.forEach(({ el }) => {
          if (el) el.style.transform = ''
        })
        return
      }

      const rect = hero.getBoundingClientRect()
      const progress = Math.max(
        -1,
        Math.min(
          1,
          (window.innerHeight * 0.5 - rect.top) / Math.max(rect.height, 1)
        )
      )

      layers.forEach(({ el, speed }) => {
        if (!el) return
        const y = progress * speed * 46
        const x = progress * speed * 10
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })
    }

    const requestUpdate = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        updateParallax()
      })
    }

    updateParallax()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const chooseCategory = (category: Category) => {
    setActiveCategory(category)
    setDetailHidden(false)
  }

  const downloadIcs = () => {
    const body = events
      .map((event) => {
        const times = toIcsDate(event.date, event.time)
        return [
          'BEGIN:VEVENT',
          `UID:${event.id}@mox-summer-season`,
          `DTSTAMP:${new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}/, '')}`,
          `DTSTART;TZID=America/Los_Angeles:${times.start}`,
          `DTEND;TZID=America/Los_Angeles:${times.end}`,
          `SUMMARY:${escapeIcs(event.title)}`,
          `LOCATION:${escapeIcs(event.location)}`,
          `DESCRIPTION:${escapeIcs(`${event.description} RSVP: ${event.rsvp}`)}`,
          'END:VEVENT',
        ].join('\r\n')
      })
      .join('\r\n')
    const calendar = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Mox//Summer Season//EN\r\nCALSCALE:GREGORIAN\r\n${body}\r\nEND:VCALENDAR`
    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mox-summer-season.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyCalendarLink = async () => {
    const url = window.location.href.split('#')[0]
    try {
      await navigator.clipboard.writeText(url)
      setToast('Calendar link copied')
    } catch {
      setToast(url)
    }
  }

  const submitSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormMessage('')
    setFormError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/festivaldays/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()

      if (!response.ok) {
        setFormError(result.error || 'Something went wrong. Please try again.')
        return
      }

      setEmail('')
      setFormMessage(
        "You're on the list. We'll send Summer Season updates soon."
      )
    } catch {
      setFormError('Failed to sign up. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="hero">
        <nav className="topbar" aria-label="Primary">
          <a className="brand" href="#top" aria-label="Mox Summer Season home">
            Mox
          </a>
          <div className="nav-links">
            <a href="#events">Events</a>
            <a href="#calendar">Calendar</a>
            <a href="#about">About</a>
          </div>
        </nav>

        <section className="hero-grid" id="top" ref={heroRef}>
          <div className="hero-copy">
            <h1>
              Mox
              <br />
              Summer
              <br />
              Season
            </h1>
            <p className="intro">
              A season of talks, discussions, and social events at the frontier
              of ideas. Come for the ideas. Stay for the people.
            </p>
            <div className="hero-actions">
              <span className="season-date">July - August 2025</span>
              <button
                className="primary-action"
                type="button"
                onClick={downloadIcs}
              >
                <span aria-hidden="true">
                  <CalendarIcon />
                </span>
                Add to your calendar
              </button>
            </div>
          </div>
          <figure
            className="hero-art"
            aria-label="Watercolor coast with boats, summer sun, and leafy branch"
          >
            <img
              className="hero-layer hero-sea"
              src="/summerseason/assets/hero-sea.png?v=6"
              alt=""
              ref={seaRef}
            />
            <img
              className="hero-layer hero-sun"
              src="/summerseason/assets/hero-sun.png?v=6"
              alt=""
              ref={sunRef}
            />
            <img
              className="hero-layer hero-branches"
              src="/summerseason/assets/hero-branches.png?v=6"
              alt=""
              ref={branchesRef}
            />
          </figure>
        </section>
      </header>

      <main>
        <section
          className="channel-band tv-stage"
          id="events"
          aria-labelledby="channels-title"
        >
          <div
            className="tv-wrap custom-tv"
            aria-label="Mox Summer Season event television"
            style={
              activeCategory === 'all'
                ? undefined
                : ({
                    '--pointer-row': channelRows[activeCategory],
                  } as CSSProperties)
            }
          >
            <div className="tv-cabinet">
              <div className="tv-screen">
                <div className="tv-scanlines" aria-hidden="true" />
                <div className="tv-screen-inner">
                  <div className="tv-screen-top">
                    <div>
                      <p className="tv-kicker">Mox Summer Season</p>
                      <h2 id="channels-title">Event Calendar</h2>
                    </div>
                    <div
                      className="tv-controls"
                      aria-label="Filter by category"
                    >
                      {Object.entries(categories).map(([key, category]) => (
                        <button
                          className={`channel-button ${category.className}${activeCategory === key ? ' is-active' : ''}`}
                          type="button"
                          key={key}
                          onClick={() => chooseCategory(key as Category)}
                        >
                          <span>
                            0{Object.keys(categories).indexOf(key) + 1}
                          </span>{' '}
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="tv-content">
                    <div className="calendar-column" id="calendar">
                      <div className="section-title">
                        <span />
                        <h2 id="events-title">Tuned Events</h2>
                        <span />
                      </div>
                      <div
                        className="event-list"
                        role="list"
                        aria-live="polite"
                      >
                        {visibleEvents.map((event) => {
                          const category = categories[event.category]
                          return (
                            <button
                              type="button"
                              className={`event-row${event.id === selectedEvent.id ? ' is-selected' : ''}`}
                              key={event.id}
                              role="listitem"
                              onClick={() => {
                                setSelectedId(event.id)
                                setDetailHidden(false)
                              }}
                            >
                              <span className="event-date">
                                <span>{formatMonth(event.date)}</span>
                                <span>{formatDay(event.date)}</span>
                              </span>
                              <span className="event-summary">
                                <span className="event-time">
                                  {event.dayLabel.slice(0, 3)} {event.time}
                                </span>
                                <span className="event-name">
                                  {event.title}
                                </span>
                                <span className="event-place">
                                  {event.listLocation}
                                </span>
                              </span>
                              <span className={`tag ${category.className}`}>
                                {category.label}
                              </span>
                              <span aria-hidden="true">&gt;</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <aside
                      className={`detail-panel${detailHidden ? ' is-hidden' : ''}`}
                      aria-live="polite"
                    >
                      <button
                        className="close-detail"
                        type="button"
                        aria-label="Close event details"
                        onClick={() => setDetailHidden(true)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                      <span
                        className={`detail-badge ${selectedCategory.className}`}
                      >
                        {selectedCategory.label}
                      </span>
                      <h2 className="detail-title">{selectedEvent.title}</h2>
                      <dl className="detail-meta">
                        <div>
                          <dt>
                            <CalendarIcon />
                          </dt>
                          <dd className="detail-date">
                            {selectedEvent.dayLabel},{' '}
                            {formatLongDate(selectedEvent.date)} -{' '}
                            {selectedEvent.time}
                          </dd>
                        </div>
                        <div>
                          <dt>
                            <LocationIcon />
                          </dt>
                          <dd className="detail-location">
                            {selectedEvent.location}
                          </dd>
                        </div>
                      </dl>
                      <p className="eyebrow">Speaker</p>
                      <div className="speaker">
                        <div className="speaker-avatar" />
                        <div>
                          <strong className="speaker-name">
                            {selectedEvent.speaker}
                          </strong>
                          <span className="speaker-role">
                            {selectedEvent.role}
                          </span>
                        </div>
                      </div>
                      <p className="eyebrow">About this event</p>
                      <p className="detail-description">
                        {selectedEvent.description}
                      </p>
                      <a
                        className="primary-action rsvp-link"
                        href={selectedEvent.rsvp}
                        target="_blank"
                        rel="noreferrer"
                      >
                        RSVP on Partiful
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M7 17 17 7M9 7h8v8M5 5h7M5 5v14h14v-7" />
                        </svg>
                      </a>
                    </aside>
                  </div>
                </div>
              </div>

              <div className="tv-dial-rail" aria-label="Channel dial filters">
                {Object.keys(categories).map((key, index) => (
                  <button
                    className="dial-button"
                    type="button"
                    key={key}
                    onClick={() => chooseCategory(key as Category)}
                    aria-label={`Dial ${index + 1}: filter by ${categories[key as Category].label}`}
                  >
                    <span>0{index + 1}</span>
                  </button>
                ))}
                <div className="tv-speaker-grille" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="about-section" id="about" aria-label="About Mox">
          <p className="eyebrow">What is Mox?</p>
          <div>
            <h2>A community for frontier conversations.</h2>
            <p>
              Mox is an intellectual community at the frontier of AI,
              rationality, and ideas that matter. We gather to learn together,
              challenge each other, and build what&apos;s next.
            </p>
          </div>
        </section>

        <section className="signup-card" aria-labelledby="signup-title">
          <div>
            <p className="eyebrow">Stay in the loop</p>
            <h2 id="signup-title">Get Summer Season updates.</h2>
          </div>
          <form onSubmit={submitSignup}>
            <label htmlFor="festival-email">Email</label>
            <div className="signup-row">
              <input
                id="festival-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
              <button
                className="primary-action"
                type="submit"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? 'Signing up...' : 'Keep me posted'}
              </button>
            </div>
            {formMessage ? (
              <p className="form-status success">{formMessage}</p>
            ) : null}
            {formError ? (
              <p className="form-status error">{formError}</p>
            ) : null}
          </form>
        </section>

        <section
          className="subscribe-bar"
          aria-label="Add the Mox Summer Season calendar"
        >
          <h2>Add the Mox Summer Season Calendar</h2>
          <p>Subscribe to get all Summer Season events in your calendar app.</p>
          <button
            className="primary-action"
            type="button"
            onClick={downloadIcs}
          >
            <span aria-hidden="true">G</span>
            Add to Google Calendar
          </button>
          <button
            className="secondary-action"
            type="button"
            onClick={copyCalendarLink}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
              <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
            </svg>
            Copy calendar link
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <strong>MOX</strong>
        <span>
          Intellectual community at the frontier of AI, rationality, and ideas
          that matter.
        </span>
        <a href="https://x.com/moxcommunity" target="_blank" rel="noreferrer">
          @moxcommunity
        </a>
      </footer>

      {toast ? <div className="toast">{toast}</div> : null}
    </>
  )
}
