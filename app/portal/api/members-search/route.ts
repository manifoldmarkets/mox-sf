import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

// Normalize string by removing accents/diacritics
function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ members: [] });
  }

  try {
    // For accent-insensitive search, we need to:
    // 1. Fetch broader results from Airtable (search each word separately)
    // 2. Filter on the server with normalized strings

    // Split query into words and search for any of them
    const words = query.trim().split(/\s+/).filter(w => w.length >= 2);

    if (words.length === 0) {
      return NextResponse.json({ members: [] });
    }

    // Build OR conditions for each word in the query
    const searchConditions = words.map(word => {
      const escapedWord = word.replace(/"/g, '\\"');
      return `OR(
        SEARCH(LOWER("${escapedWord}"), LOWER({Name})),
        SEARCH(LOWER("${escapedWord}"), LOWER({Email}))
      )`;
    }).join(',');

    const formula = `AND(
      {Tier} != 'Staff',
      {Email} != '',
      OR(${searchConditions})
    )`;

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People?filterByFormula=${encodeURIComponent(formula)}&fields[]=Name&fields[]=Email&sort[0][field]=Name&sort[0][direction]=asc&maxRecords=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to search members' }, { status: response.status });
    }

    const data = await response.json();

    // Now filter with normalized string matching and rank by relevance
    const normalizedQuery = normalizeString(query.toLowerCase());

    const members = data.records
      ?.map((record: any) => {
        const name = record.fields.Name || '';
        const email = record.fields.Email || '';
        const normalizedName = normalizeString(name.toLowerCase());
        const normalizedEmail = normalizeString(email.toLowerCase());

        // Calculate relevance score (higher is better)
        let score = 0;

        // Exact match (case-insensitive, accent-insensitive) - highest priority
        if (normalizedName === normalizedQuery) {
          score += 1000;
        }
        // Starts with query - high priority
        else if (normalizedName.startsWith(normalizedQuery)) {
          score += 500;
        }
        // Contains query as whole word - medium priority
        else if (normalizedName.includes(` ${normalizedQuery}`) || normalizedName.includes(`${normalizedQuery} `)) {
          score += 250;
        }
        // Contains query anywhere - lower priority
        else if (normalizedName.includes(normalizedQuery)) {
          score += 100;
        }

        // Email matches (lower priority than name)
        if (normalizedEmail.startsWith(normalizedQuery)) {
          score += 50;
        } else if (normalizedEmail.includes(normalizedQuery)) {
          score += 25;
        }

        // Bonus: earlier position of match
        const nameIndex = normalizedName.indexOf(normalizedQuery);
        if (nameIndex !== -1) {
          score += Math.max(0, 50 - nameIndex);
        }

        return {
          id: record.id,
          name,
          email,
          score,
        };
      })
      .filter((member: any) => member.score > 0)
      .sort((a: any, b: any) => b.score - a.score) // Sort by score descending
      .slice(0, 20)
      .map(({ id, name, email }) => ({ id, name, email })) || [];

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error searching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
