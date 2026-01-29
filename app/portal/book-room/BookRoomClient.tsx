'use client'

import React, { useState, useEffect } from 'react'

interface Room {
  id: string
  name: string
  floor?: string
  roomNumber?: string
  size?: number
  status?: string
  bookable: boolean
}

interface Booking {
  id: string
  roomId: string
  roomName: string
  userId: string
  startDate: string
  endDate: string
  purpose?: string
  status: 'Confirmed' | 'Cancelled'
}

interface BookRoomClientProps {
  userId: string
  userName: string
}

// Generate hourly time slots from 8am to 10pm
function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 8; hour <= 22; hour++) {
    const hourStr = hour.toString().padStart(2, '0')
    slots.push(`${hourStr}:00`)
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export default function BookRoomClient({ userId, userName }: BookRoomClientProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [purpose, setPurpose] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Load rooms and user's bookings
  useEffect(() => {
    async function loadData() {
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch('/portal/api/rooms'),
          fetch('/portal/api/room-bookings'),
        ])

        if (!roomsRes.ok || !bookingsRes.ok) {
          throw new Error('Failed to load data')
        }

        const roomsData = await roomsRes.json()
        const bookingsData = await bookingsRes.json()

        setRooms(roomsData.rooms || [])
        setBookings(bookingsData.bookings || [])
        setLoading(false)
      } catch (err) {
        setError('Failed to load rooms and bookings')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load bookings for ALL rooms on selected date
  useEffect(() => {
    if (!selectedDate || rooms.length === 0) {
      setDayBookings([])
      return
    }

    async function loadDayBookings() {
      try {
        const startOfDay = new Date(`${selectedDate}T00:00:00`)
        const endOfDay = new Date(`${selectedDate}T23:59:59`)

        // Fetch bookings for all rooms in parallel
        const results = await Promise.all(
          rooms.map((room) =>
            fetch(
              `/portal/api/room-bookings?roomId=${room.id}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
            ).then((res) => (res.ok ? res.json() : { bookings: [] }))
          )
        )

        // Flatten all bookings into one array
        const allBookings = results.flatMap((r) => r.bookings || [])
        setDayBookings(allBookings)
      } catch {
        // Silently fail - calendar view is secondary
      }
    }

    loadDayBookings()
  }, [selectedDate, rooms])

  // Set default date and prefill times to nearest hour
  // If after booking hours (9pm), default to next day at 8am
  useEffect(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const nextHour = currentHour + 1

    // Determine if we should use today or tomorrow
    let bookingDate: Date
    let defaultStartHour: number

    if (nextHour >= 22 || currentHour >= 21) {
      // After 9pm - use tomorrow at 8am
      bookingDate = new Date(now)
      bookingDate.setDate(bookingDate.getDate() + 1)
      defaultStartHour = 8
    } else if (nextHour < 8) {
      // Before 8am - use today at 8am
      bookingDate = now
      defaultStartHour = 8
    } else {
      // During booking hours - use today at next hour
      bookingDate = now
      defaultStartHour = nextHour
    }

    // Format date as YYYY-MM-DD in local time (not UTC)
    setSelectedDate(formatLocalDate(bookingDate))

    setStartTime(`${defaultStartHour.toString().padStart(2, '0')}:00`)
    if (defaultStartHour < 22) {
      setEndTime(`${(defaultStartHour + 1).toString().padStart(2, '0')}:00`)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)
    setSubmitting(true)

    if (!selectedRoom || !selectedDate || !startTime || !endTime) {
      setSubmitError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    // Construct ISO datetime strings
    const startDate = new Date(`${selectedDate}T${startTime}:00`)
    const endDate = new Date(`${selectedDate}T${endTime}:00`)

    try {
      const response = await fetch('/portal/api/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          purpose: purpose || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Failed to create booking')
        setSubmitting(false)
        return
      }

      // Success - add to bookings list and day view, reset form
      const newBooking = { ...data.booking, roomId: selectedRoom }
      setBookings((prev) => [...prev, newBooking])
      setDayBookings((prev) => [...prev, newBooking])
      setSubmitSuccess(true)
      setStartTime('')
      setEndTime('')
      setPurpose('')
      setSubmitting(false)
    } catch (err) {
      setSubmitError('Failed to create booking')
      setSubmitting(false)
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      const response = await fetch(`/portal/api/room-bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to cancel booking')
        return
      }

      // Remove from list
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    } catch (err) {
      alert('Failed to cancel booking')
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <p className="loading">loading rooms...</p>
  }

  if (error) {
    return <p className="error">{error}</p>
  }

  // Filter to only future bookings
  const futureBookings = bookings.filter(
    (b) => new Date(b.endDate) > new Date()
  )

  // Check if a time slot is booked for a specific room
  const getSlotBooking = (roomId: string, slot: string): Booking | undefined => {
    const slotHour = parseInt(slot.split(':')[0])
    return dayBookings.find((b) => {
      if (b.roomId !== roomId) return false
      const startHour = new Date(b.startDate).getHours()
      const endHour = new Date(b.endDate).getHours()
      return slotHour >= startHour && slotHour < endHour
    })
  }

  return (
    <>
      {/* Booking Form */}
      <section>
        <h2>new booking</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">date *</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={formatLocalDate(new Date())}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="room">room *</label>
            <select
              id="room"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              required
            >
              <option value="">select a room...</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                  {room.floor && ` (floor ${room.floor})`}
                  {room.size && ` - ${room.size} people`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startTime">start time *</label>
            <select
              id="startTime"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value)
                // Auto-set end time to 1 hour later if not set
                if (!endTime || endTime <= e.target.value) {
                  const startHour = parseInt(e.target.value.split(':')[0])
                  if (startHour < 22) {
                    setEndTime(`${(startHour + 1).toString().padStart(2, '0')}:00`)
                  }
                }
              }}
              required
            >
              <option value="">select start time...</option>
              {TIME_SLOTS.slice(0, -1).map((slot) => (
                <option key={slot} value={slot}>
                  {formatTimeSlot(slot)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="endTime">end time *</label>
            <select
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            >
              <option value="">select end time...</option>
              {TIME_SLOTS.filter((slot) => slot > startTime).map((slot) => (
                <option key={slot} value={slot}>
                  {formatTimeSlot(slot)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">purpose (optional)</label>
            <input
              type="text"
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., team meeting, call, interview"
            />
          </div>

          {submitError && (
            <div className="alert error">
              <p>{submitError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="alert success">
              <p>Booking created successfully!</p>
            </div>
          )}

          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'booking...' : 'book room'}
          </button>
        </form>

      </section>

      {/* Day Calendar View - Rooms as rows, times as columns, grouped by floor */}
      {selectedDate && rooms.length > 0 && (
        <section style={{ marginTop: '20px' }}>
          <h2>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: '0.85em', borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px 8px', textAlign: 'left', minWidth: '120px' }}>room</th>
                  {TIME_SLOTS.slice(0, -1).map((slot) => (
                    <th
                      key={slot}
                      style={{
                        padding: '4px 4px',
                        textAlign: 'center',
                        minWidth: '40px',
                        fontSize: '0.8em',
                        fontWeight: (startTime && slot >= startTime && endTime && slot < endTime) ? 'bold' : 'normal',
                      }}
                    >
                      {formatTimeSlot(slot).replace(':00 ', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Group rooms by floor (higher floors first) */}
                {Array.from(new Set(rooms.map(r => r.floor || 'Other')))
                  .sort((a, b) => {
                    // Sort numerically in descending order, 'Other' goes last
                    if (a === 'Other') return 1
                    if (b === 'Other') return -1
                    return parseInt(b) - parseInt(a)
                  })
                  .map((floor) => {
                    const floorRooms = rooms.filter(r => (r.floor || 'Other') === floor)
                    return (
                      <React.Fragment key={floor}>
                        <tr>
                          <td
                            colSpan={TIME_SLOTS.length}
                            style={{
                              padding: '8px 8px 4px',
                              fontWeight: 'bold',
                              color: 'var(--text-muted)',
                              fontSize: '0.9em',
                              borderBottom: '1px solid var(--border-color)',
                            }}
                          >
                            Floor {floor}
                          </td>
                        </tr>
                        {floorRooms.map((room) => (
                          <tr key={room.id}>
                            <td
                              style={{
                                padding: '2px 8px',
                                whiteSpace: 'nowrap',
                                fontWeight: selectedRoom === room.id ? 'bold' : 'normal',
                                background: selectedRoom === room.id ? 'var(--bg-secondary)' : 'transparent',
                              }}
                            >
                              {room.name}
                              {room.size && <span className="muted"> ({room.size})</span>}
                            </td>
                            {TIME_SLOTS.slice(0, -1).map((slot) => {
                              const booking = getSlotBooking(room.id, slot)
                              const isBooked = !!booking
                              const isSelected =
                                selectedRoom === room.id &&
                                startTime &&
                                endTime &&
                                slot >= startTime &&
                                slot < endTime

                              return (
                                <td
                                  key={slot}
                                  style={{
                                    padding: '2px 2px',
                                    textAlign: 'center',
                                    background: isBooked
                                      ? 'var(--danger-bg)'
                                      : isSelected
                                      ? 'var(--success-bg)'
                                      : 'var(--bg-secondary)',
                                    border: `1px solid ${
                                      isBooked
                                        ? 'var(--danger-border)'
                                        : isSelected
                                        ? 'var(--success-border)'
                                        : 'var(--border-color)'
                                    }`,
                                    cursor: isBooked ? 'not-allowed' : 'pointer',
                                  }}
                                  title={isBooked ? `Booked${booking.purpose ? `: ${booking.purpose}` : ''}` : 'Available'}
                                  onClick={() => {
                                    if (!isBooked) {
                                      setSelectedRoom(room.id)
                                      const slotHour = parseInt(slot.split(':')[0])
                                      setStartTime(slot)
                                      if (slotHour < 22) {
                                        setEndTime(`${(slotHour + 1).toString().padStart(2, '0')}:00`)
                                      }
                                    }
                                  }}
                                >
                                  {isBooked ? (
                                    <span style={{ color: 'var(--danger-text)' }}>x</span>
                                  ) : isSelected ? (
                                    <span style={{ color: 'var(--success-text)' }}>*</span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ marginTop: '10px', fontSize: '0.85em' }}>
            click a slot to select it | x = booked | * = your selection
          </p>
        </section>
      )}

      <hr />

      {/* User's Bookings */}
      <section>
        <h2>your bookings</h2>
        {futureBookings.length === 0 ? (
          <p className="muted">no upcoming bookings</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>room</th>
                <th>when</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {futureBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.roomName}</td>
                  <td>
                    {formatDateTime(booking.startDate)}
                    {' - '}
                    {new Date(booking.endDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {booking.purpose && (
                      <span className="muted"> ({booking.purpose})</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="small danger"
                      onClick={() => handleCancel(booking.id)}
                    >
                      cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}

function formatTimeSlot(time: string): string {
  const hour = parseInt(time.split(':')[0])
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${ampm}`
}

// Format date as YYYY-MM-DD in local time (avoids UTC conversion issues)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
