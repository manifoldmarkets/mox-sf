import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Prepare the fields to update in Airtable
    const fields: Record<string, any> = {};

    if (name !== undefined) fields.Name = name;
    if (startDate !== undefined) fields['Start Date'] = startDate;
    if (endDate !== undefined && endDate !== '') {
      fields['End Date'] = endDate;
    }
    if (description !== undefined) fields['Event Description'] = description;
    // Note: Assigned Rooms is not editable by users
    if (notes !== undefined) fields.Notes = notes;
    if (type !== undefined) fields.Type = type;
    if (status !== undefined) fields.Status = status;
    if (url !== undefined) fields.URL = url;

    // Update the event in Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Events/${id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error:', errorData);
      return NextResponse.json(
        { message: 'Failed to update event in Airtable' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      message: 'Event updated successfully',
      event: data,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
