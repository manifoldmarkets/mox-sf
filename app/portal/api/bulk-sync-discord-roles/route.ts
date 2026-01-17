import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { syncDiscordRole, isDiscordConfigured } from '@/app/lib/discord';

interface PersonWithDiscord {
  id: string;
  name: string;
  discordUsername: string;
  tier: string | null;
  status: string | null;
}

/**
 * POST: Bulk sync Discord roles for all members with linked Discord usernames
 * Staff only
 */
export async function POST() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!isDiscordConfigured()) {
    return NextResponse.json({ error: 'Discord integration not configured' }, { status: 503 });
  }

  try {
    // Fetch all people with Discord usernames from Airtable
    const people: PersonWithDiscord[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People`);
      url.searchParams.set('fields[]', 'Name');
      url.searchParams.append('fields[]', 'Discord Username');
      url.searchParams.append('fields[]', 'Tier');
      url.searchParams.append('fields[]', 'Status');
      url.searchParams.set('filterByFormula', 'AND({Discord Username} != "", {Status} = "Joined")');
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
        if (record.fields['Discord Username']) {
          people.push({
            id: record.id,
            name: record.fields.Name || '',
            discordUsername: record.fields['Discord Username'],
            tier: record.fields.Tier || null,
            status: record.fields.Status || null,
          });
        }
      }

      offset = data.offset;
    } while (offset);

    // Sync each person's Discord role
    const results: {
      success: Array<{ name: string; discordUsername: string; role: string }>;
      failed: Array<{ name: string; discordUsername: string; error: string }>;
      skipped: Array<{ name: string; discordUsername: string; reason: string }>;
    } = {
      success: [],
      failed: [],
      skipped: [],
    };

    for (const person of people) {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await syncDiscordRole(person.discordUsername, person.tier, person.status);

      if (result.success) {
        results.success.push({
          name: person.name,
          discordUsername: person.discordUsername,
          role: result.roleAssigned || 'unknown',
        });
      } else if (result.error?.includes('not found')) {
        results.skipped.push({
          name: person.name,
          discordUsername: person.discordUsername,
          reason: result.error,
        });
      } else {
        results.failed.push({
          name: person.name,
          discordUsername: person.discordUsername,
          error: result.error || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: people.length,
      synced: results.success.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
      results,
    });
  } catch (error) {
    console.error('Error bulk syncing Discord roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
