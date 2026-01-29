import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { cancelBooking } from '@/app/lib/room-bookings'
import { getRecord, Tables } from '@/app/lib/airtable'

interface RoomBookingFields {
  'Booked By'?: string[]
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
  }

  try {
    // Get the booking to verify ownership
    const booking = await getRecord<RoomBookingFields>(Tables.RoomBookings, id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user owns this booking (or is staff)
    const userId = session.viewingAsUserId || session.userId
    const bookedBy = booking.fields['Booked By']?.[0]

    if (bookedBy !== userId && !session.isStaff) {
      return NextResponse.json(
        { error: 'You can only cancel your own bookings' },
        { status: 403 }
      )
    }

    // Cancel the booking
    const success = await cancelBooking(id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
