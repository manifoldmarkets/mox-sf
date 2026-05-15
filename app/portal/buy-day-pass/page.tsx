import { getSession } from '@/app/lib/session'
import { canIssueGuestDayPass } from '@/app/lib/membership'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DayPassPurchase from '../DayPassPurchase'
import { getUserProfile } from '../profile'

export const dynamic = 'force-dynamic'

export default async function BuyDayPassPage() {
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

  const canDayPass = canIssueGuestDayPass({ status: profile.status, tier: profile.tier })
  if (!canDayPass) {
    redirect('/portal')
  }

  return (
    <>
      <Link href="/portal" className="back-link">
        &larr; back to portal
      </Link>

      <h1>buy a guest day pass</h1>

      {session.viewingAsUserId && session.viewingAsName && (
        <div className="alert info">
          <strong>admin mode:</strong> purchasing as{' '}
          <strong>{session.viewingAsName}</strong>.{' '}
          <Link href="/portal/api/view-as?clear=true">switch back</Link>
        </div>
      )}

      <DayPassPurchase
        stripeCustomerId={profile.stripeCustomerId}
        userName={profile.name}
        userEmail={profile.email}
      />
    </>
  )
}
