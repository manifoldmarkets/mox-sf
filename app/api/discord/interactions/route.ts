import { NextRequest, NextResponse } from 'next/server'
import {
  verifyDiscordSignature,
  pongResponse,
  deferredResponse,
  messageResponse,
  updateMessageResponse,
  sendFollowupMessage,
  editOriginalMessage,
  getDisplayName,
  getUserId,
  getUsername,
  InteractionType,
  ButtonStyle,
  type DiscordInteraction,
} from '@/app/lib/discord'
import {
  parseEventRequest,
  formatProposalMessage,
  createEventsInAirtable,
  getExistingEventNames,
  formatConfirmationMessage,
  generatePrefillUrl,
  type EventProposal,
} from '@/app/lib/discord-events'

// In-memory store for pending proposals (in production, use Redis or similar)
// Key: `${interactionId}` -> EventProposal
const pendingProposals = new Map<string, EventProposal>()

// Clean up old proposals after 1 hour
setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    for (const [key] of pendingProposals) {
      // In a real implementation, store timestamps with proposals
      // For now, just limit size
      if (pendingProposals.size > 100) {
        pendingProposals.delete(key)
      }
    }
  },
  60 * 60 * 1000
)

export async function POST(request: NextRequest) {
  // Get verification headers
  const signature = request.headers.get('x-signature-ed25519')
  const timestamp = request.headers.get('x-signature-timestamp')

  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
  }

  // Read body as text for signature verification
  const body = await request.text()

  // Verify signature
  const isValid = await verifyDiscordSignature(body, signature, timestamp)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Parse the interaction
  const interaction: DiscordInteraction = JSON.parse(body)

  // Handle PING (Discord uses this to verify the endpoint)
  if (interaction.type === InteractionType.PING) {
    return pongResponse()
  }

  // Handle slash commands
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    return handleApplicationCommand(interaction)
  }

  // Handle button clicks
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    return handleMessageComponent(interaction)
  }

  return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 })
}

async function handleApplicationCommand(interaction: DiscordInteraction) {
  const commandName = interaction.data?.name

  if (commandName === 'add-event') {
    // Get the request text from command options
    const requestOption = interaction.data?.options?.find((opt) => opt.name === 'request')
    const requestText = requestOption?.value || ''

    if (!requestText) {
      return messageResponse(
        'Please provide an event description. Example: `/add-event yoga class at 7pm on Thursday`',
        true
      )
    }

    // Defer the response since parsing may take a moment
    // We'll follow up with the actual response
    const applicationId = interaction.application_id
    const interactionToken = interaction.token
    const hostDiscordUsername = getUsername(interaction)
    const hostDiscordId = getUserId(interaction)
    const hostDisplayName = getDisplayName(interaction)

    // Return deferred response immediately
    // Then process in background
    processEventRequest(applicationId, interactionToken, requestText, hostDiscordUsername, hostDiscordId, hostDisplayName)

    return deferredResponse()
  }

  return messageResponse('Unknown command', true)
}

