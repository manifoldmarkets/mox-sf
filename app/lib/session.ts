import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { env } from './env'

export interface SessionData {
  userId: string
  email: string
  name?: string
  isLoggedIn: boolean
  isStaff?: boolean
  viewingAsUserId?: string
  viewingAsName?: string
}

const sessionOptions: SessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: 'mox-session',
  cookieOptions: {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function createSession(
  userId: string,
  email: string,
  name?: string,
  isStaff?: boolean
) {
  const session = await getSession()
  session.userId = userId
  session.email = email
  session.name = name
  session.isLoggedIn = true
  session.isStaff = isStaff
  await session.save()
}

export async function destroySession() {
  const session = await getSession()
  session.destroy()
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session.isLoggedIn === true
}
