import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/app/lib/env'
import { findRecord, updateRecord, Tables } from '@/app/lib/airtable'
import { escapeAirtableString } from '@/app/lib/airtable-helpers'
import {
  verifyKey,
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions'
import crypto from 'crypto'

// Message flags
const MessageFlags = {
  EPHEMERAL: 64,
} as const

interface PersonFields {
  Email?: string
  Name?: string
  Tier?: string
  'Discord Username'?: string
  magic_link_token?: string
  token_expires?: string
}

/**
 * Generate a magic link token for a Discord user
 */
async function generateMagicLinkForDiscordUser(
  discordUsername: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Find user by Discord username
  const escapedUsername = escapeAirtableString(discordUsername)
  const formula = `{Discord Username} = '${escapedUsername}'`

  const record = await findRecord<PersonFields>(Tables.People, formula)

  if (!record) {
    return {
      success: false,
      error: 'Your Discord account is not linked to a MOX membership. Use /link to connect your account.',
    }
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  // Store token in Airtable
  await updateRecord<PersonFields>(Tables.People, record.id, {
    magic_link_token: token,
    token_expires: expiresAt.toISOString(),
  })

  const baseUrl = env.NEXT_PUBLIC_BASE_URL
  const url = `${baseUrl}/portal/verify?token=${token}`

  return { success: true, url }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-signature-ed25519')
  const timestamp = request.headers.get('x-signature-timestamp')

  console.log('[Discord] Received interaction request')
  console.log('[Discord] Has signature:', !!signature)
  console.log('[Discord] Has timestamp:', !!timestamp)

  if (!signature || !timestamp) {
    console.log('[Discord] Missing signature headers')
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
  }

  const publicKey = env.DISCORD_PUBLIC_KEY
  console.log('[Discord] Public key configured:', !!publicKey)
  console.log('[Discord] Public key length:', publicKey?.length || 0)

  if (!publicKey) {
    console.error('[Discord] DISCORD_PUBLIC_KEY not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // Verify the request is from Discord using the official library
  const isValid = await verifyKey(body, signature, timestamp, publicKey)
  console.log('[Discord] Signature valid:', isValid)

  if (!isValid) {
    console.log('[Discord] Invalid signature - rejecting request')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const interaction = JSON.parse(body)

  // Handle PING (required for Discord to verify endpoint)
  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG })
  }

  // Handle slash commands
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data?.name

    if (commandName === 'login') {
      // Get the Discord username from the interaction
      const discordUser = interaction.member?.user || interaction.user
      const username = discordUser?.username

      if (!username) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Could not identify your Discord account.',
            flags: MessageFlags.EPHEMERAL,
          },
        })
      }

      // Generate magic link
      const result = await generateMagicLinkForDiscordUser(username)

      if (!result.success) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ ${result.error}`,
            flags: MessageFlags.EPHEMERAL,
          },
        })
      }

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🔐 **Your personal portal link** (expires in 5 minutes):\n${result.url}\n\nThis link is just for you - don't share it!`,
          flags: MessageFlags.EPHEMERAL,
        },
      })
    }
  }

  // Unknown interaction
  return NextResponse.json({ error: 'Unknown interaction' }, { status: 400 })
}
