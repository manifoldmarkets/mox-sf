import { ACTIVE_TIERS } from './discord-constants'

export interface MembershipFields {
  status?: string | null
  tier?: string | null
}

const PAYING_TIERS = ['Friend', 'Core', 'Resident', 'Private Office'] as const

export function isActiveMember({ status, tier }: MembershipFields): boolean {
  if (tier === 'Staff') return true
  if (status !== 'Joined' || !tier) return false
  return (ACTIVE_TIERS as readonly string[]).includes(tier)
}

export function canIssueGuestDayPass({ status, tier }: MembershipFields): boolean {
  if (tier === 'Staff') return true
  if (status !== 'Joined' || !tier) return false
  return (PAYING_TIERS as readonly string[]).includes(tier)
}