async function processEventRequest(
  applicationId: string,
  interactionToken: string,
  requestText: string,
  hostDiscordUsername: string,
  hostDiscordId: string,
  hostDisplayName: string
) {
  try {
    // Fetch existing event names for context
    const existingNames = await getExistingEventNames()

    // Parse the request
    const parsed = await parseEventRequest(requestText, hostDiscordUsername, hostDiscordId, hostDisplayName, existingNames)

    // Handle different response types
    if (parsed.useFormInstead) {
      await editOriginalMessage(
        applicationId,
        interactionToken,
        `This request is a bit complex for me to handle automatically. Please use the form instead:\n\n${parsed.formUrl || generatePrefillUrl({ discordUsername: hostDiscordUsername })}`
      )
      return
    }

    if (parsed.needsMoreInfo) {
      const questions = parsed.questions?.join('\n- ') || 'Could you provide more details?'
      await editOriginalMessage(
        applicationId,
        interactionToken,
        `I need a bit more information:\n- ${questions}\n\nOr you can use the form: ${generatePrefillUrl({ discordUsername: hostDiscordUsername })}`
      )
      return
    }

    if (parsed.proposals.length === 0) {
      await editOriginalMessage(
        applicationId,
        interactionToken,
        `I couldn't parse that request. Try something like:\n- "yoga class at 7pm on Thursday"\n- "repeat my cafe event every Friday"\n\nOr use the form: ${generatePrefillUrl({ discordUsername: hostDiscordUsername })}`
      )
      return
    }

    // We have a valid proposal
    const proposal = parsed.proposals[0]

    // Store proposal for later confirmation
    // Use a unique key based on the interaction
    const proposalKey = `${applicationId}-${Date.now()}`
    pendingProposals.set(proposalKey, proposal)

    // Send the proposal with confirmation buttons
    const proposalMessage = formatProposalMessage(proposal)

    await sendFollowupMessage(
      applicationId,
      interactionToken,
      proposalMessage,
      [
        {
          customId: `confirm:${proposalKey}`,
          label: 'Confirm',
          style: ButtonStyle.SUCCESS,
          emoji: '✅',
        },
        {
          customId: `cancel:${proposalKey}`,
          label: 'Cancel',
          style: ButtonStyle.SECONDARY,
          emoji: '❌',
        },
        {
          customId: `form:${proposalKey}`,
          label: 'Use Form Instead',
          style: ButtonStyle.SECONDARY,
        },
      ]
    )

    // Edit the original deferred message to indicate we're waiting
    await editOriginalMessage(
      applicationId,
      interactionToken,
      'Event proposal created! Please confirm below.'
    )
  } catch (error) {
    console.error('Error processing event request:', error)
    await editOriginalMessage(
      applicationId,
      interactionToken,
      `Something went wrong. Please try the form instead: ${generatePrefillUrl({})}`
    )
  }
}

async function handleMessageComponent(interaction: DiscordInteraction) {
  const customId = interaction.message?.components?.[0]?.components?.[0]?.custom_id || ''

  // Parse the custom_id to determine action
  // Format: action:proposalKey
  const [action, proposalKey] = customId.split(':')

  if (action === 'confirm') {
    const proposal = pendingProposals.get(proposalKey)

    if (!proposal) {
      return updateMessageResponse(
        'This proposal has expired. Please create a new one with `/add-event`.',
        true
      )
    }

    // Verify the user clicking is the same who created the proposal
    const clickerId = getUserId(interaction)
    if (clickerId !== proposal.hostDiscordId) {
      // Different user - don't allow
      return messageResponse("You can only confirm your own event proposals.", true)
    }

    // Create the events in Airtable
    const result = await createEventsInAirtable(proposal)

    if (result.success) {
      // Clean up
      pendingProposals.delete(proposalKey)

      const confirmationMessage = formatConfirmationMessage(proposal, result.recordIds, result.createdNewPerson)
      return updateMessageResponse(confirmationMessage, true)
    } else {
      return updateMessageResponse(
        `Failed to create events: ${result.error}\n\nPlease try the form: ${generatePrefillUrl({ name: proposal.name, discordUsername: proposal.hostDiscordUsername })}`,
        true
      )
    }
  }

  if (action === 'cancel') {
    const proposal = pendingProposals.get(proposalKey)

    // Verify the user clicking is the same who created the proposal
    if (proposal) {
      const clickerId = getUserId(interaction)
      if (clickerId !== proposal.hostDiscordId) {
        return messageResponse("You can only cancel your own event proposals.", true)
      }
    }

    pendingProposals.delete(proposalKey)
    return updateMessageResponse('Event creation cancelled.', true)
  }

  if (action === 'form') {
    const proposal = pendingProposals.get(proposalKey)
    pendingProposals.delete(proposalKey)

    const formUrl = proposal
      ? generatePrefillUrl({
          name: proposal.name,
          discordUsername: proposal.hostDiscordUsername,
          startDate: proposal.startDate,
          endDate: proposal.endDate,
          description: proposal.description,
          url: proposal.url,
        })
      : generatePrefillUrl({})

    return updateMessageResponse(`Here's the form with your details pre-filled:\n${formUrl}`, true)
  }

  return updateMessageResponse('Unknown action', true)
}
