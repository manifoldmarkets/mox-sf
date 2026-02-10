import { getSession } from '../lib/session'

export default async function EAGBanner() {
  // Only show through Feb 17, 2026
  const now = new Date()
  const endDate = new Date('2026-02-18T00:00:00-08:00') // Feb 17 end of day PT
  if (now > endDate) {
    return null
  }

  const session = await getSession()
  const isLoggedIn = session.isLoggedIn === true

  return (
    <a
      href="/eag26"
      data-eag-banner
      className="block bg-amber-600 text-white text-sm text-center py-2 px-4 hover:bg-amber-700 transition-colors"
    >
      {isLoggedIn ? (
        <>
          Bring your friends visiting for EAG SF — free day passes available!
        </>
      ) : (
        <>
          In town for EAG SF? Get a free day pass to Mox!
        </>
      )}
    </a>
  )
}
