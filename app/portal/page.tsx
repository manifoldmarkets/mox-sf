import { getSession } from '@/app/lib/session'
import { getRecord, Tables } from '@/app/lib/airtable'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import ProfileEditForm from './profile/edit/ProfileEditForm'
import HostedEvents from './HostedEvents'
import VerkadaPin from './VerkadaPin'
import AdminViewAsSelector from './AdminViewAsSelector'
import MembershipStatus from './MembershipStatus'
import DayPassPurchase from './DayPassPurchase'
import SubscriptionInfo from './SubscriptionInfo'

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
  'Work thing'?: string
  'Work thing URL'?: string
  'Fun thing'?: string
  'Fun thing URL'?: string
}

export default async function DashboardPage() {
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
        <p>
          your session is valid but we couldn't fetch your profile data. please
          try <Link href="/portal/login">logging in again</Link> or contact
          support if the issue persists.
        </p>
      </>
    )
  }

  return (
    <>
      <Link href="/" className="back-link">
        ← back to home
      </Link>

      <h1>member portal</h1>
      <p className="muted">
        logged in as {session.name || profile.name}
        {session.isStaff && ' (staff)'}
      </p>

      {/* Admin banner when viewing as another user */}
      {session.viewingAsUserId && session.viewingAsName && (
        <div className="alert info">
          <strong>admin mode:</strong> viewing portal as{' '}
          <strong>{session.viewingAsName}</strong>.{' '}
          <Link href="/portal/api/view-as?clear=true">switch back</Link>
        </div>
      )}

      {/* Admin tools - collapsible section at top */}
      {session.isStaff && (
        <details className="admin-section">
          <summary>admin tools</summary>
          <div style={{ marginTop: '10px' }}>
            <AdminViewAsSelector />
            <p style={{ marginTop: '10px' }}>
              <Link href="/portal/admin/discord-mapping">
                → discord username mapping tool
              </Link>
            </p>
          </div>
        </details>
      )}

      <hr />

      {/* Membership Status */}
      <section>
        <MembershipStatus
          status={profile.status}
          firstName={profile.name.split(' ')[0]}
          stripeCustomerId={profile.stripeCustomerId}
          tier={profile.tier}
          orgId={profile.orgId}
        />
      </section>

      {/* Subscription details (if has Stripe customer) */}
      {profile.stripeCustomerId && (
        <section>
          <SubscriptionInfo stripeCustomerId={profile.stripeCustomerId} />
        </section>
      )}

      <hr />

      {/* Door Access */}
      <section>
        <VerkadaPin isViewingAs={!!session.viewingAsUserId} tier={profile.tier} />
      </section>

      <hr />

      {/* Day Pass */}
      <section>
        <DayPassPurchase
          stripeCustomerId={profile.stripeCustomerId}
          userName={profile.name}
          userEmail={profile.email}
        />
      </section>

      <hr />

      {/* Events */}
      <section>
        <HostedEvents userName={profile.name} />
      </section>

      <hr />

      {/* Profile */}
      <section>
        <h2>profile</h2>
        <ProfileEditForm profile={profile} userId={effectiveUserId} />
      </section>

      <hr />

      <LogoutButton />
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
  workThing: string | null
  workThingUrl: string | null
  funThing: string | null
  funThingUrl: string | null
  error?: string
} | null> {
  const record = await getRecord<ProfileFields>(Tables.People, recordId)

  if (!record) {
    return null
  }

  const fields = record.fields
  const showInDirectory = fields['Show in directory']

  return {
    name: fields.Name || '',
    email: fields.Email || '',
    website: fields.Website || '',
    photo: fields.Photo?.[0]?.url || null,
    directoryVisible: showInDirectory === true,
    stripeCustomerId: fields['Stripe Customer ID'] || null,
    status: fields.Status || null,
    tier: fields.Tier || null,
    orgId: fields.Org?.[0] || null,
    discordUsername: fields['Discord Username'] || null,
    workThing: fields['Work thing'] || null,
    workThingUrl: fields['Work thing URL'] || null,
    funThing: fields['Fun thing'] || null,
    funThingUrl: fields['Fun thing URL'] || null,
  }
}
