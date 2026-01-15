/**
 * Test harness for the Discord event bot.
 *
 * This allows testing the event parsing and creation flow without Discord.
 *
 * Usage:
 *   bun run scripts/test-discord-bot.ts "yoga class at 7pm Thursday"
 *   bun run scripts/test-discord-bot.ts "repeat cafe event every Friday"
 *   bun run scripts/test-discord-bot.ts --create "yoga class at 7pm Thursday"
 *
 * Options:
 *   --create  Actually create the event in Airtable (otherwise just shows proposal)
 *   --username <name>  Set Discord username (default: test_user)
 */

import {
  parseEventRequest,
  formatProposalMessage,
  createEventsInAirtable,
  getExistingEventNames,
  formatConfirmationMessage,
} from '../app/lib/discord-events'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Discord Bot Test Harness
========================

Usage:
  bun run scripts/test-discord-bot.ts "yoga class at 7pm Thursday"
  bun run scripts/test-discord-bot.ts "repeat cafe event every Friday"
  bun run scripts/test-discord-bot.ts --create "yoga class at 7pm Thursday"

Options:
  --create           Actually create the event in Airtable (otherwise just shows proposal)
  --username <name>  Set Discord username (default: test_user)
  --help             Show this help message
`)
    return
  }

  // Parse arguments
  let shouldCreate = false
  let discordUsername = 'test_user'
  let requestText = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--create') {
      shouldCreate = true
    } else if (args[i] === '--username' && args[i + 1]) {
      discordUsername = args[i + 1]
      i++
    } else if (!args[i].startsWith('--')) {
      requestText = args[i]
    }
  }

  if (!requestText) {
    console.error('Error: Please provide an event request text')
    process.exit(1)
  }

  console.log('\n========================================')
  console.log('Discord Event Bot Test')
  console.log('========================================\n')
  console.log(`Request: "${requestText}"`)
  console.log(`Discord Username: ${discordUsername}`)
  console.log(`Create in Airtable: ${shouldCreate ? 'Yes' : 'No (dry run)'}`)
  console.log('')

  // Fetch existing event names
  console.log('Fetching existing event names...')
  const existingNames = await getExistingEventNames()
  console.log(`Found ${existingNames.length} existing events`)
  if (existingNames.length > 0) {
    console.log(`Sample events: ${existingNames.slice(0, 5).join(', ')}...`)
  }
  console.log('')

  // Parse the request
  console.log('Parsing event request...')
  const parsed = await parseEventRequest(
    requestText,
    discordUsername,
    'test_discord_id_123',
    `Test User (${discordUsername})`,
    existingNames
  )

  console.log('\n--- Raw Parsed Data ---')
  console.log(JSON.stringify(parsed.rawParsed, null, 2))

  if (parsed.needsMoreInfo) {
    console.log('\n--- Bot would ask for more info ---')
    console.log('Questions:')
    parsed.questions?.forEach(q => console.log(`  - ${q}`))
    return
  }

  if (parsed.useFormInstead) {
    console.log('\n--- Bot would redirect to form ---')
    console.log(`Form URL: ${parsed.formUrl}`)
    return
  }

  if (parsed.proposals.length === 0) {
    console.log('\n--- No proposals generated ---')
    console.log('Bot would show error message')
    return
  }

  // Show the proposal
  const proposal = parsed.proposals[0]
  console.log('\n--- Event Proposal ---')
  console.log(formatProposalMessage(proposal))

  console.log('\n--- Proposal Details (JSON) ---')
  console.log(JSON.stringify({
    name: proposal.name,
    hostDiscordUsername: proposal.hostDiscordUsername,
    hostDisplayName: proposal.hostDisplayName,
    startDate: proposal.startDate.toISOString(),
    endDate: proposal.endDate?.toISOString(),
    visibility: proposal.visibility,
    isRecurring: proposal.isRecurring,
    recurrencePattern: proposal.recurrencePattern,
    occurrencesCount: proposal.occurrences?.length,
  }, null, 2))

  if (proposal.isRecurring && proposal.occurrences) {
    console.log('\n--- Recurring Event Dates ---')
    proposal.occurrences.forEach((date, i) => {
      console.log(`  ${i + 1}. ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`)
    })
  }

  // Create in Airtable if requested
  if (shouldCreate) {
    console.log('\n--- Creating in Airtable ---')
    console.log('Creating event(s)...')

    const result = await createEventsInAirtable(proposal)

    if (result.success) {
      console.log(`\nSuccess! Created ${result.recordIds.length} record(s)`)
      console.log(`Record IDs: ${result.recordIds.join(', ')}`)
      if (result.createdNewPerson) {
        console.log(`\nNote: Created new Person record for @${proposal.hostDiscordUsername}`)
      }
      console.log('\n--- Confirmation Message ---')
      console.log(formatConfirmationMessage(proposal, result.recordIds, result.createdNewPerson))
    } else {
      console.error(`\nError: ${result.error}`)
    }
  } else {
    console.log('\n--- Dry Run Complete ---')
    console.log('Use --create flag to actually create the event in Airtable')
  }
}

main().catch(console.error)
