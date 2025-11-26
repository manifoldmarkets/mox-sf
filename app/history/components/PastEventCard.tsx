'use client'
import { Event } from '@/app/lib/events'
import { format } from 'date-fns'
import Image from 'next/image'

interface PastEventCardProps {
  event: Event
}

export default function PastEventCard({ event }: PastEventCardProps) {
  const month = format(event.startDate, 'MMM')
  const day = format(event.startDate, 'd')
  const formattedDate = format(event.startDate, 'MMMM d, yyyy')

  // Check if event is recurring
  const isRecurring = event.status?.toLowerCase().includes('recurring')
  const titleColorClass = isRecurring
    ? 'text-gray-500 dark:text-gray-500'
    : 'text-gray-900 dark:text-gray-100'

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

  // Non-featured: Compact display with left date sidebar (like EventsCardCompact)
  if (!event.featured) {
    const CompactContent = (
      <>
        {/* Left date sidebar */}
        <div className={`flex-shrink-0 w-20 text-center font-sans flex items-center justify-center self-stretch ${
          isRecurring
            ? 'bg-gray-400 dark:bg-gray-700'
            : 'bg-gray-600 dark:bg-gray-600'
        }`}>
          <div className="text-s font-bold text-white leading-none uppercase">
            {month} {day}
          </div>
        </div>

        {/* Event name */}
        <h3 className={`text-sm ${titleColorClass} leading-tight flex-1 px-2 py-1 truncate`}>
          {event.name}
          {event.host && (
            <span className="ml-1">
              | {event.host}
            </span>
          )}
        </h3>

        {/* External link icon - only show if valid URL */}
        {hasValidUrl && (
          <div className={`flex-shrink-0 pr-3 ${
            isRecurring
              ? 'text-gray-400 dark:text-gray-600'
              : 'text-amber-900 dark:text-amber-400'
          }`}>
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
          className={`flex items-center hover:bg-gray-100/50 dark:hover:bg-gray-700/80 transition-colors overflow-hidden ${
            isRecurring
              ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 opacity-75'
              : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
          }`}
        >
          {CompactContent}
        </a>
      )
    }

    return (
      <div className={`flex items-center overflow-hidden ${
        isRecurring
          ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 opacity-75'
          : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
      }`}>
        {CompactContent}
      </div>
    )
  }

  // Featured: Responsive layout with poster and content
  // Portrait posters on left, landscape posters on right
  const isPortraitPoster = event.poster && event.poster.width && event.poster.height &&
    (event.poster.width / event.poster.height) < 1

  return (
    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100/50 dark:hover:bg-gray-700/80 transition-colors overflow-hidden">
      {/* Date bar at top */}
      <div className="w-full bg-gray-600 dark:bg-gray-600 font-sans px-4 py-2 text-center">
        <div className="text-s font-bold text-white leading-none">
          {formattedDate}
          {event.host && (
            <span className="ml-1">
              | {event.host}
            </span>
          )}
        </div>
      </div>

      {/* Event Poster - full width on mobile */}
      {event.poster && (
        <div className={`flex-shrink-0 flex justify-center sm:hidden`}>
          <Image
            src={event.poster.url}
            alt={`${event.name} poster`}
            width={event.poster.width}
            height={event.poster.height}
            className="object-contain w-full"
            sizes="100vw"
          />
        </div>
      )}

      {/* Responsive layout: side-by-side on desktop only */}
      <div className={`flex flex-col sm:flex-row gap-4 p-4 ${isPortraitPoster ? '' : 'sm:flex-row-reverse'}`}>
        {/* Event Poster - desktop only */}
        {event.poster && (
          <div className={`hidden sm:flex flex-shrink-0 justify-center sm:justify-start ${!isPortraitPoster ? 'sm:sticky sm:top-4 sm:self-start' : ''}`}>
            <Image
              src={event.poster.url}
              alt={`${event.name} poster`}
              width={event.poster.width}
              height={event.poster.height}
              className="object-contain w-auto max-w-[280px] sm:max-h-[200px] md:max-h-[280px] lg:max-h-[320px]"
              sizes="280px"
            />
          </div>
        )}

        {/* Content - uses CSS line-clamp for responsive truncation */}
        <div className="flex-1 min-w-0">
          {/* Title and Link */}
          <div className="mb-2">
            {hasValidUrl ? (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-bold text-lg leading-tight inline-flex items-center gap-2"
              >
                {event.name}
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <h3 className="text-amber-900 dark:text-amber-400 font-bold text-lg leading-tight">
                {event.name}
              </h3>
            )}
          </div>

          {/* Retro text - always shown in full */}
          {event.retro && (
            <div className="mb-2">
              <div className="border-l-2 border-gray-400 dark:border-gray-500 pl-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm italic leading-snug">
                  {event.retro}
                </p>
              </div>
            </div>
          )}

          {/* Description - responsive line clamping */}
          {event.description && (
            <div className="mb-2">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-snug whitespace-pre-line break-words line-clamp-4 sm:line-clamp-6 md:line-clamp-8 lg:line-clamp-10">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
