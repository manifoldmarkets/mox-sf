import { format, parseISO, isSameDay } from 'date-fns'

export interface Event {
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
  }
}

export async function getEvents(): Promise<Event[]> {
  const res = await fetch('/api/events')
  if (!res.ok) throw new Error('Failed to fetch events')
  
  const data = await res.json()
  return data.records?.filter(event => event.fields?.['Start Date']) || []
}

export function formatEventTime(event: Event, showDate = false): string {
  if (!event.fields?.['Start Date']) return 'Date not available'

  const date = parseISO(event.fields['Start Date'])
  if (isNaN(date.getTime())) return 'Invalid date'

  const startTime = format(date, 'h:mm a')
  
  if (!event.fields['End Date']) {
    return showDate ? `${format(date, 'EEEE, MMMM d')}, ${startTime}` : startTime
  }
  
  const endDate = parseISO(event.fields['End Date'])
  const endTime = format(endDate, 'h:mm a')
  return showDate 
    ? `${format(date, 'EEEE, MMMM d')}, ${startTime} - ${endTime}`
    : `${startTime} - ${endTime}`
}

export function getEventDate(event: Event): Date | null {
  if (!event.fields?.['Start Date']) return null
  const date = parseISO(event.fields['Start Date'])
  return isNaN(date.getTime()) ? null : date
}

export function filterEventsByDay(events: Event[], day: Date): Event[] {
  return events.filter(event => {
    const eventDate = getEventDate(event)
    return eventDate && isSameDay(eventDate, day)
  })
}