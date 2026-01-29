import { getSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookRoomClient from './BookRoomClient'

export const dynamic = 'force-dynamic'

export default async function BookRoomPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }

  const userId = session.viewingAsUserId || session.userId
  const userName = session.viewingAsName || session.name || ''

  return (
    <>
      <Link href="/portal" className="back-link">
        ← back to portal
      </Link>

      <h1>book a room</h1>

      {session.viewingAsUserId && session.viewingAsName && (
        <div className="alert info">
          <strong>admin mode:</strong> booking as{' '}
          <strong>{session.viewingAsName}</strong>.{' '}
          <Link href="/portal/api/view-as?clear=true">switch back</Link>
        </div>
      )}

      <BookRoomClient userId={userId} userName={userName} />
    </>
  )
}
