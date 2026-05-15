import { redirect } from 'next/navigation'
import { getSession, isCurrentlyStaff } from '@/app/lib/session'
import Link from 'next/link'
import IssueDayPassForm from './IssueDayPassForm'

export const metadata = {
  title: 'Issue Day Pass | Admin | Mox',
}

export default async function IssueDayPassPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }

  if (!(await isCurrentlyStaff(session.userId))) {
    redirect('/portal')
  }

  return (
    <div>
      <Link href="/portal" className="back-link">
        &larr; back to portal
      </Link>

      <h1>issue a day pass</h1>

      <p className="muted">
        issue a complimentary pass directly — no stripe checkout. the recipient
        gets an email with a magic link to set up their profile and activate the
        pass when they arrive.
      </p>

      <IssueDayPassForm />
    </div>
  )
}
