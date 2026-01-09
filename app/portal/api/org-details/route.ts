import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  // Verify user is logged in
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
  }

  try {
    // Fetch org details from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Orgs/${orgId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Org not found' }, { status: 404 });
    }

    const data = await response.json();
    const fields = data.fields;

    return NextResponse.json({
      name: fields.Name || 'Unknown',
    });
  } catch (error) {
    console.error('Error fetching org details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
