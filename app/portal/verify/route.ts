import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/portal/login?error=invalid', request.url));
  }

  try {
    // Verify token and get user
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.redirect(new URL('/portal/login?error=expired', request.url));
    }

    // Create session
    await createSession(user.id, user.email, user.name);

    // Clear the token from Airtable (one-time use)
    await clearToken(user.id);

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.redirect(new URL('/portal/login?error=server', request.url));
  }
}

async function verifyToken(token: string) {
  const formula = `{magic_link_token} = '${token.replace(/'/g, "\\'")}'`;

  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People?filterByFormula=${encodeURIComponent(formula)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      cache: 'no-store',
    }
  );

  const data = await response.json();

  if (!data.records || data.records.length === 0) {
    return null;
  }

  const record = data.records[0];
  const expiresAt = new Date(record.fields.token_expires);

  // Check if token is expired
  if (expiresAt < new Date()) {
    return null;
  }

  return {
    id: record.id,
    email: record.fields.Email,
    name: record.fields.Name,
  };
}

async function clearToken(recordId: string) {
  await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          magic_link_token: '',
          token_expires: null,
        },
      }),
    }
  );
}
