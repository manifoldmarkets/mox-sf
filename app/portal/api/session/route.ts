import { getSession } from '@/app/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    return Response.json({
      isLoggedIn: session.isLoggedIn,
      userId: session.userId,
      email: session.email,
      isStaff: session.isStaff,
      viewingAsUserId: session.viewingAsUserId,
      viewingAsName: session.viewingAsName,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return Response.json({ isLoggedIn: false }, { status: 200 });
  }
}
