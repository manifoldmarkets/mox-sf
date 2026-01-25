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

  return (
    <>
      <h2>membership status</h2>

      <p>
        status: <strong>{status || 'unknown'}</strong>
        {isPrivateOffice && (
          <>
            {' '}
            | private office:{' '}
            <strong>
              {loadingOrg ? 'loading...' : orgName || 'no office assigned'}
            </strong>
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
              hey {firstName}! you're invited to join mox. choose a membership
              tier below to get started with a 1-week free trial.
            </p>
          </div>
          <div style={{ marginTop: '20px' }}>
            <script
              async
              src="https://js.stripe.com/v3/pricing-table.js"
            ></script>
            {/* @ts-ignore */}
            <stripe-pricing-table
              pricing-table-id="prctbl_1SBTulRobJaZ7DVC19nKSvjs"
              publishable-key="pk_live_51OwnuXRobJaZ7DVC4fdjfPGJOeJbVfXU5ILe4IZhkvuGhI86EimJfQKHMS1BCX3wuJTSXGnvToae5RmfswBPPM7b00D137jyzJ"
            >
              {/* @ts-ignore */}
            </stripe-pricing-table>
          </div>
        </>
      )}
    </>
  )
}
