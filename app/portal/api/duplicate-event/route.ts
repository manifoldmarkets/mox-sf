import { NextRequest, NextResponse } from 'next/server'
import { createRecord, updateRecord, getRecord, Tables } from '@/app/lib/airtable'

interface EventFields {
  Name?: string
  'Start Date'?: string
  'End Date'?: string
  'Event Description'?: string
  Notes?: string
  Type?: string
  Status?: string
  URL?: string
  'Hosted by'?: string[]
  'Recurring Series'?: string
}

type RepeatFrequency = 'weekly' | 'biweekly' | 'monthly'

interface DuplicateEventRequest {
  eventId: string
  frequency: RepeatFrequency
  count?: number
  untilDate?: string
}

/**
 * Calculate the Nth weekday of a month (e.g., 2nd Tuesday)
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1)
  const firstWeekday = firstDay.getDay()

  // Calculate the first occurrence of the weekday in the month
  let firstOccurrence = 1 + ((weekday - firstWeekday + 7) % 7)

  // Calculate the nth occurrence
  const day = firstOccurrence + (n - 1) * 7

  return new Date(year, month, day)
}

/**
 * Get which occurrence of the weekday this date is (1st, 2nd, 3rd, etc.)
 */
function getWeekdayOccurrence(date: Date): number {
  const dayOfMonth = date.getDate()
  return Math.ceil(dayOfMonth / 7)
}

/**
 * Calculate the next date based on frequency
 */
function getNextDate(
  currentDate: Date,
  frequency: RepeatFrequency,
  originalDate: Date
): Date {
  const next = new Date(currentDate)

  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly': {
      // Get the Nth weekday (e.g., 2nd Tuesday) of the next month
      const weekday = originalDate.getDay()
      const occurrence = getWeekdayOccurrence(originalDate)

      // Move to next month
      let nextMonth = currentDate.getMonth() + 1
      let nextYear = currentDate.getFullYear()
      if (nextMonth > 11) {
        nextMonth = 0
        nextYear++
      }

      const nextDate = getNthWeekdayOfMonth(nextYear, nextMonth, weekday, occurrence)

      // If the occurrence doesn't exist (e.g., 5th Tuesday), use the last occurrence
      if (nextDate.getMonth() !== nextMonth) {
        // Go back a week to get the last occurrence
        nextDate.setDate(nextDate.getDate() - 7)
      }

      // Preserve the time from the original date
      nextDate.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds())

      return nextDate
    }
  }

  return next
}

/**
 * Generate a unique series ID
 */
function generateSeriesId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `series-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body: DuplicateEventRequest = await request.json()
    const { eventId, frequency, count, untilDate } = body

    // Validate input
    if (!eventId) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      )
    }

    if (!frequency || !['weekly', 'biweekly', 'monthly'].includes(frequency)) {
      return NextResponse.json(
        { message: 'Valid frequency is required (weekly, biweekly, monthly)' },
        { status: 400 }
      )
    }

    if (!count && !untilDate) {
      return NextResponse.json(
        { message: 'Either count or untilDate is required' },
        { status: 400 }
      )
    }

    // Fetch the original event
    const originalEvent = await getRecord<EventFields>(Tables.Events, eventId)
    if (!originalEvent) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    const startDateStr = originalEvent.fields['Start Date']
    if (!startDateStr) {
      return NextResponse.json(
        { message: 'Original event has no start date' },
        { status: 400 }
      )
    }

    const originalStartDate = new Date(startDateStr)
    const originalEndDate = originalEvent.fields['End Date']
      ? new Date(originalEvent.fields['End Date'])
      : null

    // Calculate duration if end date exists
    const durationMs = originalEndDate
      ? originalEndDate.getTime() - originalStartDate.getTime()
      : null

    // Generate a unique series ID for linking events
    const seriesId = originalEvent.fields['Recurring Series'] || generateSeriesId()

    // Update the original event to mark as recurring and add series ID
    await updateRecord<EventFields>(Tables.Events, eventId, {
      Status: 'Recurring',
      'Recurring Series': seriesId,
    })

    // Calculate how many events to create
    const untilDateParsed = untilDate ? new Date(untilDate) : null
    const maxCount = count || 52 // Max 52 occurrences (1 year of weekly) if using untilDate

    const createdEvents: { id: string; startDate: string }[] = []
    let currentDate = originalStartDate

    for (let i = 0; i < maxCount; i++) {
      // Calculate next date
      currentDate = getNextDate(currentDate, frequency, originalStartDate)

      // Check if we've passed the until date
      if (untilDateParsed && currentDate > untilDateParsed) {
        break
      }

      // Calculate end date if original had one
      const newEndDate = durationMs
        ? new Date(currentDate.getTime() + durationMs)
        : null

      // Create the new event
      const newEventFields: Partial<EventFields> = {
        Name: originalEvent.fields.Name,
        'Start Date': currentDate.toISOString(),
        'Event Description': originalEvent.fields['Event Description'],
        Notes: originalEvent.fields.Notes,
        Type: originalEvent.fields.Type,
        Status: 'Recurring',
        URL: originalEvent.fields.URL,
        'Hosted by': originalEvent.fields['Hosted by'],
        'Recurring Series': seriesId,
      }

      if (newEndDate) {
        newEventFields['End Date'] = newEndDate.toISOString()
      }

      const newEvent = await createRecord<EventFields>(Tables.Events, newEventFields)
      createdEvents.push({
        id: newEvent.id,
        startDate: currentDate.toISOString(),
      })
    }

    return NextResponse.json({
      message: `Created ${createdEvents.length} recurring event(s)`,
      seriesId,
      createdEvents,
    })
  } catch (error) {
    console.error('Error duplicating event:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
