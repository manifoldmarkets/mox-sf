import { NextRequest, NextResponse } from 'next/server'
import { createRecord, findRecords, Tables } from '@/app/lib/airtable'
import { getSession } from '@/app/lib/session'

const VALID_TYPES = ['Public', 'Members', 'Private']
const VALID_STATUSES = ['Idea', 'Confirmed']

interface CreateEventBody {
  name: string
  startDate: string
  endDate?: string
  description?: string
  type: string
  status: string
  url?: string
  imageUrl?: string
  notes?: string
  coHosts?: string[]
}

async function hasHostedConfirmedEvent(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const events = await findRecords(
      Tables.Events,
      `AND({Status}="Confirmed", IS_BEFORE({Start Date}, "${today}"))`,
      {
        fields: ['Name', 'Hosted by'],
        maxRecords: 100,
      }
    )

    return events.some((event) => {
      const hostedBy = (event.fields as Record<string, unknown>)['Hosted by']
      return Array.isArray(hostedBy) && hostedBy.includes(userId)
    })
  } catch (error) {
    console.error('Error checking host history:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: CreateEventBody = await request.json()

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 })
    }

    if (!body.startDate) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 })
    }

    if (!body.type || !VALID_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be Public, Members, or Private' },
        { status: 400 }
      )
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be Idea or Confirmed' },
        { status: 400 }
      )
    }

    const userId = session.viewingAsUserId || session.userId

    // If user chose "Confirmed", verify they have past confirmed events
    let status = body.status
    if (status === 'Confirmed') {
      const canAutoConfirm = await hasHostedConfirmedEvent(userId)
      if (!canAutoConfirm) {
        status = 'Idea'
      }
    }

    // Build Airtable fields
    const fields: Record<string, unknown> = {
      Name: body.name.trim(),
      'Start Date': body.startDate,
      Type: body.type,
      Status: status,
      'Hosted by': [userId, ...(body.coHosts || [])],
    }

    if (body.endDate) {
      fields['End Date'] = body.endDate
    }

    if (body.description?.trim()) {
      fields['Event Description'] = body.description.trim()
    }

    if (body.url?.trim()) {
      fields['URL'] = body.url.trim()
    }

    if (body.imageUrl?.trim()) {
      fields['Event Poster'] = [{ url: body.imageUrl.trim() }]
    }

    if (body.notes?.trim()) {
      fields['Notes'] = body.notes.trim()
    }

    const record = await createRecord(Tables.Events, fields)

    return NextResponse.json({
      event: { id: record.id },
      status,
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event. Please try again.' },
      { status: 500 }
    )
  }
}
