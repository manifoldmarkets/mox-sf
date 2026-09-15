import Link from 'next/link'
import { redirect } from 'next/navigation'
import { studioOwner } from '@/app/lib/studio-oauth'

export const dynamic = 'force-dynamic'

export default async function ConnectStudio({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string }>
}) {
  if (!(await studioOwner())) redirect('/portal/login')
  const { connected } = await searchParams
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1>Studio calendar</h1>
      {connected === '1' ? (
        <p>
          Google account connected.{' '}
          <Link href="/portal/studio">Book the studio</Link>
        </p>
      ) : (
        <>
          <p>
            Connect carolina@moxsf.com to create member bookings through your
            account. Google requests Calendar event access; Mox uses it only for
            the studio calendar.
          </p>
          <form action="/portal/api/studio-connect" method="post">
            <button type="submit">Connect Google Calendar</button>
          </form>
        </>
      )}
    </main>
  )
}
