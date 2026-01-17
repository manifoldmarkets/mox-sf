import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

interface UpdateMapping {
  personId: string;
  discordUsername: string;
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const mappings: UpdateMapping[] = body.mappings;

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return NextResponse.json({ error: 'No mappings provided' }, { status: 400 });
    }

    if (mappings.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 mappings per request' }, { status: 400 });
    }

    // Validate all mappings
    for (const mapping of mappings) {
      if (!mapping.personId || typeof mapping.personId !== 'string') {
        return NextResponse.json({ error: 'Invalid personId' }, { status: 400 });
      }
      if (!mapping.discordUsername || typeof mapping.discordUsername !== 'string') {
        return NextResponse.json({ error: 'Invalid discordUsername' }, { status: 400 });
      }
      // Basic Discord username validation (2-32 chars, allows letters, numbers, underscores, periods)
      if (mapping.discordUsername.length < 2 || mapping.discordUsername.length > 32) {
        return NextResponse.json({
          error: `Invalid Discord username length: ${mapping.discordUsername}`
        }, { status: 400 });
      }
    }

    // Airtable batch update (max 10 records per request)
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

    // Process in batches of 10
    for (let i = 0; i < mappings.length; i += 10) {
      const batch = mappings.slice(i, i + 10);

      const records = batch.map(mapping => ({
        id: mapping.personId,
        fields: {
          'Discord Username': mapping.discordUsername,
        },
      }));

      const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        for (const record of data.records) {
          results.success.push(record.id);
        }
      } else {
        const errorText = await response.text();
        console.error('Airtable batch update error:', errorText);
        // Mark all in this batch as failed
        for (const mapping of batch) {
          results.failed.push(mapping.personId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.success.length,
      failed: results.failed.length,
      results,
    });
  } catch (error) {
    console.error('Error updating Discord usernames:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
