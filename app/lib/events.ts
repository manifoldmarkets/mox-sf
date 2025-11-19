import { format, parseISO, isSameDay } from 'date-fns'

// The raw event data from Airtable
interface AirtableEvent {
  id: string
  fields: {
    Name: string
    'Start Date': string
    'End Date'?: string
    'Event Description'?: string
    Location?: string
    Notes?: string
    Type?: string
    Status?: string
    URL?: string
    'Host Name'?: string
  }
}

// Our cleaned up event interface
export interface Event {
  id: string
  name: string
  startDate: Date
  endDate?: Date
  description?: string
  location?: string
  notes?: string
  type?: string
  status?: string
  url?: string
  host?: string
}

export function parseAirtableEvent(record: AirtableEvent): Event {
  return {
    id: record.id,
    name: record.fields.Name,
    startDate: parseISO(record.fields['Start Date']),
    endDate: record.fields['End Date']
      ? parseISO(record.fields['End Date'])
      : undefined,
    description: record.fields['Event Description'],
    location: record.fields.Location,
    notes: record.fields.Notes,
    type: record.fields.Type,
    status: record.fields.Status,
    url: record.fields.URL,
    host: record.fields['Host Name'],
  }
}

// Explicit field selection to reduce payload size
// Note: Only include fields that actually exist in the Events table
const EVENT_FIELDS = [
  'Name',
  'Start Date',
  'End Date',
  'Type',
  'Status',
  'Host Name',
  'Hosted by',
]

export async function getEvents(): Promise<Event[]> {
  const fieldsParam = EVENT_FIELDS.map((field) =>
    `fields%5B%5D=${encodeURIComponent(field)}`
  ).join('&')

  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Events?maxRecords=100&view=viwSk5Z39fSwtPGaB&${fieldsParam}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      next: { revalidate: 60 },
    }
  )
  const data = await res.json()
  const records = data.records?.filter((event: AirtableEvent) => {
    if (!event.fields?.['Start Date']) return false

    const status = event.fields.Status?.toLowerCase()
    return status !== 'idea' && status !== 'maybe' && status !== 'cancelled'
  })

  return records?.map(parseAirtableEvent) || []
}

export function formatEventTime(event: Event, showDate = false): string {
  const startTime = format(event.startDate, 'h:mm a').replace(':00', '')

  if (!event.endDate) {
    return showDate
      ? `${format(event.startDate, 'EEEE, MMMM d')}, ${startTime}`
      : startTime
  }

  const endTime = format(event.endDate, 'h:mm a').replace(':00', '')
  return showDate
    ? `${format(event.startDate, 'EEEE, MMMM d')}, ${startTime} - ${endTime}`
    : `${startTime} - ${endTime}`
}

export function getEventDate(event: Event): Date {
  return event.startDate
}

export function filterEventsByDay(events: Event[], day: Date): Event[] {
  return events.filter((event) => isSameDay(event.startDate, day))
}
