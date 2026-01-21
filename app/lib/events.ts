import { format, parseISO, isSameDay, startOfDay } from 'date-fns'
import { getRecords, Tables, AirtableRecord } from './airtable'

// The raw event fields from Airtable
interface EventFields {
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
  Featured?: boolean
  Priority?: string
  'Event Poster'?: {
    id: string
    url: string
    filename: string
    width?: number
    height?: number
    thumbnails?: {
      small?: { url: string; width: number; height: number }
      large?: { url: string; width: number; height: number }
      full?: { url: string; width: number; height: number }
    }
  }[]
  'Event Retro'?: string
}

type AirtableEvent = AirtableRecord<EventFields>

// Keep compatibility with old type name used in parseAirtableEvent
interface LegacyAirtableEvent {
  id: string
  fields: EventFields
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
  featured?: boolean
  priority?: 'p1' | 'p2' | 'p3'
  poster?: {
    url: string
    width?: number
    height?: number
    thumbnails?: {
      small?: { url: string; width: number; height: number }
      large?: { url: string; width: number; height: number }
      full?: { url: string; width: number; height: number }
    }
  }
  retro?: string
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
    featured: record.fields.Featured,
    priority: record.fields.Priority as 'p1' | 'p2' | 'p3' | undefined,
    poster: record.fields['Event Poster']?.[0]
      ? {
          url: record.fields['Event Poster'][0].url,
          width: record.fields['Event Poster'][0].width,
          height: record.fields['Event Poster'][0].height,
          thumbnails: record.fields['Event Poster'][0].thumbnails,
        }
      : undefined,
    retro: record.fields['Event Retro'],
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
  'URL',
  // For some reason, trying to include "Location" results in no events being returned
  // 'Location',
  'Notes',
  'Event Description',
  'Featured',
  'Priority',
  'Event Poster',
  'Event Retro',
]

export async function getEvents(): Promise<Event[]> {
  const records = await getRecords<EventFields>(
    Tables.Events,
    {
      fields: EVENT_FIELDS,
      view: 'viwSk5Z39fSwtPGaB',
      maxRecords: 100,
    },
    { revalidate: 60 }
  )

  const filtered = records.filter((event) => {
    if (!event.fields?.['Start Date']) return false

    const status = event.fields.Status?.toLowerCase()
    return status !== 'idea' && status !== 'maybe' && status !== 'cancelled'
  })

  return filtered.map(parseAirtableEvent)
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

export async function getPastEvents(): Promise<Event[]> {
  // Pagination is handled automatically by getRecords
  const allRecords = await getRecords<EventFields>(
    Tables.Events,
    {
      fields: EVENT_FIELDS,
      sort: [{ field: 'Start Date', direction: 'desc' }],
    },
    { revalidate: 60 }
  )

  // Filter for past events only (Start Date < today)
  const today = startOfDay(new Date())
  const filtered = allRecords.filter((event) => {
    if (!event.fields?.['Start Date']) return false

    const status = event.fields.Status?.toLowerCase()
    if (status === 'idea' || status === 'maybe' || status === 'cancelled') {
      return false
    }

    const eventDate = parseISO(event.fields['Start Date'])
    return eventDate < today
  })

  return filtered.map(parseAirtableEvent)
}

export function sortPastEventsByPriorityAndDate(events: Event[]): Event[] {
  const priorityOrder = { p1: 0, p2: 1, p3: 2 }

  return events.sort((a, b) => {
    // First sort by priority
    const aPriority = a.priority ? priorityOrder[a.priority] : 999
    const bPriority = b.priority ? priorityOrder[b.priority] : 999

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Within same priority, sort by date (most recent first)
    return b.startDate.getTime() - a.startDate.getTime()
  })
}
