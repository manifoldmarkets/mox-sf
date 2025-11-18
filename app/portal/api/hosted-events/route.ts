import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userName = searchParams.get('userName');

  if (!userName) {
    return NextResponse.json(
      { message: 'User name is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch events from Airtable where the user is listed in "Hosted by" field
    // "Hosted by" is a linked field to the People table
    // Show future events (including cancelled ones)
    const today = new Date().toISOString().split('T')[0];
    const formula = `AND(SEARCH("${userName.replace(/"/g, '\\"')}", ARRAYJOIN({Hosted by}, ", ")), IS_AFTER({Start Date}, "${today}"))`;
    const encodedFormula = encodeURIComponent(formula);

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Events?filterByFormula=${encodedFormula}&maxRecords=100&sort[0][field]=Start%20Date&sort[0][direction]=asc`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch events from Airtable' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the events to match our EventData interface
    const events = data.records?.map((record: any) => {
      // Handle Host Name - it's a formula field that returns a string
      const hostName = record.fields['Host Name'];
      // Handle Assigned Rooms - it's a lookup field that returns an array
      const assignedRooms = record.fields['Name (from Assigned Rooms)'];

      return {
        id: record.id,
        name: record.fields.Name || '',
        startDate: record.fields['Start Date'] || '',
        endDate: record.fields['End Date'] || undefined,
        description: record.fields['Event Description'] || undefined,
        assignedRooms: Array.isArray(assignedRooms) ? assignedRooms.join(', ') : assignedRooms || undefined,
        notes: record.fields.Notes || undefined,
        type: record.fields.Type || undefined,
        status: record.fields.Status || undefined,
        url: record.fields.URL || undefined,
        host: hostName || '',
      };
    }) || [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching hosted events:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
