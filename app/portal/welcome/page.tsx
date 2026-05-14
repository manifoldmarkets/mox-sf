import { getSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import { getUserProfile } from '../profile'
import WelcomeForm from './WelcomeForm'

export const dynamic = 'force-dynamic'

export default async function WelcomePage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }

  const effectiveUserId = session.viewingAsUserId || session.userId
  const profile = await getUserProfile(effectiveUserId)

  if (!profile) {
    return (
      <>
        <h1>error</h1>
        <p>unable to load your profile.</p>
      </>
    )
  }

  // Already complete — skip the welcome step.
  if (profile.name && profile.photo) {
    redirect('/portal')
  }

  return (
    <>
      <h1>welcome to mox</h1>
      <p>
        before you get started, we need your name and a photo. staff will see
        your photo when you arrive so they can recognize you.
      </p>

      <hr />

      <WelcomeForm
        userId={effectiveUserId}
        initialName={profile.name}
        existingPhoto={profile.photo}
      />
    </>
  )
}
