import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/session'
import DayPassMarketing from './DayPassMarketing'

export const dynamic = 'force-dynamic'

export default async function DayPassPage() {
  const session = await getSession()

  // Logged-in users buy day passes from inside the portal, where pricing
  // can take their membership tier into account.
  if (session.isLoggedIn) {
    redirect('/portal')
  }

  return <DayPassMarketing />
}
