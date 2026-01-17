import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

export interface PersonForMapping {
  id: string;
  name: string;
  email: string;
  discordUsername: string | null;
}

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const allPeople: PersonForMapping[] = [];
    let offset: string | undefined;

    // Paginate through all records
    do {
      const url = new URL(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People`);
      url.searchParams.set('fields[]', 'Name');
      url.searchParams.append('fields[]', 'Email');
      url.searchParams.append('fields[]', 'Discord Username');
      url.searchParams.set('filterByFormula', '{Email} != ""');
      url.searchParams.set('sort[0][field]', 'Name');
      url.searchParams.set('sort[0][direction]', 'asc');
      url.searchParams.set('pageSize', '100');
      if (offset) {
        url.searchParams.set('offset', offset);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('Airtable fetch error:', await response.text());
        return NextResponse.json({ error: 'Failed to fetch people' }, { status: response.status });
      }

      const data = await response.json();

      for (const record of data.records) {
        allPeople.push({
          id: record.id,
          name: record.fields.Name || '',
          email: record.fields.Email || '',
          discordUsername: record.fields['Discord Username'] || null,
        });
      }

      offset = data.offset;
    } while (offset);

    return NextResponse.json({ people: allPeople });
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
