import { format, parseISO } from 'date-fns'

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
  try {
    console.log('Fetching events...')
    const res = await fetch('/api/events')
    
    if (!res.ok) {
      const errorData = await res.json()
      console.error('Failed to fetch events:', {
        status: res.status,
        statusText: res.statusText,
        error: errorData
      })
      throw new Error('Failed to fetch events')
    }

    const data = await res.json()
    console.log('Events data:', data)
    
    if (!data.records) {
      console.error('Unexpected data format:', data)
      return []
    }

    // Filter out events without valid dates
    return data.records.filter(event => event.fields && event.fields['Start Date'])
  } catch (error) {
    console.error('Error in getEvents:', error)
    throw error
  }
}

export function formatEventTime(event: Event): string {
  try {
    if (!event.fields?.['Start Date']) {
      return 'Date not available'
    }

    // Parse the ISO date string
    const date = parseISO(event.fields['Start Date'])
    if (!date || isNaN(date.getTime())) {
      return 'Invalid date'
    }

    const dateStr = format(date, 'EEEE, MMMM d')
    const startTime = format(date, 'h:mm a')
    
    if (event.fields['End Date']) {
      const endDate = parseISO(event.fields['End Date'])
      const endTime = format(endDate, 'h:mm a')
      return `${dateStr}, ${startTime} - ${endTime}`
    }
    
    return `${dateStr}, ${startTime}`
  } catch (error) {
    console.error('Error formatting date:', error, 'Event:', event)
    return 'Date not available'
  }
}