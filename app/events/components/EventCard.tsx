'use client'
import { Event, formatEventTime } from '@/app/lib/events'
import { useState } from 'react'

function EventTypeTag({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    public:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    private: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    members: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  }
  const colorClasses =
    colorMap[type.toLowerCase()] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium ${colorClasses}`}
    >
      {type.toLowerCase()}
    </span>
  )
}

export default function EventCard({ event }: { event: Event }) {
  // Check if description has more than 3 lines
  const descriptionLines = event.description
    ? event.description.split('\n').length
    : 0
  const isLong = descriptionLines > 3
  const [expanded, setExpanded] = useState(!isLong)

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

  // Get first 3 lines of description
  const getFirstLines = (text: string, numLines: number) => {
    const lines = text.split('\n')
    return lines.slice(0, numLines).join('\n')
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100/50 dark:hover:bg-gray-700/80 transition-colors overflow-hidden">
      <div className="p-4">
        {/* Title and Type */}
        <div className="flex items-start gap-2 mb-1">
          <div className="flex-1 min-w-0">
            {hasValidUrl ? (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-bold text-lg leading-tight"
              >
                {event.name}{' '}
                <svg
                  className="w-4 h-4 inline-block align-[-0.12em]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ) : (
              <h3 className="text-amber-900 dark:text-amber-400 font-bold text-lg leading-tight">
                {event.name}
              </h3>
            )}
          </div>
          {event.type && (
            <div className="flex-shrink-0 mt-0.5">
              <EventTypeTag type={event.type} />
            </div>
          )}
        </div>

        {/* Time and Host */}
        <p className="text-sm mb-2 text-amber-800 dark:text-amber-500 font-sans">
          <span className="font-semibold">{formatEventTime(event)}</span>
          {event.host && <span>, hosted by {event.host}</span>}
        </p>

        {event.location && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            📍 {event.location}
          </p>
        )}

        {event.description && (
          <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line text-sm leading-snug break-words">
            {expanded ? event.description : getFirstLines(event.description, 3)}
            {!expanded && isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 underline ml-2 cursor-pointer"
              >
                ... more
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
