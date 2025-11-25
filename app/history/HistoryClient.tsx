'use client'
import { Event } from '@/app/lib/events'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import PastEventCard from './components/PastEventCard'
import { format } from 'date-fns'

interface HistoryClientProps {
  initialEvents: Event[]
}

const ITEMS_PER_PAGE = 20

export default function HistoryClient({ initialEvents }: HistoryClientProps) {
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filter events
  const filteredEvents = showFeaturedOnly
    ? initialEvents.filter(event => event.featured)
    : initialEvents

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredEvents.length) {
          setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredEvents.length))
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [displayCount, filteredEvents.length])

  // Reset display count when filter changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [showFeaturedOnly])

  // Group events by month
  const visibleEvents = filteredEvents.slice(0, displayCount)
  const groupedEvents: { monthYear: string; events: Event[] }[] = []
  let currentMonthYear = ''

  visibleEvents.forEach((event) => {
    const monthYear = format(event.startDate, 'MMMM yyyy')
    if (monthYear !== currentMonthYear) {
      currentMonthYear = monthYear
      groupedEvents.push({ monthYear, events: [event] })
    } else {
      groupedEvents[groupedEvents.length - 1].events.push(event)
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-page-dark text-text-primary dark:text-text-primary-dark">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-background-page-dark border-b border-amber-900/20 dark:border-amber-800/20 lg:static lg:border-b-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 hidden lg:block"></div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-amber-900 dark:text-amber-700 hover:text-amber-950 dark:hover:text-amber-600 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Upcoming Events
              </Link>

              {/* Mobile featured toggle - hidden on desktop */}
              <button
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className="flex lg:hidden items-center gap-2 cursor-pointer text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors flex-shrink-0"
                role="switch"
                aria-checked={showFeaturedOnly}
              >
                <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Featured only</span>
                <div className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center transition-colors ${showFeaturedOnly ? 'bg-amber-900 dark:bg-amber-900' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <span className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform bg-white transition-transform ${showFeaturedOnly ? 'translate-x-[1.125rem] sm:translate-x-[1.375rem]' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6">
        {/* Title */}
        <div className="flex gap-4 mt-6 lg:mt-2 mb-12 lg:mb-2">
          <div className="flex-shrink-0 w-24 hidden lg:block"></div>
          <div className="flex-1 min-w-0 lg:flex lg:items-end lg:justify-between">
            <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-3">
              <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-700 font-display text-center lg:text-left">
                Past Events
              </h1>
              <p className="text-text-secondary dark:text-text-secondary-dark text-sm text-center lg:text-left mt-2 lg:mt-0">
                <em>
                  <b>
                    {initialEvents.length}
                  </b>{' '}
                  so far (that we know of!)
                </em>
              </p>
            </div>

            {/* Desktop featured toggle - hidden on mobile */}
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className="hidden lg:flex items-center gap-2 cursor-pointer text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors flex-shrink-0"
              role="switch"
              aria-checked={showFeaturedOnly}
            >
              <span className="text-sm font-semibold whitespace-nowrap">Featured only</span>
              <div className={`relative inline-flex h-6 w-11 items-center transition-colors ${showFeaturedOnly ? 'bg-amber-900 dark:bg-amber-900' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <span className={`inline-block h-5 w-5 transform bg-white transition-transform ${showFeaturedOnly ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Events */}
        <div className="space-y-6">
          {groupedEvents.map((group, index) => (
            <div key={`events-${group.monthYear}-${index}`} className="flex gap-4">
              {/* Desktop month label */}
              <div className="flex-shrink-0 w-24 hidden lg:block">
                <div className="sticky top-4 text-left">
                  <div className="font-bold text-amber-900 dark:text-amber-700 text-sm">
                    {format(group.events[0].startDate, 'MMMM')}
                  </div>
                  <div className="font-bold text-amber-900 dark:text-amber-700 text-xs">
                    {format(group.events[0].startDate, 'yyyy')}
                  </div>
                </div>
              </div>

              {/* Events column */}
              <div className="flex-1 min-w-0">
                {/* Mobile month popover */}
                <div className="lg:hidden sticky top-15 z-[5] flex justify-center mb-4 pointer-events-none">
                  <div className="bg-background-surface dark:bg-background-surface-dark border border-amber-900 dark:border-amber-800 px-4 py-2 shadow-lg">
                    <div className="font-sans font-bold text-amber-900 dark:text-amber-700 text-sm">
                      {format(group.events[0].startDate, 'MMMM yyyy')}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {group.events.map((event) => (
                    <PastEventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more trigger */}
        {displayCount < filteredEvents.length && (
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-4">
            <p className="text-text-muted dark:text-text-muted-dark text-sm">
              Loading more events...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
