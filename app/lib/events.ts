import { format, parseISO, isSameDay } from 'date-fns'

// The raw event data from Airtable
interface AirtableEvent {
  id: string
  fields: {
    Name: string
    'Start Date': string
    'End Date'?: string
    Description?: string
    Location?: string
    'Event Description'?: string
    Type?: string
    Status?: string
    URL?: string
    'Host Name'?: string[]
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
    description: record.fields.Description,
    location: record.fields.Location,
    notes: record.fields['Event Description'],
    type: record.fields.Type,
    status: record.fields.Status,
    url: record.fields.URL,
    host: (record.fields['Host Name'] ?? []).join(', '),
  }
}

export async function getEvents(): Promise<Event[]> {
  const res = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Events?maxRecords=100&view=viwSk5Z39fSwtPGaB`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      next: { revalidate: 60 },
    }
  )
  const data = await res.json()
  const records = data.records?.filter(
    (event: AirtableEvent) => {
      if (!event.fields?.['Start Date']) return false

      const status = event.fields.Status?.toLowerCase()
      return status !== 'idea' && status !== 'maybe' && status !== 'cancelled'
    }
  )

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
