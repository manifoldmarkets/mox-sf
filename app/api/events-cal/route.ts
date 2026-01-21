import { NextResponse } from 'next/server'
import { Event, parseAirtableEvent } from '@/app/lib/events'
import { format } from 'date-fns'
import { getRecords, Tables } from '@/app/lib/airtable'

interface EventFields {
  Name?: string
  'Start Date'?: string
  'End Date'?: string
  Status?: string
  'Event Description'?: string
  Notes?: string
  URL?: string
  Type?: string
  'Host Name'?: string
  'Name (from Assigned Rooms)'?: string[]
}

// Convert a date to iCal format (e.g., "20240315T100000Z")
function formatICalDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'")
}

// Create an iCal event string
function createICalEvent(event: Event): string {
  const startDate = formatICalDate(event.startDate)
  const endDate = event.endDate ? formatICalDate(event.endDate) : startDate

  // Create unique ID using event ID
  const uid = `${event.id}@mox.sf`

  // Build event description including any notes and URL
  let description = event.description || ''
  if (event.notes) {
    description += (description ? '\n\n' : '') + event.notes
  }
  if (event.host) {
    description += (description ? '\n\n' : '') + `Host: ${event.host}`
  }
  if (event.url) {
    description += (description ? '\n\n' : '') + `More info: ${event.url}`
  }

  // Build location string
  const location = event.location || 'Mox, 1680 Mission Street, San Francisco'

  // Prefix private events with "[private]"
  const prefix = event.type?.toLowerCase() === 'private' ? '[private] ' : ''
  const eventName = `${prefix}${event.name}`

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${sanitize(eventName)}`,
    `DESCRIPTION:${sanitize(description)}`,
    `LOCATION:${sanitize(location)}`,
    'END:VEVENT',
  ].join('\r\n')
}

function sanitize(str: string): string {
  return (
    str
      // Escape commas, semicolons, and backslashes
      .replace(/[,;\\]/g, '\\$&')
      // Escape carriage returns and newlines
      .replace(/[\r\n]/g, '\\n')
  )
}

export async function GET() {
  try {
    // Fetch events from Airtable
    const records = await getRecords<EventFields>(Tables.Events, {
      view: 'viwSk5Z39fSwtPGaB',
    })

    // Transform Airtable records to Event objects
    const events: Event[] = records
      .filter((record) => {
        if (!record.fields['Start Date']) return false

        const status = record.fields.Status?.toLowerCase()
        return status !== 'idea' && status !== 'maybe' && status !== 'cancelled'
      })
      .map(parseAirtableEvent)

    // Generate iCal content
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mox//Events Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Mox Events',
      'X-WR-TIMEZONE:America/Los_Angeles',
      ...events.map((event) => createICalEvent(event)),
      'END:VCALENDAR',
    ].join('\r\n')

    // Return as iCal file
    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mox-events.ics"',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    )
  }
}
