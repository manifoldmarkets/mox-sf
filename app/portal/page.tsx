import { getSession } from '@/app/lib/session'
import { getRecord, Tables } from '@/app/lib/airtable'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import ProfileEditForm from './profile/edit/ProfileEditForm'
import HostedEvents from './HostedEvents'
import MobilePortal from './MobilePortal'
import VerkadaPin from './VerkadaPin'
import AdminViewAsSelector from './AdminViewAsSelector'
import AdminBanner from './AdminBanner'
import MembershipStatus from './MembershipStatus'
import DayPassPurchase from './DayPassPurchase'

interface ProfileFields {
  Name?: string
  Email?: string
  Website?: string
  Photo?: Array<{ url: string }>
  'Show in directory'?: boolean
  'Stripe Customer ID'?: string
  Status?: string
  Tier?: string
  Org?: string[]
  'Discord Username'?: string
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }

  // Use viewingAsUserId if staff is viewing as another user, otherwise use their own userId
  const effectiveUserId = session.viewingAsUserId || session.userId

  // Fetch user profile from Airtable
  const profile = await getUserProfile(effectiveUserId)

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">Unable to load your profile.</p>
          <p className="text-gray-500 text-sm">
            Your session is valid but we couldn't fetch your profile data.
            Please try{' '}
            <Link
              href="/portal/login"
              className="text-blue-600 hover:underline"
            >
              logging in again
            </Link>{' '}
            or contact support if the issue persists.
          </p>
        </div>
      </div>
    )
  }

  // TODO: This portal renders BOTH mobile and desktop views simultaneously (hidden via CSS).
  // This causes duplicate component mounts, duplicate API calls, and wasted resources.
  // Refactor to use a useMediaQuery hook to conditionally render only one view:
  //   const isMobile = useMediaQuery('(max-width: 1024px)')
  //   return isMobile ? <MobilePortal /> : <DesktopPortal />
  // This will require splitting this server component into a client wrapper.
  // For now, the backend dedupe in verkada-pin/route.ts mitigates the duplicate API calls.

  const verkadaPin = <VerkadaPin isViewingAs={!!session.viewingAsUserId} />

  // Mobile view - separate screens for each section
  const mobileView = (
    <div className="lg:hidden">
      <MobilePortal
        profile={profile}
        userId={effectiveUserId}
        isStaff={session.isStaff}
        viewingAsUserId={session.viewingAsUserId}
        viewingAsName={session.viewingAsName}
        status={profile.status}
        tier={profile.tier}
        orgId={profile.orgId}
        verkadaPinSlot={verkadaPin}
      />
    </div>
  )

  // Desktop view - original layout
  const desktopView = (
    <div className="hidden lg:block min-h-screen bg-background-page dark:bg-background-page-dark font-sans">
      {/* Admin banner when viewing as another user */}
      {session.viewingAsUserId && session.viewingAsName && (
        <AdminBanner viewingAsName={session.viewingAsName} />
      )}

      <div className="flex">
        {/* Desktop Left Sidebar */}
        <aside className="w-64 bg-background-surface dark:bg-background-surface-dark border-r border-border-light dark:border-border-light-dark sticky top-0 h-screen">
          <div className="px-4 py-6 h-full flex flex-col">
            <Link
              href="/"
              className="text-text-tertiary dark:text-text-tertiary-dark hover:text-brand dark:hover:text-brand-dark-mode text-sm flex items-center gap-2 mb-8 transition-colors px-4 py-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Home</span>
            </Link>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              <a
                href="#subscription"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark hover:text-brand dark:hover:text-brand-dark-mode transition-all group"
              >
                <svg
                  className="w-5 h-5 text-text-muted dark:text-text-muted-dark group-hover:text-brand dark:group-hover:text-brand-dark-mode"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>Subscription</span>
              </a>
              <a
                href="#events"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark hover:text-brand dark:hover:text-brand-dark-mode transition-all group"
              >
                <svg
                  className="w-5 h-5 text-text-muted dark:text-text-muted-dark group-hover:text-brand dark:group-hover:text-brand-dark-mode"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Events</span>
              </a>
              <a
                href="#profile"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark hover:text-brand dark:hover:text-brand-dark-mode transition-all group"
              >
                <svg
                  className="w-5 h-5 text-text-muted dark:text-text-muted-dark group-hover:text-brand dark:group-hover:text-brand-dark-mode"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Profile</span>
              </a>
            </nav>

            <div className="border-t border-border-light dark:border-border-light-dark pt-4 mt-auto">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Admin view-as selector */}
            {session.isStaff && (
              <div className="space-y-4 mb-6">
                <AdminViewAsSelector
                  currentViewingAsUserId={session.viewingAsUserId}
                  currentViewingAsName={session.viewingAsName}
                />
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4">
                  <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Admin Tools
                  </div>
                  <Link
                    href="/portal/admin/discord-mapping"
                    className="text-sm text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    Discord Username Mapping Tool →
                  </Link>
                </div>
              </div>
            )}

            {/* Unified Membership Status - shows either subscription info or invite flow */}
            <div id="subscription" className="scroll-mt-8">
              <MembershipStatus
                status={profile.status}
                firstName={profile.name.split(' ')[0]}
                stripeCustomerId={profile.stripeCustomerId}
                tier={profile.tier}
                orgId={profile.orgId}
              />
            </div>

            {/* Day Pass Purchase - available to all existing members */}
            <DayPassPurchase
              stripeCustomerId={profile.stripeCustomerId}
              userName={profile.name}
              userEmail={profile.email}
            />

            {verkadaPin}

            <div id="events" className="scroll-mt-8">
              <HostedEvents userName={profile.name} />
            </div>

            <div id="profile" className="scroll-mt-8">
              <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6">
                <h1 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-6 font-display">
                  Profile
                </h1>
                <ProfileEditForm profile={profile} userId={effectiveUserId} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  )
}

async function getUserProfile(recordId: string): Promise<{
  name: string
  email: string
  website: string
  photo: string | null
  directoryVisible: boolean
  stripeCustomerId: string | null
  status: string | null
  tier: string | null
  orgId: string | null
  discordUsername: string | null
  error?: string
} | null> {
  const record = await getRecord<ProfileFields>(Tables.People, recordId)

  if (!record) {
    return null
  }

  const fields = record.fields

  // Airtable omits checkbox fields when unchecked, so we need to handle undefined
  const showInDirectory = fields['Show in directory']

  return {
    name: fields.Name || '',
    email: fields.Email || '',
    website: fields.Website || '',
    photo: fields.Photo?.[0]?.url || null,
    directoryVisible: showInDirectory === true, // Will be false if field is undefined/unchecked
    stripeCustomerId: fields['Stripe Customer ID'] || null,
    status: fields.Status || null,
    tier: fields.Tier || null,
    orgId: fields.Org?.[0] || null, // Org is a linked record array, get first one
    discordUsername: fields['Discord Username'] || null,
  }
}
