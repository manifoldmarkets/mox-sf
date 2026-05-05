import { getSession, isCurrentlyStaff } from '@/app/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    const isStaff = session.isLoggedIn && session.userId
      ? await isCurrentlyStaff(session.userId)
      : false

    return Response.json({
      isLoggedIn: session.isLoggedIn,
      userId: session.userId,
      email: session.email,
      name: session.name,
      isStaff,
      viewingAsUserId: session.viewingAsUserId,
      viewingAsName: session.viewingAsName,
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return Response.json({ isLoggedIn: false }, { status: 200 })
  }
}
