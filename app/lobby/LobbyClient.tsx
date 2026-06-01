'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Event } from '../lib/events'

const PACIFIC_TZ = 'America/Los_Angeles'

function formatEventDate(date: Date): string {
  const d = toZonedTime(date, PACIFIC_TZ)
  return format(d, 'EEE, MMM d')
}

function formatEventTime(date: Date, endDate?: Date): string {
  const d = toZonedTime(date, PACIFIC_TZ)
  const start = format(d, 'h:mm a').replace(':00', '')
  if (!endDate) return start
  const end = format(toZonedTime(endDate, PACIFIC_TZ), 'h:mm a').replace(':00', '')
  return `${start} – ${end}`
}

function formatClock(date: Date): string {
  return format(toZonedTime(date, PACIFIC_TZ), 'h:mm a')
}

function formatDay(date: Date): string {
  return format(toZonedTime(date, PACIFIC_TZ), 'EEEE, MMMM d')
}

function groupEventsByDate(events: Event[]): Array<{ date: Date; events: Event[] }> {
  const map = new Map<string, { date: Date; events: Event[] }>()
  for (const evt of events) {
    const key = format(toZonedTime(evt.startDate, PACIFIC_TZ), 'yyyy-MM-dd')
    if (!map.has(key)) {
      map.set(key, { date: evt.startDate, events: [] })
    }
    map.get(key)!.events.push(evt)
  }
  return Array.from(map.values())
}

interface Props {
  events: Event[]
}

