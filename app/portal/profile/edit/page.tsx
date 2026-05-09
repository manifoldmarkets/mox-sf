import { getSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileEditForm from './ProfileEditForm'
import { getUserProfile } from '../../profile'

export const dynamic = 'force-dynamic'

export default async function ProfileEditPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }

  const effectiveUserId = session.viewingAsUserId || session.userId
  const profile = await getUserProfile(effectiveUserId)

  if (!profile) {
    return (
      <>
        <Link href="/portal" className="back-link">
          &larr; back to portal
        </Link>
        <h1>error</h1>
        <p>unable to load your profile.</p>
      </>
    )
  }

  return (
    <>
      <Link href="/portal" className="back-link">
        &larr; back to portal
      </Link>

      <h1>edit profile</h1>

      {session.viewingAsUserId && session.viewingAsName && (
        <div className="alert info">
          <strong>admin mode:</strong> editing profile as{' '}
          <strong>{session.viewingAsName}</strong>.{' '}
          <Link href="/portal/api/view-as?clear=true">switch back</Link>
        </div>
      )}

      <ProfileEditForm profile={profile} userId={effectiveUserId} />
    </>
  )
}
