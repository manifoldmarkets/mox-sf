import { NextRequest, NextResponse } from 'next/server'
import { updateRecord, Tables } from '@/app/lib/airtable'

interface EventFields {
  Name?: string
  'Start Date'?: string
  'End Date'?: string
  'Event Description'?: string
  Notes?: string
  Type?: string
  Status?: string
  URL?: string
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      name,
      startDate,
      endDate,
      description,
      notes,
      type,
      status,
      url,
      // assignedRooms is not included - it's managed by staff only
    } = body

    if (!id) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Prepare the fields to update
    const fields: Partial<EventFields> = {}

    if (name !== undefined) fields.Name = name
    if (startDate !== undefined) fields['Start Date'] = startDate
    if (endDate !== undefined && endDate !== '') {
      fields['End Date'] = endDate
    }
    if (description !== undefined) fields['Event Description'] = description
    if (notes !== undefined) fields.Notes = notes
    if (type !== undefined) fields.Type = type
    if (status !== undefined) fields.Status = status
    if (url !== undefined) fields.URL = url

    // Update the event in Airtable
    const data = await updateRecord<EventFields>(Tables.Events, id, fields)

    return NextResponse.json({
      message: 'Event updated successfully',
      event: data,
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
