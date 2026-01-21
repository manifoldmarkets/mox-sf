import { describe, it, expect } from 'vitest'
import {
  parseAirtableEvent,
  formatEventTime,
  getEventDate,
  filterEventsByDay,
  sortPastEventsByPriorityAndDate,
  Event,
} from './events'

describe('parseAirtableEvent', () => {
  it('parses minimal event record', () => {
    const record = {
      id: 'rec123',
      fields: {
        Name: 'Test Event',
        'Start Date': '2024-03-15T18:00:00.000Z',
      },
    }

    const event = parseAirtableEvent(record)

    expect(event.id).toBe('rec123')
    expect(event.name).toBe('Test Event')
    expect(event.startDate).toEqual(new Date('2024-03-15T18:00:00.000Z'))
    expect(event.endDate).toBeUndefined()
  })

  it('parses full event record with all fields', () => {
    const record = {
      id: 'rec456',
      fields: {
        Name: 'Full Event',
        'Start Date': '2024-03-15T18:00:00.000Z',
        'End Date': '2024-03-15T21:00:00.000Z',
        'Event Description': 'A great event',
        Location: 'Main Hall',
        Notes: 'Bring snacks',
        Type: 'public',
        Status: 'Confirmed',
        URL: 'https://example.com/event',
        'Host Name': 'John Doe',
        Featured: true,
        Priority: 'p1',
        'Event Retro': 'It went well!',
      },
    }

    const event = parseAirtableEvent(record)

    expect(event.name).toBe('Full Event')
    expect(event.endDate).toEqual(new Date('2024-03-15T21:00:00.000Z'))
    expect(event.description).toBe('A great event')
    expect(event.location).toBe('Main Hall')
    expect(event.notes).toBe('Bring snacks')
    expect(event.type).toBe('public')
    expect(event.status).toBe('Confirmed')
    expect(event.url).toBe('https://example.com/event')
    expect(event.host).toBe('John Doe')
    expect(event.featured).toBe(true)
    expect(event.priority).toBe('p1')
    expect(event.retro).toBe('It went well!')
  })

  it('parses event with poster', () => {
    const record = {
      id: 'rec789',
      fields: {
        Name: 'Event with Poster',
        'Start Date': '2024-03-15T18:00:00.000Z',
        'Event Poster': [
          {
            id: 'att123',
            url: 'https://example.com/poster.jpg',
            filename: 'poster.jpg',
            width: 800,
            height: 600,
            thumbnails: {
              small: { url: 'https://example.com/small.jpg', width: 100, height: 75 },
              large: { url: 'https://example.com/large.jpg', width: 400, height: 300 },
            },
          },
        ],
      },
    }

    const event = parseAirtableEvent(record)

    expect(event.poster).toBeDefined()
    expect(event.poster?.url).toBe('https://example.com/poster.jpg')
    expect(event.poster?.width).toBe(800)
    expect(event.poster?.height).toBe(600)
    expect(event.poster?.thumbnails?.small?.url).toBe('https://example.com/small.jpg')
  })

  it('handles empty poster array', () => {
    const record = {
      id: 'rec789',
      fields: {
        Name: 'Event without Poster',
        'Start Date': '2024-03-15T18:00:00.000Z',
        'Event Poster': [],
      },
    }

    const event = parseAirtableEvent(record)

    expect(event.poster).toBeUndefined()
  })
})

