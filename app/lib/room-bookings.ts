import {
  Tables,
  findRecords,
  findRecord,
  createRecord,
  updateRecord,
  type AirtableRecord,
} from './airtable'
import { escapeAirtableString } from './airtable-helpers'

// Airtable field interfaces
export interface RoomFields {
  Name: string
  Floor?: string
  'Room #'?: string
  'Room Size'?: number
  Status?: string
  Bookable?: boolean
}

export interface RoomBookingFields {
  Name?: string
  Room?: string[]
  'Booked By'?: string[]
  Start?: string
  End?: string
  Purpose?: string
  Status?: 'Confirmed' | 'Cancelled'
}

// Client-friendly interfaces
export interface Room {
  id: string
  name: string
  floor?: string
  roomNumber?: string
  size?: number
  status?: string
  bookable: boolean
}

export interface Booking {
  id: string
  roomId: string
  roomName: string
  userId: string
  userName?: string
  startDate: Date
  endDate: Date
  purpose?: string
  status: 'Confirmed' | 'Cancelled'
}

// Transform Airtable record to Room
function parseRoom(record: AirtableRecord<RoomFields>): Room {
  return {
    id: record.id,
    name: record.fields.Name,
    floor: record.fields.Floor,
    roomNumber: record.fields['Room #'],
    size: record.fields['Room Size'],
    status: record.fields.Status,
    bookable: record.fields.Bookable === true,
  }
}

// Transform Airtable record to Booking
function parseBooking(
  record: AirtableRecord<RoomBookingFields>,
  roomName?: string
): Booking {
  return {
    id: record.id,
    roomId: record.fields.Room?.[0] || '',
    roomName: roomName || record.fields.Name?.split(' - ')[0] || '',
    userId: record.fields['Booked By']?.[0] || '',
    startDate: new Date(record.fields.Start || ''),
    endDate: new Date(record.fields.End || ''),
    purpose: record.fields.Purpose,
    status: record.fields.Status || 'Confirmed',
  }
}

/**
 * Get all rooms marked as bookable
 */
export async function getBookableRooms(): Promise<Room[]> {
  const records = await findRecords<RoomFields>(Tables.Rooms, '{Bookable} = TRUE()')
  return records.map(parseRoom)
}

/**
 * Get a single room by ID
 */
export async function getRoom(roomId: string): Promise<Room | null> {
  const record = await findRecord<RoomFields>(Tables.Rooms, `RECORD_ID() = '${escapeAirtableString(roomId)}'`)
  return record ? parseRoom(record) : null
}

/**
 * Get bookings for a specific room in a date range
 */
export async function getBookingsForRoom(
  roomId: string,
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {
  const startISO = startDate.toISOString()
  const endISO = endDate.toISOString()

  // Find bookings that overlap with the requested time range
  const formula = `AND(
    FIND('${escapeAirtableString(roomId)}', ARRAYJOIN({Room})) > 0,
    {Status} = 'Confirmed',
    IS_BEFORE({Start}, '${endISO}'),
    IS_AFTER({End}, '${startISO}')
  )`

  const records = await findRecords<RoomBookingFields>(Tables.RoomBookings, formula)
  return records.map((r) => parseBooking(r))
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  const formula = `AND(
    FIND('${escapeAirtableString(userId)}', ARRAYJOIN({Booked By})) > 0,
    {Status} = 'Confirmed'
  )`

  const records = await findRecords<RoomBookingFields>(Tables.RoomBookings, formula, {
    sort: [{ field: 'Start', direction: 'asc' }],
  })
  return records.map((r) => parseBooking(r))
}

/**
 * Find conflicting bookings for a room in a time range
 */
export async function findConflicts(
  roomId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<Booking[]> {
  const startISO = startDate.toISOString()
  const endISO = endDate.toISOString()

  // Find bookings that overlap with the requested time range
  let formula = `AND(
    FIND('${escapeAirtableString(roomId)}', ARRAYJOIN({Room})) > 0,
    {Status} = 'Confirmed',
    IS_BEFORE({Start}, '${endISO}'),
    IS_AFTER({End}, '${startISO}')
  )`

  if (excludeBookingId) {
    formula = `AND(
      RECORD_ID() != '${escapeAirtableString(excludeBookingId)}',
      FIND('${escapeAirtableString(roomId)}', ARRAYJOIN({Room})) > 0,
      {Status} = 'Confirmed',
      IS_BEFORE({Start}, '${endISO}'),
      IS_AFTER({End}, '${startISO}')
    )`
  }

  const records = await findRecords<RoomBookingFields>(Tables.RoomBookings, formula)
  return records.map((r) => parseBooking(r))
}

/**
 * Create a new booking
 */
export async function createBooking(params: {
  roomId: string
  roomName: string
  userId: string
  userName: string
  startDate: Date
  endDate: Date
  purpose?: string
}): Promise<Booking> {
  const { roomId, roomName, userId, userName, startDate, endDate, purpose } = params

  // Format the name field for easy identification
  const dateStr = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const name = `${roomName} - ${userName} - ${dateStr}`

  const record = await createRecord<RoomBookingFields>(Tables.RoomBookings, {
    Name: name,
    Room: [roomId],
    'Booked By': [userId],
    Start: startDate.toISOString(),
    End: endDate.toISOString(),
    Purpose: purpose,
    Status: 'Confirmed',
  })

  return parseBooking(record, roomName)
}

/**
 * Cancel a booking (soft delete - sets status to Cancelled)
 */
export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    await updateRecord<RoomBookingFields>(Tables.RoomBookings, bookingId, {
      Status: 'Cancelled',
    })
    return true
  } catch {
    return false
  }
}
