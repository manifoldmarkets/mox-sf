# Active Members Roster (`/active-members`)

Public, unlisted (`noindex`) page giving funders and staff a dense count of
paying members by tier, plus the full roster. Built on the `/people`
directory styles.

## Who counts as active

Cross-references Airtable People with Stripe. A person is active when either:

- they have a live Stripe subscription (`active`, `trialing`, `past_due`) that
  is **not** paused (`pause_collection`) and **not** scheduled to cancel
  (`cancel_at_period_end`), or
- their Airtable `Tier` is `Private Office` and any linked Org has
  `Status = Joined` (an active office). Office members are included whether
  or not they pay personally.

Airtable `Status` is deliberately ignored: Stripe is the source of truth for
paying members, and a few paying members are still marked `Invited`.

## Tier assignment

- Personal payers: from the Stripe product name (`Mox Membership - Core`,
  etc.), falling back to Airtable `Tier`. Stripe wins when they disagree.
- Office members: `Private Office`.

Tiers are presented as three groups with their plan entitlement (not a
measured visit count — door data isn't reliable enough for that):

| Group | Tiers | Entitlement |
|-------|-------|-------------|
| Office + Resident | Private Office, Resident | 20+ visits/mo |
| Core | Core | 10+ visits/mo |
| Friend | Friend | 2+ visits/mo |

## Privacy

People with `Show in directory` unchecked are counted in the stats but not
named; each section shows how many are unlisted.

## Implementation

- `app/active-members/active-members.ts` — `getActiveMembers()`: one
  paginated `stripe.subscriptions.list({ status: 'all' })` indexed by
  customer (not one call per person), joined to People + Orgs.
- `app/active-members/page.tsx` — server component, ISR `revalidate = 600`.
