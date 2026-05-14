// Single source of truth for day-pass pricing across the form, the checkout
// endpoint, and the Stripe webhook. The public price is what non-members pay
// on the standalone /day-pass page; the member price is what active paying
// members get from inside the portal when buying for themselves or a guest.

import { isActiveMember, type MembershipFields } from './membership'

export type PassTypeId = 'day' | 'happy-hour' | 'week'

export interface PassType {
  id: PassTypeId
  label: string
  description: string
  durationDays: number
  publicPriceCents: number
  // null = not offered to members; the pass type is public-only.
  memberPriceCents: number | null
  // Stripe Price id for the member-priced version. Required for any pass
  // type with memberPriceCents set, since the portal checkout references
  // this Price (so product-scoped coupons attach correctly).
  stripeMemberPriceId: string | null
}

export const PASS_TYPES: Record<PassTypeId, PassType> = {
  day: {
    id: 'day',
    label: 'Day Pass',
    description: 'Full day access (9 AM - 11 PM)',
    durationDays: 1,
    publicPriceCents: 7000,
    memberPriceCents: 2500,
    stripeMemberPriceId: 'price_1Su7O0RobJaZ7DVCD6b2gBHu',
  },
  'happy-hour': {
    id: 'happy-hour',
    label: 'Happy Hour Pass',
    description: 'Evening access (after 4 PM)',
    durationDays: 1,
    publicPriceCents: 4000,
    memberPriceCents: null,
    stripeMemberPriceId: null,
  },
  week: {
    id: 'week',
    label: 'Week Pass',
    description: 'Full week of access',
    durationDays: 7,
    publicPriceCents: 25000,
    memberPriceCents: 15000,
    // TODO: create a $150 member Price on the Week Pass product and set its id here.
    stripeMemberPriceId: null,
  },
}

// Member-purchasable pass types. Gated on the Stripe Price id so we don't
// surface a pass type the checkout endpoint can't actually transact.
export const MEMBER_PASS_TYPES: PassType[] = Object.values(PASS_TYPES).filter(
  (p) => p.memberPriceCents !== null && p.stripeMemberPriceId !== null
)

export function priceForBuyer(
  pass: PassType,
  buyer: MembershipFields
): number {
  if (isActiveMember(buyer) && pass.memberPriceCents !== null) {
    return pass.memberPriceCents
  }
  return pass.publicPriceCents
}

export function getPassType(id: string): PassType | null {
  return (PASS_TYPES as Record<string, PassType>)[id] || null
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}
