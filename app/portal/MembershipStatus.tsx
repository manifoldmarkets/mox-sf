'use client'

import { useEffect, useState } from 'react';
import SubscriptionInfo from './SubscriptionInfo';

export default function MembershipStatus({
  status,
  firstName,
  stripeCustomerId,
  tier,
  orgId
}: {
  status: string | null,
  firstName: string,
  stripeCustomerId: string | null,
  tier?: string | null,
  orgId?: string | null
}) {
  const [orgName, setOrgName] = useState<string | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);

  // Fetch org details if tier is "Private Office" and orgId exists
  useEffect(() => {
    if (tier === 'Private Office' && orgId) {
      setLoadingOrg(true);
      fetch(`/portal/api/org-details?orgId=${orgId}`)
        .then(res => res.json())
        .then(data => {
          setOrgName(data.name || null);
          setLoadingOrg(false);
        })
        .catch(() => {
          setLoadingOrg(false);
        });
    }
  }, [tier, orgId]);
  const isInvited = status === 'Invited' || status === 'To Invite';
  const hasSubscription = !!stripeCustomerId;
  const isPrivateOffice = tier === 'Private Office';

  // Render private office card if applicable
  const privateOfficeCard = isPrivateOffice && (
    <div className="bg-background-subtle dark:bg-background-subtle-dark p-3 border border-border-light dark:border-border-light-dark">
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-1">Private Office</p>
      {loadingOrg ? (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Loading...</p>
      ) : orgName ? (
        <p className="font-medium text-text-primary dark:text-text-primary-dark">{orgName}</p>
      ) : (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">No office assigned</p>
      )}
    </div>
  );

  // If they have a subscription, show subscription info with optional private office
  if (hasSubscription) {
    return (
      <>
        {isPrivateOffice && (
          <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-6">
            <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">
              Membership Status
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  Status: <span className="font-medium text-text-primary dark:text-text-primary-dark">{status || 'Unknown'}</span>
                </p>
              </div>
              {privateOfficeCard}
            </div>
          </div>
        )}
        <SubscriptionInfo stripeCustomerId={stripeCustomerId} />
      </>
    );
  }

  // Otherwise, show the status and invite flow
  return (
    <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-6">
      <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">
        Membership Status
      </h2>

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="text-text-secondary dark:text-text-secondary-dark">
            Status: <span className="font-medium text-text-primary dark:text-text-primary-dark">{status || 'Unknown'}</span>
          </p>
          {isInvited && (
            <a
              href="#join"
              className="inline-block px-6 py-2 bg-brand hover:bg-brand-dark transition-colors text-white font-semibold"
            >
              Join Mox
            </a>
          )}
        </div>

        {/* Show private office info if tier is "Private Office" */}
        {privateOfficeCard}
      </div>

      {isInvited && (
        <div id="join" className="mt-8 pt-8 border-t border-border-light dark:border-border-light-dark">
          <h3 className="text-lg font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">
            Ready to join?
          </h3>
          <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
            Hey {firstName}! You're invited to join Mox. Choose a membership tier below to get started with a 1-week free trial.
          </p>
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
      )}
    </div>
  );
}
