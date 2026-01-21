import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { getRecord, Tables } from '@/app/lib/airtable'

interface PersonFields {
  Name?: string
  Email?: string
  Tier?: string
}

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
  const record = await getRecord<PersonFields>(Tables.People, recordId, { revalidate: false })

  if (!record) {
    return null
  }

  return {
    id: record.id,
    name: record.fields.Name,
    email: record.fields.Email,
    tier: record.fields.Tier,
  }
}
