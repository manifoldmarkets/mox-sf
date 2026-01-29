import { NextResponse } from 'next/server'
import {
  editChannelMessage,
  sendChannelMessage,
  DISCORD_CHANNELS,
  DISCORD_ROOM_AVAILABILITY_MESSAGE_ID,
} from '@/app/lib/discord'
import {
  getBookableRooms,
  getBookingsForRoom,
  type Room,
  type Booking,
} from '@/app/lib/room-bookings'

// Vercel cron jobs use GET requests
export const dynamic = 'force-dynamic'

const PORTAL_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://moxsf.com'

/**
 * Get the availability status for a room
 */
function getRoomStatus(room: Room, bookings: Booking[], now: Date): string {
  // Filter to bookings happening now or in the future today
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const relevantBookings = bookings
    .filter((b) => b.endDate > now && b.startDate < todayEnd)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  if (relevantBookings.length === 0) {
    return 'Free all day'
  }

  // Check if there's a booking happening right now
  const currentBooking = relevantBookings.find(
    (b) => b.startDate <= now && b.endDate > now
  )

  if (currentBooking) {
    const endTime = currentBooking.endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Los_Angeles',
    })
    return `Busy until ${endTime}`
  }

  // Room is free, find when the next booking starts
  const nextBooking = relevantBookings.find((b) => b.startDate > now)
  if (nextBooking) {
    const startTime = nextBooking.startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Los_Angeles',
    })
    return `Free until ${startTime}`
  }

  return 'Free all day'
}

/**
 * Format the room availability message for Discord
 */
function formatMessage(
  rooms: Array<{ room: Room; status: string }>,
  updatedAt: Date
): string {
  const timeStr = updatedAt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  })

  // Group rooms by floor, sorted numerically descending (4th floor first)
  const floors = Array.from(new Set(rooms.map((r) => r.room.floor || 'Other')))
    .sort((a, b) => {
      if (a === 'Other') return 1
      if (b === 'Other') return -1
      return parseInt(b) - parseInt(a)
    })

  // Find the longest room name + capacity for padding
  const getCapacityStr = (size?: number) =>
    size && size > 2 ? ` (capacity ${size})` : ''
  const maxNameLength = Math.max(
    ...rooms.map((r) => r.room.name.length + getCapacityStr(r.room.size).length)
  )

  const lines: string[] = []
  for (const floor of floors) {
    const floorRooms = rooms
      .filter((r) => (r.room.floor || 'Other') === floor)
      .sort((a, b) => a.room.name.localeCompare(b.room.name))

    lines.push(`─ FLOOR ${floor} ──────────────────────────────────────`)
    for (const { room, status } of floorRooms) {
      const capacityStr = getCapacityStr(room.size)
      const nameWithCapacity = `${room.name}${capacityStr}`.padEnd(maxNameLength)
      const statusIcon = status.startsWith('Free') ? '🟢' : '🔴'
      lines.push(`${statusIcon} ${nameWithCapacity}  │  ${status}`)
    }
  }
  lines.push(`────────────────────────────────────────────────`)

  return [
    '**# 🚪 Meeting Room Availability**',
    '```',
    ...lines,
    '```',
    `_Updated at ${timeStr} PT_`,
    `## 📅 [Book a room](<${PORTAL_URL}/portal/book-room>)`
  ].join('\n')
}

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    // Fetch all bookable rooms
    const rooms = await getBookableRooms()

    // Fetch today's bookings for each room
    const roomStatuses = await Promise.all(
      rooms.map(async (room) => {
        const bookings = await getBookingsForRoom(room.id, startOfDay, endOfDay)
        const status = getRoomStatus(room, bookings, now)
        return { room, status }
      })
    )

    const message = formatMessage(roomStatuses, now)

    // Try to edit existing message, or send a new one if no message ID configured
    const channelId = DISCORD_CHANNELS.ROOM_AVAILABILITY
    const messageId = DISCORD_ROOM_AVAILABILITY_MESSAGE_ID

    if (!channelId) {
      return NextResponse.json(
        { error: 'Room availability channel not configured' },
        { status: 500 }
      )
    }

    let success: boolean
    if (messageId) {
      success = await editChannelMessage(channelId, messageId, message)
    } else {
      // No message ID - send a new message and log the ID
      const result = await sendChannelMessage(channelId, message)
      success = result.success
      if (result.messageId) {
        console.log(
          `[Room Availability] Created new message with ID: ${result.messageId}`
        )
        console.log(
          `Set DISCORD_ROOM_AVAILABILITY_MESSAGE_ID=${result.messageId} in your env`
        )
      }
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update Discord message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      roomCount: rooms.length,
      updatedAt: now.toISOString(),
    })
  } catch (error) {
    console.error('[Room Availability] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
