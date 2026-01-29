import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import {
  getUserBookings,
  getBookingsForRoom,
  findConflicts,
  createBooking,
  getRoom,
} from '@/app/lib/room-bookings'
import { getRecord, Tables } from '@/app/lib/airtable'

interface PersonFields {
  Name?: string
}

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const roomId = searchParams.get('roomId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    // If roomId and dates provided, get bookings for that room
    if (roomId && startDate && endDate) {
      const bookings = await getBookingsForRoom(
        roomId,
        new Date(startDate),
        new Date(endDate)
      )
      return NextResponse.json({ bookings })
    }

    // Otherwise, get current user's bookings
    const userId = session.viewingAsUserId || session.userId
    const bookings = await getUserBookings(userId)
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { roomId, startDate, endDate, purpose } = body

    // Validate required fields
    if (!roomId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Room, start date, and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book in the past' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const conflicts = await findConflicts(roomId, start, end)
    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Time slot is already booked',
          conflicts: conflicts.map((c) => ({
            startDate: c.startDate,
            endDate: c.endDate,
          })),
        },
        { status: 409 }
      )
    }

    // Get room details
    const room = await getRoom(roomId)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (!room.bookable) {
      return NextResponse.json({ error: 'Room is not bookable' }, { status: 400 })
    }

    // Get user details
    const userId = session.viewingAsUserId || session.userId
    const userName = session.viewingAsName || session.name || ''

    // If we don't have the name from session, fetch it
    let finalUserName = userName
    if (!finalUserName) {
      const userRecord = await getRecord<PersonFields>(Tables.People, userId)
      finalUserName = userRecord?.fields.Name || 'Unknown'
    }

    // Create the booking
    const booking = await createBooking({
      roomId,
      roomName: room.name,
      userId,
      userName: finalUserName,
      startDate: start,
      endDate: end,
      purpose,
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
