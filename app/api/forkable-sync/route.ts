import { Tables, getRecord, updateRecord } from '@/app/lib/airtable'
import { sendChannelMessage, DISCORD_CHANNELS } from '@/app/lib/discord'
import { env } from '@/app/lib/env'
import {
  addMemberToForkable,
  FORKABLE_CLUBS,
  type ForkableClubId,
} from '@/app/lib/forkable'
import { withAutomation } from '@/app/lib/automation'

// Map Airtable Tier to Forkable club IDs
// Private Office -> MOX_RESIDENTS (they get resident-level meal access)
// Program -> MOX_MEMBERS (they get member-level meal access)
const TIER_TO_FORKABLE_CLUBS: Record<string, ForkableClubId[]> = {
  'Private Office': [FORKABLE_CLUBS.MOX_RESIDENTS],
  Program: [FORKABLE_CLUBS.MOX_MEMBERS],
}

interface PersonFields {
  Name?: string
  Email?: string
  Tier?: string
  Status?: string
  'In Forkable'?: boolean
  'First Name'?: string
  'Last Name'?: string
}

interface SyncPayload {
  recordId: string
  secret?: string
}

export const POST = withAutomation({ type: 'webhook' }, async (run, req) => {
  const payload: SyncPayload = await run.step('Parse request', () => req.json())

  // Verify secret if configured
  const expectedSecret = env.FORKABLE_SYNC_SECRET
  if (expectedSecret && payload.secret !== expectedSecret) {
    throw new Error('Invalid secret')
  }

  if (!payload.recordId) {
    throw new Error('Missing recordId')
  }

  const person = await run.step('Fetch person from Airtable', () =>
    getRecord<PersonFields>(Tables.People, payload.recordId)
  )

  if (!person) {
    throw new Error(`Person not found: ${payload.recordId}`)
  }

  const { Name, Email, Tier, Status } = person.fields
  const inForkable = person.fields['In Forkable']

  // Skip conditions
  if (inForkable) {
    run.skip('Add to Forkable (already in Forkable)')
    return { skipped: true, reason: 'Already in Forkable' }
  }
  if (Status !== 'Joined') {
    run.skip(`Add to Forkable (status is "${Status}", not "Joined")`)
    return { skipped: true, reason: 'Not Joined status' }
  }

  const clubIds = Tier ? TIER_TO_FORKABLE_CLUBS[Tier] : undefined
  if (!clubIds || clubIds.length === 0) {
    run.skip(`Add to Forkable (tier "${Tier}" not eligible)`)
    return { skipped: true, reason: 'Tier not eligible' }
  }

  if (!Email) {
    throw new Error(`Missing email for record ${payload.recordId}`)
  }

  // Parse name
  let firstName = person.fields['First Name'] || ''
  let lastName = person.fields['Last Name'] || ''
  if (!firstName && Name) {
    const parts = Name.trim().split(/\s+/)
    firstName = parts[0] || ''
    lastName = parts.slice(1).join(' ')
  }

  const result = await run.step(`Add ${Email} to Forkable`, () =>
    addMemberToForkable({
      email: Email,
      firstName: firstName || Email.split('@')[0],
      lastName,
      clubIds,
    })
  )

  if (!result.success) {
    // Notify about failure then throw
    const clubName = Tier === 'Private Office' ? 'Mox Residents' : 'Mox Members'
    await sendChannelMessage(
      DISCORD_CHANNELS.NOTIFICATIONS,
      `❌ **Forkable:** Failed to add ${Name || Email} (${Email}) to ${clubName}. ` +
        `Please add them manually at https://forkable.com\n\n` +
        `**Errors:**\n${result.errors?.join('\n') || 'Unknown error'}`
    )
    throw new Error(`Forkable API errors: ${result.errors?.join(', ')}`)
  }

  await run.step('Update "In Forkable" checkbox', () =>
    updateRecord(Tables.People, payload.recordId, { 'In Forkable': true })
  )

  const clubName = Tier === 'Private Office' ? 'Mox Residents' : 'Mox Members'
  await run.step('Send Discord notification', () =>
    sendChannelMessage(
      DISCORD_CHANNELS.NOTIFICATIONS,
      `✅ **Forkable:** ${Name || Email} (${Email}) added to ${clubName}`
    )
  )

  return { memberships: result.memberships }
})
