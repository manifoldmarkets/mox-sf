import { describe, it, expect } from 'vitest'
import {
  getEffectiveEnd,
  isWithinEventWindow,
  DEFAULT_WINDOW_HOURS,
} from './event-access'

describe('getEffectiveEnd', () => {
  it('returns the explicit end when provided', () => {
    const start = new Date('2026-05-10T18:00:00Z')
    const end = new Date('2026-05-10T20:00:00Z')
    expect(getEffectiveEnd(start, end)).toEqual(end)
  })

  it('falls back to start + 3 hours when end is missing', () => {
    const start = new Date('2026-05-10T18:00:00Z')
    expect(getEffectiveEnd(start)).toEqual(new Date('2026-05-10T21:00:00Z'))
  })

  it('uses DEFAULT_WINDOW_HOURS for the fallback', () => {
    const start = new Date('2026-05-10T18:00:00Z')
    const fallback = getEffectiveEnd(start)
    const expected = new Date(
      start.getTime() + DEFAULT_WINDOW_HOURS * 60 * 60 * 1000
    )
    expect(fallback).toEqual(expected)
  })
})

describe('isWithinEventWindow', () => {
  const start = new Date('2026-05-10T18:00:00Z')
  const end = new Date('2026-05-10T20:00:00Z')

  it('returns false before the start', () => {
    const now = new Date('2026-05-10T17:59:59Z')
    expect(isWithinEventWindow(start, end, now)).toBe(false)
  })

  it('returns true at the exact start', () => {
    expect(isWithinEventWindow(start, end, start)).toBe(true)
  })

  it('returns true mid-window', () => {
    const now = new Date('2026-05-10T19:00:00Z')
    expect(isWithinEventWindow(start, end, now)).toBe(true)
  })

  it('returns true at the exact end', () => {
    expect(isWithinEventWindow(start, end, end)).toBe(true)
  })

  it('returns false after the end', () => {
    const now = new Date('2026-05-10T20:00:01Z')
    expect(isWithinEventWindow(start, end, now)).toBe(false)
  })

  it('uses 3-hour fallback when end is missing — within', () => {
    const now = new Date('2026-05-10T20:30:00Z')
    expect(isWithinEventWindow(start, undefined, now)).toBe(true)
  })

  it('uses 3-hour fallback when end is missing — past', () => {
    const now = new Date('2026-05-10T21:00:01Z')
    expect(isWithinEventWindow(start, undefined, now)).toBe(false)
  })

  it('handles spring-forward DST boundary (PT)', () => {
    // 2026-03-08 02:00 PT springs forward to 03:00. A 6pm PT event on the
    // prior day should still evaluate cleanly across the gap.
    const dstStart = new Date('2026-03-07T02:00:00-08:00')
    const dstEnd = new Date('2026-03-08T05:00:00-07:00')
    const midDst = new Date('2026-03-08T01:30:00-08:00')
    expect(isWithinEventWindow(dstStart, dstEnd, midDst)).toBe(true)
  })
})
