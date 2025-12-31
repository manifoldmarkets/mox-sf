import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId, userName } = await request.json();

    if (!userId) {
      // Clear view-as mode
      session.viewingAsUserId = undefined;
      session.viewingAsName = undefined;
      await session.save();
      return NextResponse.json({ success: true, viewingAs: null });
    }

    // Validate that the target user exists and is not staff
    const user = await fetchUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.tier === 'Staff') {
      return NextResponse.json({ error: 'Cannot view as other staff members' }, { status: 403 });
    }

    // Set view-as mode
    session.viewingAsUserId = userId;
    session.viewingAsName = userName || user.name;
    await session.save();

    return NextResponse.json({
      success: true,
      viewingAs: { userId, userName: session.viewingAsName }
    });
  } catch (error) {
    console.error('Error in view-as:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function fetchUser(recordId: string) {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${recordId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.fields.Name,
    email: data.fields.Email,
    tier: data.fields.Tier,
  };
}
