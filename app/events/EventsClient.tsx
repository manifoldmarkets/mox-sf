'use client'
import { Event } from '@/app/lib/events'
import { useState } from 'react'
import Link from 'next/link'
import EventCard from './components/EventCard'
import WeeklyView from './components/WeeklyView'
import MonthlyView from './components/MonthlyView'
import { format } from 'date-fns'

interface EventsClientProps {
  initialEvents: Event[]
}

type ViewMode = 'list' | 'week' | 'month'

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarCopied, setCalendarCopied] = useState(false)

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://moxsf.com/api/events-cal')
    setCalendarCopied(true)
    setTimeout(() => setCalendarCopied(false), 4000)
  }

  const GOOGLE_CID =
    '6395b6c6ab85cf5ff3b6a1e59bc218ec592b74bfebf94821158bcf7e56c23ab1@group.calendar.google.com'
  const GOOGLE_CALENDAR_URL = `https://www.google.com/calendar/render?cid=${GOOGLE_CID}`
  const OUTLOOK_CALENDAR_URL = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent('webcal://moxsf.com/api/events-cal')}`
  const APPLE_CALENDAR_URL = `webcal://moxsf.com/api/events-cal`

  // Group events by date
  const groupedEvents: { date: Date; events: Event[] }[] = []
  let currentDate = ''

  initialEvents.forEach((event) => {
    const dateKey = format(event.startDate, 'yyyy-MM-dd')
    if (dateKey !== currentDate) {
      currentDate = dateKey
      groupedEvents.push({ date: event.startDate, events: [event] })
    } else {
      groupedEvents[groupedEvents.length - 1].events.push(event)
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-page-dark text-text-primary dark:text-text-primary-dark relative">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-background-page-dark border-b border-amber-900/20 dark:border-amber-800/20 lg:static lg:border-b-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-4 lg:py-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 hidden lg:block"></div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-amber-900 dark:text-amber-700 hover:text-amber-950 dark:hover:text-amber-600 text-sm font-medium font-sans"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Home
              </Link>

              {/* Mobile toggle */}
              <div className="sm:hidden inline-flex border border-amber-900 dark:border-amber-800 overflow-hidden flex-shrink-0 font-sans">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'list'
                      ? 'bg-amber-900 dark:bg-amber-900 text-white'
                      : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors border-x border-amber-900 dark:border-amber-800 ${
                    viewMode === 'week'
                      ? 'bg-amber-900 dark:bg-amber-900 text-white'
                      : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'month'
                      ? 'bg-amber-900 dark:bg-amber-900 text-white'
                      : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6">
        {/* Title and Toggle */}
        <div className="flex gap-4 mt-6 lg:mt-2 mb-2">
          <div className="flex-shrink-0 w-24 hidden lg:block"></div>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-700 font-display text-center sm:text-left">
              Upcoming Events
            </h1>

            {/* View toggle - desktop */}
            <div className="hidden sm:inline-flex border border-amber-900 dark:border-amber-800 overflow-hidden font-sans">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-amber-900 dark:bg-amber-900 text-white'
                    : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-x border-amber-900 dark:border-amber-800 ${
                  viewMode === 'week'
                    ? 'bg-amber-900 dark:bg-amber-900 text-white'
                    : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'month'
                    ? 'bg-amber-900 dark:bg-amber-900 text-white'
                    : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Sync link */}
        <div className="flex gap-4 mb-6">
          <div className="flex-shrink-0 w-24 hidden lg:block"></div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="text-sm text-amber-900 dark:text-amber-700 hover:text-amber-950 dark:hover:text-amber-600 underline decoration-dotted underline-offset-2 cursor-pointer"
            >
              Sync to your calendar
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' && (
          <div className="space-y-6 relative">
            {groupedEvents.map((group, index) => (
              <div key={`events-${format(group.date, 'yyyy-MM-dd')}-${index}`} className="flex gap-4">
                {/* Desktop date label */}
                <div className="flex-shrink-0 w-24 hidden lg:block">
                  <div className="sticky top-4 text-left">
                    <div className="font-bold text-amber-900 dark:text-amber-700 text-sm">
                      {format(group.date, 'EEEE')}
                    </div>
                    <div className="font-bold text-amber-900 dark:text-amber-700 text-xs">
                      {format(group.date, 'MMM d')}
                    </div>
                  </div>
                </div>

                {/* Events column */}
                <div className="flex-1 min-w-0">
                  {/* Mobile date header */}
                  <div className="lg:hidden mb-3 px-4">
                    <div className="font-bold text-amber-900 dark:text-amber-700 text-sm font-sans">
                      {format(group.date, 'EEEE, MMMM d')}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {initialEvents.length === 0 && (
              <p className="text-text-secondary dark:text-text-secondary-dark text-center py-8">
                No upcoming events
              </p>
            )}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 hidden lg:block"></div>
            <div className="flex-1 min-w-0">
              <WeeklyView events={initialEvents} />
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 hidden lg:block"></div>
            <div className="flex-1 min-w-0">
              <MonthlyView events={initialEvents} />
            </div>
          </div>
        )}
      </div>

      {/* Calendar Dialog */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setIsCalendarOpen(false)} />
          <div className="relative w-full max-w-sm bg-background-surface dark:bg-background-surface-dark p-6 shadow-xl">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              Sync events to your calendar
            </h2>

            <div className="space-y-3">
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-google hover:bg-google-hover transition-colors"
              >
                Google Calendar
              </a>

              <a
                href={OUTLOOK_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-outlook hover:bg-outlook-hover transition-colors"
              >
                Outlook Calendar
              </a>

              <a
                href={APPLE_CALENDAR_URL}
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-text-primary dark:bg-text-primary hover:bg-text-secondary dark:hover:bg-text-secondary transition-colors"
              >
                Apple Calendar
              </a>

              <button
                onClick={handleCopyUrl}
                className="cursor-pointer flex items-center justify-center w-full px-4 py-3 text-text-secondary dark:text-text-secondary-dark bg-background-subtle dark:bg-background-subtle-dark hover:bg-border-light dark:hover:bg-border-medium-dark transition-colors"
              >
                {calendarCopied ? 'Copied!' : 'Copy URL to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