export default function LobbyClient({ events: initialEvents }: Props) {
  const [now, setNow] = useState(new Date())
  const [events, setEvents] = useState(initialEvents)

  // Update clock every second
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(tick)
  }, [])

  // Refresh events every 5 minutes
  useEffect(() => {
    const refresh = setInterval(async () => {
      try {
        const res = await fetch('/lobby?_refresh=1', { cache: 'no-store' })
        if (res.ok) {
          // Full page reload to re-fetch server data
          window.location.reload()
        }
      } catch {
        // silent
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(refresh)
  }, [])

  const soonestEvent = events[0]
  const grouped = groupEventsByDate(events)

  return (
    <div
      className="lobby-root"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        background: '#0a1a14',
        fontFamily: 'var(--font-lora), Georgia, serif',
        position: 'relative',
      }}
    >
      {/* Full-bleed background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/mox_emerald.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          filter: 'brightness(0.35) saturate(1.4)',
          zIndex: 0,
        }}
      />

      {/* Subtle noise/grain overlay for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 30% 50%, rgba(16,78,53,0.18) 0%, transparent 70%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── LEFT PANEL (10/16 of width) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '62.5%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '4.5vh 5vw 4vh 5vw',
          borderRight: '1px solid rgba(120,190,140,0.18)',
        }}
      >
        {/* MOX wordmark + clock */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '5vh' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(3rem, 8vh, 7rem)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#d4ede2',
                lineHeight: 1,
                textShadow: '0 0 40px rgba(72,187,120,0.35)',
              }}
            >
              MOX
            </div>
            <div
              style={{
                fontFamily: 'var(--font-lora), Georgia, serif',
                fontSize: 'clamp(0.75rem, 1.6vh, 1.1rem)',
                letterSpacing: '0.28em',
                color: 'rgba(160,220,185,0.65)',
                textTransform: 'uppercase',
                marginTop: '0.3em',
              }}
            >
              San Francisco
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(1.6rem, 4vh, 3.2rem)',
                color: '#c8e8d8',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              {formatClock(now)}
            </div>
            <div
              style={{
                fontSize: 'clamp(0.7rem, 1.4vh, 0.95rem)',
                letterSpacing: '0.2em',
                color: 'rgba(160,220,185,0.5)',
                textTransform: 'uppercase',
                marginTop: '0.3em',
              }}
            >
              {formatDay(now)}
            </div>
          </div>
        </div>

        {/* Divider */}
        <GemDivider />

        {/* Upcoming Events heading */}
        <div
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(0.65rem, 1.3vh, 0.9rem)',
            letterSpacing: '0.35em',
            color: 'rgba(120,190,150,0.7)',
            textTransform: 'uppercase',
            marginBottom: '3vh',
            marginTop: '3vh',
          }}
        >
          Upcoming Events
        </div>

        {/* Event list */}
        <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '2vh' }}>
          {grouped.length === 0 ? (
            <div style={{ color: 'rgba(160,210,180,0.4)', fontSize: '1.1rem', fontStyle: 'italic' }}>
              No upcoming events found
            </div>
          ) : (
            grouped.map(({ date, events: dayEvents }) => (
              <div key={date.toISOString()}>
                {/* Date header */}
                <div
                  style={{
                    fontSize: 'clamp(0.6rem, 1.2vh, 0.8rem)',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'rgba(100,190,140,0.6)',
                    marginBottom: '0.8vh',
                    fontFamily: 'var(--font-lora)',
                  }}
                >
                  {formatEventDate(date)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
                  {dayEvents.map((evt) => (
                    <EventRow key={evt.id} event={evt} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom gem ornament */}
        <div style={{ marginTop: 'auto', paddingTop: '2vh' }}>
          <GemDivider />
        </div>
      </div>

      {/* ── RIGHT PANEL (6/16 of width) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '37.5%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4vh 3vw',
        }}
      >
        {soonestEvent ? (
          <PosterPanel event={soonestEvent} />
        ) : (
          <div
            style={{
              color: 'rgba(160,210,180,0.3)',
              fontSize: '1rem',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            No upcoming events
          </div>
        )}
      </div>
    </div>
  )
}

function EventRow({ event }: { event: Event }) {
  const typeColor =
    event.type === 'Public'
      ? 'rgba(72,187,120,0.9)'
      : event.type === 'Members'
        ? 'rgba(99,179,237,0.85)'
        : 'rgba(197,148,255,0.8)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '1.5vw',
        padding: '0.6vh 0',
        borderBottom: '1px solid rgba(100,170,130,0.1)',
      }}
    >
      {/* Gem bullet */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', paddingTop: '0.1em' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ opacity: 0.7 }}>
          <polygon points="5,0 10,4 5,10 0,4" fill={typeColor} />
        </svg>
      </div>

      {/* Time */}
      <div
        style={{
          flexShrink: 0,
          fontFamily: 'var(--font-lora)',
          fontSize: 'clamp(0.75rem, 1.55vh, 1rem)',
          color: 'rgba(180,230,200,0.7)',
          minWidth: '10ch',
          letterSpacing: '0.04em',
        }}
      >
        {formatEventTime(event.startDate, event.endDate)}
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 'clamp(0.9rem, 1.9vh, 1.25rem)',
          color: '#e8f5ee',
          fontWeight: 600,
          letterSpacing: '0.01em',
          lineHeight: 1.2,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {event.name}
      </div>

      {/* Host */}
      {event.host && (
        <div
          style={{
            flexShrink: 0,
            fontSize: 'clamp(0.6rem, 1.2vh, 0.78rem)',
            color: 'rgba(140,200,165,0.5)',
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            maxWidth: '16ch',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {event.host}
        </div>
      )}
    </div>
  )
}

function PosterPanel({ event }: { event: Event }) {
  const hasPoster = !!event.poster?.url
  const dateStr = formatEventDate(event.startDate)
  const timeStr = formatEventTime(event.startDate, event.endDate)

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5vh',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 'clamp(0.55rem, 1.1vh, 0.75rem)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'rgba(120,190,150,0.6)',
        }}
      >
        Next Event
      </div>

      {/* Poster image or fallback */}
      <div
        style={{
          width: '100%',
          aspectRatio: '3/4',
          maxHeight: '62vh',
          position: 'relative',
          borderRadius: '2px',
          overflow: 'hidden',
          border: '1px solid rgba(100,180,130,0.25)',
          boxShadow: '0 0 60px rgba(50,150,90,0.2), inset 0 0 30px rgba(0,0,0,0.4)',
        }}
      >
        {hasPoster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.poster!.url}
            alt={event.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <FallbackPoster event={event} />
        )}
      </div>

      {/* Event info below poster */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(0.95rem, 2vh, 1.4rem)',
            color: '#d8f0e4',
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: 1.3,
            marginBottom: '0.6vh',
          }}
        >
          {event.name}
        </div>
        <div
          style={{
            fontSize: 'clamp(0.65rem, 1.3vh, 0.88rem)',
            color: 'rgba(160,220,185,0.65)',
            letterSpacing: '0.12em',
          }}
        >
          {dateStr} · {timeStr}
        </div>
        {event.host && (
          <div
            style={{
              fontSize: 'clamp(0.6rem, 1.15vh, 0.78rem)',
              color: 'rgba(120,180,150,0.5)',
              fontStyle: 'italic',
              marginTop: '0.4vh',
              letterSpacing: '0.05em',
            }}
          >
            {event.host}
          </div>
        )}
      </div>
    </div>
  )
}

function FallbackPoster({ event }: { event: Event }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(160deg, #0a2218 0%, #0e3224 40%, #071a10 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8%',
        gap: '3vh',
      }}
    >
      {/* Gem icon */}
      <svg width="60" height="50" viewBox="0 0 60 50" style={{ opacity: 0.6 }}>
        <polygon points="30,2 58,18 58,32 30,48 2,32 2,18" fill="none" stroke="rgba(72,187,120,0.7)" strokeWidth="1.5" />
        <polygon points="30,2 58,18 30,28 2,18" fill="rgba(72,187,120,0.12)" stroke="rgba(72,187,120,0.5)" strokeWidth="0.8" />
        <polygon points="30,28 58,18 58,32 30,48" fill="rgba(72,187,120,0.07)" />
        <polygon points="30,28 30,48 2,32 2,18" fill="rgba(72,187,120,0.04)" />
        <line x1="2" y1="18" x2="58" y2="18" stroke="rgba(72,187,120,0.35)" strokeWidth="0.8" />
      </svg>

      <div
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 'clamp(1.1rem, 2.5vh, 1.8rem)',
          color: '#c8e8d8',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '0.03em',
          lineHeight: 1.3,
        }}
      >
        {event.name}
      </div>
    </div>
  )
}

function GemDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2vw', width: '100%' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(100,180,130,0.35))' }} />
      <svg width="12" height="10" viewBox="0 0 12 10">
        <polygon points="6,0 12,4 6,10 0,4" fill="rgba(72,187,120,0.55)" />
      </svg>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(100,180,130,0.35), transparent)' }} />
    </div>
  )
}
