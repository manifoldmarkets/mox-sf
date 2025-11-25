'use client'
import { Event } from '@/app/lib/events'
import { format } from 'date-fns'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

interface PastEventCardProps {
  event: Event
}

export default function PastEventCard({ event }: PastEventCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)
  const [actualPosterHeight, setActualPosterHeight] = useState(0)

  const month = format(event.startDate, 'MMM')
  const day = format(event.startDate, 'd')
  const formattedDate = format(event.startDate, 'MMMM d, yyyy')

  // Check if event is recurring
  const isRecurring = event.type?.toLowerCase().includes('recurring')
  const titleColorClass = isRecurring
    ? 'text-text-secondary dark:text-text-secondary-dark'
    : 'text-text-primary dark:text-text-primary-dark'

  // Validate URL
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  const hasValidUrl = isValidUrl(event.url)

  // Measure actual rendered poster height and check for content overflow
  useEffect(() => {
    const checkOverflow = () => {
      if (posterRef.current && contentRef.current) {
        const renderedHeight = posterRef.current.offsetHeight
        setActualPosterHeight(renderedHeight)
        const contentHeight = contentRef.current.scrollHeight
        setHasOverflow(contentHeight > renderedHeight)
      }
    }

    // Check on mount and when images load
    checkOverflow()

    // Also check after short delays to ensure images and fonts are rendered
    const timer1 = setTimeout(checkOverflow, 100)
    const timer2 = setTimeout(checkOverflow, 300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [event.poster, showFullDescription])

  // Non-featured: Compact display with left date sidebar (like EventsCardCompact)
  if (!event.featured) {
    const CompactContent = (
      <>
        {/* Left date sidebar */}
        <div className="flex-shrink-0 w-20 text-center bg-amber-900 dark:bg-amber-900 font-sans flex items-center justify-center self-stretch">
          <div className="text-s font-bold text-white leading-none uppercase">
            {month} {day}
          </div>
        </div>

        {/* Event name */}
        <h3 className={`text-sm ${titleColorClass} leading-tight flex-1 px-2 py-1 truncate`}>
          <span className="font-bold">{event.name}</span>
          {event.host && (
            <span className="ml-1">
              | {event.host}
            </span>
          )}
        </h3>

        {/* External link icon - only show if valid URL */}
        {hasValidUrl && (
          <div className="flex-shrink-0 pr-3 text-amber-900 dark:text-amber-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}
      </>
    )

    if (hasValidUrl) {
      return (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-background-surface dark:bg-background-surface-dark hover:bg-amber-50 dark:hover:bg-background-subtle-dark transition-colors border border-amber-900 dark:border-amber-800 overflow-hidden"
        >
          {CompactContent}
        </a>
      )
    }

    return (
      <div className="flex items-center bg-background-surface dark:bg-background-surface-dark border border-amber-900 dark:border-amber-800 overflow-hidden">
        {CompactContent}
      </div>
    )
  }

  // Featured: Horizontal layout with poster and date bar at top
  // Check if poster has 13:19 aspect ratio (portrait) - put on left
  // Otherwise put on right
  const isPortraitPoster = event.poster && event.poster.width && event.poster.height &&
    (event.poster.width / event.poster.height) < 1

  return (
    <div className="bg-background-surface dark:bg-background-surface-dark border border-amber-900 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-background-subtle-dark transition-colors">
      {/* Date bar at top */}
      <div className="w-full bg-amber-900 dark:bg-amber-900 font-sans px-4 py-2 text-center">
        <div className="text-s font-bold text-white leading-none">
          {formattedDate}
                        {event.host && (
                <span className="ml-1">
                  | {event.host}
                </span>
              )}
        </div>
      </div>

      <div className={`flex gap-4 p-4 ${isPortraitPoster ? '' : 'flex-row-reverse'}`}>
        {/* Event Poster - left side for portrait, right side for landscape */}
        {event.poster && (
          <div ref={posterRef} className="flex-shrink-0 relative">
            <Image
              src={event.poster.url}
              alt={`${event.name} poster`}
              width={event.poster.width}
              height={event.poster.height}
              className="object-contain max-h-[280px] w-auto"
              sizes="(max-width: 640px) 200px, 280px"
            />
          </div>
        )}

        {/* Content - clamped to poster height when not expanded */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div
            ref={contentRef}
            className="flex-1 min-w-0"
            style={!showFullDescription && actualPosterHeight > 0 ? {
              maxHeight: `${actualPosterHeight}px`,
              overflow: 'hidden'
            } : undefined}
          >
            {/* Title and Link */}
            <div className="mb-2">
              {hasValidUrl ? (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${
                    isRecurring
                      ? 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                      : 'text-amber-900 dark:text-amber-700 hover:text-amber-950 dark:hover:text-amber-600'
                  } font-bold text-lg leading-tight inline-flex items-center gap-2`}
                >
                  {event.name}
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <h3 className={`${
                  isRecurring
                    ? 'text-text-secondary dark:text-text-secondary-dark'
                    : 'text-amber-900 dark:text-amber-700'
                } font-bold text-lg leading-tight`}>
                  {event.name}
                </h3>
              )}
            </div>

            {/* Retro text - always shown in full, appears before description */}
            {event.retro && (
              <div className="mb-2">
                <div className="border-l-2 border-amber-900 dark:border-amber-800 pl-3">
                  <p className="text-text-secondary dark:text-text-secondary-dark text-sm italic leading-snug">
                    {event.retro}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="mb-2">
                <p className="text-text-primary dark:text-text-primary-dark text-sm leading-snug whitespace-pre-line break-words">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand/collapse button - centered chevron at bottom of card, only shown when content overflows */}
      {hasOverflow && (
        <button
          onClick={() => setShowFullDescription(!showFullDescription)}
          className="text-amber-900 dark:text-amber-700 hover:text-amber-950 dark:hover:text-amber-600 flex items-center justify-center w-full pb-2"
          aria-label={showFullDescription ? 'Collapse card' : 'Expand card'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showFullDescription ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>
      )}
    </div>
  )
}
