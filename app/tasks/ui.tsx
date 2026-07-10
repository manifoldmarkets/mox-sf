import React from 'react'

// Skill → badge classes, following the site's bg-100/text-800 + dark:bg-900/30
// convention (see EventTypeTag).
export const SKILL_CHIP: Record<string, string> = {
  'Space & setup':
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  Errand:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Design:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Writing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Tech: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  Events: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  'Ops & admin':
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

export const CHIP_BASE = 'inline-block px-2 py-1 text-xs font-medium'
export const FLOOR_CHIP =
  'inline-block px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300'

export const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Claimed:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'In review':
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Done: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

function linkify(text: string): React.ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    part.match(/^https?:\/\//) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-900 dark:text-amber-400 underline decoration-dotted underline-offset-2"
      >
        {part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
      </a>
    ) : (
      part
    )
  )
}

export function Prose({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim())
  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-3 last:mb-0 leading-relaxed">
          {para.split('\n').map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {linkify(line)}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  )
}
