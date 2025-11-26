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

type FilterMode = 'featured' | 'unique' | 'all'

export default function HistoryClient({ initialEvents }: HistoryClientProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('featured')
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const [showStickyToggle, setShowStickyToggle] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const horizontalToggleRef = useRef<HTMLDivElement>(null)

  // Filter events based on mode
  let filteredEvents = initialEvents
  if (filterMode === 'featured') {
    filteredEvents = initialEvents.filter(event => event.featured)
  } else if (filterMode === 'unique') {
    // Show all featured events, plus non-recurring events
    filteredEvents = initialEvents.filter(event =>
      event.featured || !event.status?.toLowerCase().includes('recurring')
    )
  }
  // 'all' mode shows everything, no filtering needed

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
  }, [filterMode])

  // Observe horizontal toggle visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Show sticky toggle when horizontal toggle is NOT in view
        setShowStickyToggle(!entries[0].isIntersecting)
      },
      { threshold: 0 }
    )

    if (horizontalToggleRef.current) {
      observer.observe(horizontalToggleRef.current)
    }

    return () => observer.disconnect()
  }, [])

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
    <div className="min-h-screen bg-slate-50 dark:bg-background-page-dark text-text-primary dark:text-text-primary-dark relative">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-background-page-dark border-b border-amber-900/20 dark:border-amber-800/20 lg:static lg:border-b-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-4 lg:py-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 hidden lg:block"></div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-amber-900 dark:text-amber-700 hover:text-amber-950 dark:hover:text-amber-600 text-sm font-medium font-sans"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Upcoming Events
              </Link>

              {/* Mobile toggle - hidden on desktop */}
              <div className="sm:hidden inline-flex border border-amber-900 dark:border-amber-800 overflow-hidden flex-shrink-0 font-sans">
                <button
                  onClick={() => setFilterMode('featured')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterMode === 'featured'
                      ? 'bg-amber-900 dark:bg-amber-900 text-white'
                      : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700'
                  }`}
                >
                  Featured
                </button>
                <button
                  onClick={() => setFilterMode('unique')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors border-x border-amber-900 dark:border-amber-800 ${
                    filterMode === 'unique'
                      ? 'bg-amber-900 dark:bg-amber-900 text-white'
                      : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700'
                  }`}
                >
                  Unique
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterMode === 'all'
                      ? 'bg-amber-900 dark:bg-amber-900 text-white'
                      : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6">
        {/* Title and Toggle */}
        <div className="flex gap-4 mt-6 lg:mt-2 mb-6">
          <div className="flex-shrink-0 w-24 hidden lg:block"></div>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
            <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-700 font-display text-center sm:text-left">
              Past Events
            </h1>

            {/* 3-way toggle - desktop only */}
            <div ref={horizontalToggleRef} className="hidden sm:inline-flex border border-amber-900 dark:border-amber-800 overflow-hidden font-sans">
              <button
                onClick={() => setFilterMode('featured')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  filterMode === 'featured'
                    ? 'bg-amber-900 dark:bg-amber-900 text-white'
                    : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setFilterMode('unique')}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-x border-amber-900 dark:border-amber-800 ${
                  filterMode === 'unique'
                    ? 'bg-amber-900 dark:bg-amber-900 text-white'
                    : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                }`}
              >
                Unique
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  filterMode === 'all'
                    ? 'bg-amber-900 dark:bg-amber-900 text-white'
                    : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

            {/* Events */}
            <div className="space-y-6 relative">
              {/* Sticky vertical toggle - desktop only, positioned to the right */}
              <div className={`hidden lg:block sticky top-4 float-right -mr-28 z-20 transition-opacity duration-200 ${showStickyToggle ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col border border-amber-900 dark:border-amber-800 overflow-hidden font-sans">
                  <button
                    onClick={() => setFilterMode('featured')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      filterMode === 'featured'
                        ? 'bg-amber-900 dark:bg-amber-900 text-white'
                        : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                    }`}
                  >
                    Featured
                  </button>
                  <button
                    onClick={() => setFilterMode('unique')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors border-y border-amber-900 dark:border-amber-800 ${
                      filterMode === 'unique'
                        ? 'bg-amber-900 dark:bg-amber-900 text-white'
                        : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                    }`}
                  >
                    Unique
                  </button>
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      filterMode === 'all'
                        ? 'bg-amber-900 dark:bg-amber-900 text-white'
                        : 'bg-background-surface dark:bg-background-surface-dark text-amber-900 dark:text-amber-700 hover:bg-amber-50 dark:hover:bg-background-subtle-dark'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>

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
