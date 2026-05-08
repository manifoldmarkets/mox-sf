import { addHours } from 'date-fns'

export const DEFAULT_WINDOW_HOURS = 3

export function getEffectiveEnd(start: Date, end?: Date): Date {
  return end ?? addHours(start, DEFAULT_WINDOW_HOURS)
}

export function isWithinEventWindow(
  start: Date,
  end: Date | undefined,
  now: Date = new Date()
): boolean {
  const effectiveEnd = getEffectiveEnd(start, end)
  return now >= start && now <= effectiveEnd
}
