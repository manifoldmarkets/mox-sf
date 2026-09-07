import type Stripe from 'stripe'
import { findRecords, Tables } from '../lib/airtable'
import { stripe } from '../lib/stripe'

/**
 * Active-member roster, cross-referencing Airtable People with Stripe.
 *
 * A person counts as active when either:
 *   - they have a live (active / trialing / past_due) Stripe subscription
 *     that is not paused and not scheduled to cancel, or
 *   - their Airtable Tier is "Private Office" and they belong to an Org
 *     whose Status is "Joined" (an active office), regardless of Stripe.
 *
 * Tier comes from the Stripe product for personal payers (Stripe is the
 * source of truth for what someone is paying for), and from Airtable for
 * office members. Visit frequencies are what each plan entitles, not a
 * measurement — door data isn't reliable enough to count visits.
 */

export type MemberTier = 'Private Office' | 'Resident' | 'Core' | 'Friend'

export type ActiveMember = {
  id: string
  name: string
  tier: MemberTier
  /** Names of active offices (Orgs with Status "Joined") this person belongs to */
  orgs: string[]
  /** Room numbers for those offices */
  rooms: string[]
  website: string
  photoUrl: string | null
  /** Airtable "Show in directory" — false means count but don't list by name */
  listed: boolean
  /** Why they're here: paying personally, or covered by an office */
  via: 'stripe' | 'office'
}

export type TierGroup = {
  key: 'office' | 'core' | 'friend'
  title: string
  /** Plan entitlement, e.g. "20+ visits/mo" */
  entitlement: string
  members: ActiveMember[]
}

export type ActiveMembersData = {
  groups: TierGroup[]
  total: number
  activeOffices: number
  /** Members counted in the stats but not named (opted out of the directory) */
  unlisted: number
  generatedAt: string
}

interface PersonFields {
  Name?: string
  Tier?: string
  Status?: string
  Org?: string[]
  Website?: string
  Photo?: any[]
  'Show in directory'?: boolean
  'Stripe Customer ID'?: string
}

interface OrgFields {
  Name?: string
  Status?: string
  'Room #'?: string[]
}

const LIVE_STATUSES: Stripe.Subscription.Status[] = ['active', 'trialing', 'past_due']

type StripeState =
  | { kind: 'none' }
  | { kind: 'paused' }
  | { kind: 'ending' }
  | { kind: 'active'; tier: MemberTier | null }

// Map a Stripe product name like "Mox Membership - Core" to a tier.
function tierFromProductName(name: string): MemberTier | null {
  const n = name.toLowerCase()
  if (n.includes('office')) return 'Private Office'
  if (n.includes('resident')) return 'Resident'
  if (n.includes('core')) return 'Core'
  if (n.includes('friend')) return 'Friend'
  return null
}

function tierFromAirtable(tier?: string): MemberTier | null {
  switch (tier) {
    case 'Private Office':
    case 'Resident':
    case 'Core':
    case 'Friend':
      return tier
    default:
      return null
  }
}

/** Fetch every subscription once and index by customer — far cheaper than
 *  one Stripe call per person. */
async function loadStripeStates(): Promise<Map<string, StripeState>> {
  const byCustomer = new Map<string, Stripe.Subscription[]>()
  for await (const sub of stripe.subscriptions.list({ status: 'all', limit: 100 })) {
    const cid = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    byCustomer.set(cid, [...(byCustomer.get(cid) || []), sub])
  }

  // Resolve product names (a handful of products, cached across customers)
  const productNames = new Map<string, string>()
  async function productName(id: string): Promise<string> {
    if (!productNames.has(id)) {
      const product = await stripe.products.retrieve(id)
      productNames.set(id, product.name)
    }
    return productNames.get(id)!
  }

  const states = new Map<string, StripeState>()
  for (const [cid, subs] of byCustomer) {
    const live = subs.find((s) => LIVE_STATUSES.includes(s.status))
    if (!live) {
      states.set(cid, { kind: 'none' })
    } else if (live.pause_collection) {
      states.set(cid, { kind: 'paused' })
    } else if (live.cancel_at_period_end) {
      states.set(cid, { kind: 'ending' })
    } else {
      const product = live.items.data[0]?.price?.product
      const productId = typeof product === 'string' ? product : product?.id
      const tier = productId ? tierFromProductName(await productName(productId)) : null
      states.set(cid, { kind: 'active', tier })
    }
  }
  return states
}

export async function getActiveMembers(): Promise<ActiveMembersData> {
  const [people, orgs, stripeStates] = await Promise.all([
    findRecords<PersonFields>(Tables.People, '', {
      fields: [
        'Name', 'Tier', 'Status', 'Org', 'Website', 'Photo',
        'Show in directory', 'Stripe Customer ID',
      ],
    }),
    findRecords<OrgFields>(Tables.Orgs, '', { fields: ['Name', 'Status', 'Room #'] }),
    loadStripeStates(),
  ])

  const activeOrgs = new Map(
    orgs
      .filter((o) => o.fields.Status === 'Joined')
      .map((o) => [o.id, { name: o.fields.Name || '', rooms: o.fields['Room #'] || [] }])
  )

  const members: ActiveMember[] = []
  for (const record of people) {
    const f = record.fields
    const customerId = (f['Stripe Customer ID'] || '').trim()
    const stripeState: StripeState = customerId
      ? stripeStates.get(customerId) || { kind: 'none' }
      : { kind: 'none' }
    const personOrgs = (f.Org || []).map((id) => activeOrgs.get(id)).filter(Boolean) as {
      name: string
      rooms: string[]
    }[]

    let tier: MemberTier | null = null
    let via: ActiveMember['via'] | null = null
    if (stripeState.kind === 'active') {
      tier = stripeState.tier ?? tierFromAirtable(f.Tier)
      via = 'stripe'
    } else if (personOrgs.length > 0 && f.Tier === 'Private Office') {
      tier = 'Private Office'
      via = 'office'
    }
    if (!tier || !via) continue

    members.push({
      id: record.id,
      name: f.Name || '',
      tier,
      orgs: personOrgs.map((o) => o.name),
      rooms: personOrgs.flatMap((o) => o.rooms),
      website: f.Website || '',
      photoUrl: f.Photo?.[0]?.thumbnails?.large?.url || null,
      listed: !!f['Show in directory'],
      via,
    })
  }

  const byName = (a: ActiveMember, b: ActiveMember) => a.name.localeCompare(b.name)
  const office = members
    .filter((m) => m.tier === 'Private Office' || m.tier === 'Resident')
    .sort((a, b) => {
      // Offices grouped together (by org name), then residents, then independents
      const ao = a.orgs[0] || (a.tier === 'Resident' ? '~resident' : '~~')
      const bo = b.orgs[0] || (b.tier === 'Resident' ? '~resident' : '~~')
      return ao.localeCompare(bo) || byName(a, b)
    })
  const core = members.filter((m) => m.tier === 'Core').sort(byName)
  const friend = members.filter((m) => m.tier === 'Friend').sort(byName)

  const groups: TierGroup[] = [
    { key: 'office', title: 'Office + Resident', entitlement: '20+ visits/mo', members: office },
    { key: 'core', title: 'Core', entitlement: '10+ visits/mo', members: core },
    { key: 'friend', title: 'Friend', entitlement: '2+ visits/mo', members: friend },
  ]

  return {
    groups,
    total: members.length,
    activeOffices: new Set(office.flatMap((m) => m.orgs)).size,
    unlisted: members.filter((m) => !m.listed).length,
    generatedAt: new Date().toISOString(),
  }
}
