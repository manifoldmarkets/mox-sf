import { NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { getBookableRooms } from '@/app/lib/room-bookings'

export async function GET() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rooms = await getBookableRooms()
    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}
