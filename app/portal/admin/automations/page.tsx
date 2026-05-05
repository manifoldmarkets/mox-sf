import { redirect } from 'next/navigation'
import { getSession, isCurrentlyStaff } from '@/app/lib/session'
import { AUTOMATIONS } from '@/app/lib/automations-manifest'
import Link from 'next/link'
import AutomationsList from './AutomationsList'

export const metadata = {
  title: 'Automations | Admin | Mox',
}

export default async function AutomationsPage() {
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

      <h1>automations ({AUTOMATIONS.length})</h1>

      <p className="muted" style={{ marginBottom: 20 }}>
        auto-discovered from the codebase. shows what&apos;s running, how it&apos;s triggered, and where to find it.
      </p>

      <AutomationsList automations={AUTOMATIONS} />
    </div>
  )
}
