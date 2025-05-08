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
    Notes?: string
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
    notes: record.fields.Notes,
    type: record.fields.Type,
    status: record.fields.Status,
    url: record.fields.URL,
    host: (record.fields['Host Name'] ?? []).join(', '),
  }
}

export async function getEvents(): Promise<Event[]> {
  const res = await fetch('/api/events')
  if (!res.ok) throw new Error('Failed to fetch events')

  const data = await res.json()
  const records = data.records?.filter(
    (event: AirtableEvent) => event.fields?.['Start Date']
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
