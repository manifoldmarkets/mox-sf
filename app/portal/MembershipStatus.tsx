'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function MembershipStatus({
  status,
  firstName,
  stripeCustomerId,
  tier,
  orgId,
}: {
  status?: string | null
  firstName: string
  stripeCustomerId: string | null
  tier?: string | null
  orgId?: string | null
}) {
  const [orgName, setOrgName] = useState<string | null>(null)
  const [loadingOrg, setLoadingOrg] = useState(false)

  useEffect(() => {
    if (tier === 'Private Office' && orgId) {
      setLoadingOrg(true)
      fetch(`/portal/api/org-details?orgId=${orgId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrgName(data.name || null)
          setLoadingOrg(false)
        })
        .catch(() => {
          setLoadingOrg(false)
        })
    }
  }, [tier, orgId])

  const isInvited = status === 'Invited' || status === 'To Invite'
  const isCancelled = status === 'Cancelled'
  const hasSubscription = !!stripeCustomerId
  const isPrivateOffice = tier === 'Private Office'

  // Format tier display name
  // Tiers: Staff, Volunteer, Private Office, Program, Resident, Member, Friend, Courtesy, Guest Program, Paused
  const getTierDisplay = () => {
    if (!tier) return null
    if (tier === 'Private Office') return 'private office'
    if (tier === 'Guest Program') return 'guest program'
    return tier.toLowerCase()
  }

  return (
    <>
      <h2>access</h2>

      <p>
        membership status: <strong>{status || 'unknown'}</strong>
        {tier && !isInvited && (
          <>
            {' '}
            · membership type: <strong>{getTierDisplay()}</strong>
          </>
        )}
        {isPrivateOffice && orgId && (
          <>
            {' '}
            ({loadingOrg ? 'loading...' : orgName || 'no office assigned'})
          </>
        )}
      </p>

      {isCancelled && (
        <div className="alert warning">
          <p>
            <strong>your subscription has been cancelled.</strong>
          </p>
          <p>
            we'd love to have you back!{' '}
            <Link href="/portal/renew">renew membership</Link>
          </p>
        </div>
      )}

      {isInvited && (
        <>
          <div className="alert info">
            <p>
              hey {firstName}! you're invited to join mox. all memberships
              include a 1-week free trial.
            </p>
          </div>

          <p style={{ marginTop: '15px' }}>
            <strong>Friend</strong> $160/mo · drop by up to 2x/week
            <br />
            <strong>Member</strong> $380/mo · unlimited access, hot desk
            <br />
            <strong>Resident</strong> $780/mo · dedicated desk + monitor
          </p>

          <p style={{ marginTop: '15px' }}>
            <Link
              href={`/join?name=${encodeURIComponent(firstName)}`}
              className="btn primary"
            >
              choose a membership
            </Link>
          </p>

          <p className="muted" style={{ marginTop: '15px' }}>
            questions? <a href="mailto:rachel@moxsf.com">rachel@moxsf.com</a>
          </p>
        </>
      )}
    </>
  )
}
