import { getSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SubmitEventClient from './SubmitEventClient'

export const dynamic = 'force-dynamic'

export default async function SubmitEventPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }

  const userId = session.viewingAsUserId || session.userId
  const userName = session.viewingAsName || session.name || ''

  return (
    <>
      <Link href="/portal" className="back-link">
        &larr; back to portal
      </Link>

      <h1>submit an event</h1>

      <p>
        want to host something at Mox? paste your Luma or Partiful link to
        auto-fill the details, or fill in the form manually.
      </p>

      <p className="muted">
        <a href="https://moxsf.notion.site/run-an-event" target="_blank" rel="noopener noreferrer">
          info on member-led events
        </a>
        {' · '}
        <a href="https://moxsf.notion.site/run-large-event" target="_blank" rel="noopener noreferrer">
          info on paid events
        </a>
      </p>

      <hr />

      {session.viewingAsUserId && session.viewingAsName && (
        <div className="alert info">
          <strong>admin mode:</strong> submitting as{' '}
          <strong>{session.viewingAsName}</strong>.{' '}
          <Link href="/portal/api/view-as?clear=true">switch back</Link>
        </div>
      )}

      <SubmitEventClient userId={userId} userName={userName} />
    </>
  )
}