describe('formatEventTime', () => {
  it('formats time only for event without end date', () => {
    const event: Event = {
      id: '1',
      name: 'Test',
      startDate: new Date('2024-03-15T18:00:00'),
    }

    expect(formatEventTime(event)).toBe('6 PM')
  })

  it('formats time range for event with end date', () => {
    const event: Event = {
      id: '1',
      name: 'Test',
      startDate: new Date('2024-03-15T18:00:00'),
      endDate: new Date('2024-03-15T21:00:00'),
    }

    expect(formatEventTime(event)).toBe('6 PM - 9 PM')
  })

  it('includes minutes when not on the hour', () => {
    const event: Event = {
      id: '1',
      name: 'Test',
      startDate: new Date('2024-03-15T18:30:00'),
      endDate: new Date('2024-03-15T21:45:00'),
    }

    expect(formatEventTime(event)).toBe('6:30 PM - 9:45 PM')
  })

  it('includes date when showDate is true', () => {
    const event: Event = {
      id: '1',
      name: 'Test',
      startDate: new Date('2024-03-15T18:00:00'),
    }

    expect(formatEventTime(event, true)).toBe('Friday, March 15, 6 PM')
  })

  it('includes date and time range when showDate is true with end date', () => {
    const event: Event = {
      id: '1',
      name: 'Test',
      startDate: new Date('2024-03-15T18:00:00'),
      endDate: new Date('2024-03-15T21:00:00'),
    }

    expect(formatEventTime(event, true)).toBe('Friday, March 15, 6 PM - 9 PM')
  })
})

describe('getEventDate', () => {
  it('returns the start date', () => {
    const startDate = new Date('2024-03-15T18:00:00')
    const event: Event = {
      id: '1',
      name: 'Test',
      startDate,
    }

    expect(getEventDate(event)).toBe(startDate)
  })
})

describe('filterEventsByDay', () => {
  const events: Event[] = [
    { id: '1', name: 'Event 1', startDate: new Date('2024-03-15T10:00:00') },
    { id: '2', name: 'Event 2', startDate: new Date('2024-03-15T18:00:00') },
    { id: '3', name: 'Event 3', startDate: new Date('2024-03-16T10:00:00') },
  ]

  it('filters events for a specific day', () => {
    const day = new Date('2024-03-15T00:00:00')
    const filtered = filterEventsByDay(events, day)

    expect(filtered).toHaveLength(2)
    expect(filtered.map((e) => e.id)).toEqual(['1', '2'])
  })

  it('returns empty array when no events match', () => {
    const day = new Date('2024-03-20T00:00:00')
    const filtered = filterEventsByDay(events, day)

    expect(filtered).toHaveLength(0)
  })
})

describe('sortPastEventsByPriorityAndDate', () => {
  it('sorts by priority first (p1 > p2 > p3)', () => {
    const events: Event[] = [
      { id: '1', name: 'P3 Event', startDate: new Date('2024-03-15'), priority: 'p3' },
      { id: '2', name: 'P1 Event', startDate: new Date('2024-03-15'), priority: 'p1' },
      { id: '3', name: 'P2 Event', startDate: new Date('2024-03-15'), priority: 'p2' },
    ]

    const sorted = sortPastEventsByPriorityAndDate(events)

    expect(sorted.map((e) => e.priority)).toEqual(['p1', 'p2', 'p3'])
  })

  it('sorts by date within same priority (most recent first)', () => {
    const events: Event[] = [
      { id: '1', name: 'Older', startDate: new Date('2024-03-10'), priority: 'p1' },
      { id: '2', name: 'Newer', startDate: new Date('2024-03-15'), priority: 'p1' },
      { id: '3', name: 'Middle', startDate: new Date('2024-03-12'), priority: 'p1' },
    ]

    const sorted = sortPastEventsByPriorityAndDate(events)

    expect(sorted.map((e) => e.name)).toEqual(['Newer', 'Middle', 'Older'])
  })

  it('puts events without priority at the end', () => {
    const events: Event[] = [
      { id: '1', name: 'No Priority', startDate: new Date('2024-03-15') },
      { id: '2', name: 'P2 Event', startDate: new Date('2024-03-15'), priority: 'p2' },
      { id: '3', name: 'P1 Event', startDate: new Date('2024-03-15'), priority: 'p1' },
    ]

    const sorted = sortPastEventsByPriorityAndDate(events)

    expect(sorted.map((e) => e.name)).toEqual(['P1 Event', 'P2 Event', 'No Priority'])
  })

  it('sorts events without priority by date', () => {
    const events: Event[] = [
      { id: '1', name: 'Older', startDate: new Date('2024-03-10') },
      { id: '2', name: 'Newer', startDate: new Date('2024-03-15') },
    ]

    const sorted = sortPastEventsByPriorityAndDate(events)

    expect(sorted.map((e) => e.name)).toEqual(['Newer', 'Older'])
  })
})
