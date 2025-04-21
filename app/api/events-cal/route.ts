import { NextResponse } from 'next/server'
import { Event } from '@/app/lib/events'
import { format } from 'date-fns'

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
    description += (description ? '\\n\\n' : '') + event.notes
  }
  if (event.host) {
    description += (description ? '\\n\\n' : '') + `Host: ${event.host}`
  }
  if (event.url) {
    description += (description ? '\\n\\n' : '') + `More info: ${event.url}`
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
    `SUMMARY:${eventName.replace(/[,;\\]/g, '\\$&')}`,
    `DESCRIPTION:${description.replace(/[,;\\]/g, '\\$&')}`,
    `LOCATION:${location.replace(/[,;\\]/g, '\\$&')}`,
    'END:VEVENT',
  ].join('\r\n')
}

export async function GET() {
  try {
    // Fetch events from Airtable
    const res = await fetch(
      'https://api.airtable.com/v0/appkHZ2UvU6SouT5y/Events?maxRecords=100&view=viwSk5Z39fSwtPGaB',
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch events')
    }

    const data = await res.json()

    // Transform Airtable records to Event objects
    const events: Event[] = data.records
      .filter((record: any) => record.fields?.['Start Date'])
      .map(
        (record: any): Event => ({
          id: record.id,
          name: record.fields.Name,
          startDate: new Date(record.fields['Start Date']),
          endDate: record.fields['End Date']
            ? new Date(record.fields['End Date'])
            : undefined,
          description: record.fields.Description,
          location: record.fields.Location,
          notes: record.fields.Notes,
          type: record.fields.Type,
          status: record.fields.Status,
          url: record.fields.URL,
        })
      )

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
