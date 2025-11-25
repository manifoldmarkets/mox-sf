'use client'
import { Event } from '@/app/lib/events'
import PastEventCard from './PastEventCard'
import { format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'

interface PastEventsListProps {
  events: Event[]
}

const ITEMS_PER_PAGE = 20

export default function PastEventsList({ events }: PastEventsListProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => {
            if (prev < events.length) {
              return Math.min(prev + ITEMS_PER_PAGE, events.length)
            }
            return prev
          })
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [events.length])

  // Reset display count when events change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [events])

  if (events.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-background-surface dark:bg-background-surface-dark border border-amber-900 dark:border-amber-800 p-8 text-center">
          <p className="text-text-muted dark:text-text-muted-dark">
            No past events to display
          </p>
        </div>
      </div>
    )
  }

  // Group events by month/year
  const visibleEvents = events.slice(0, displayCount)
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
    <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {groupedEvents.map((group, index) => (
            <div key={`events-${group.monthYear}-${index}`} className="flex gap-4">
              {/* Left sidebar with month/year - each month group has its own sticky label */}
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
                {/* Mobile month/year header */}
                <div className="lg:hidden mb-2">
                  <div className="font-bold text-amber-900 dark:text-amber-700 text-sm">
                    {format(group.events[0].startDate, 'MMMM yyyy')}
                  </div>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {group.events.map((event) => (
                    <PastEventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Intersection observer trigger */}
      {displayCount < events.length && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-4">
          <p className="text-text-muted dark:text-text-muted-dark text-sm">
            Loading more events...
          </p>
        </div>
      )}
    </div>
  )
}
