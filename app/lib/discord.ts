import { NextResponse } from 'next/server'

// Discord API types
export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  global_name?: string
  avatar?: string
}

export interface DiscordInteraction {
  id: string
  application_id: string
  type: InteractionType
  data?: {
    id: string
    name: string
    options?: { name: string; type: number; value: string }[]
  }
  guild_id?: string
  channel_id?: string
  member?: {
    user: DiscordUser
    nick?: string
    roles: string[]
  }
  user?: DiscordUser
  token: string
  version: number
  message?: DiscordMessage
}

export interface DiscordMessage {
  id: string
  channel_id: string
  content: string
  author: DiscordUser
  components?: MessageComponent[]
}

export interface MessageComponent {
  type: number
  components?: MessageComponent[]
  custom_id?: string
  label?: string
  style?: number
  emoji?: { name: string }
}

export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

export enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9,
}

export enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5,
}

export enum ComponentType {
  ACTION_ROW = 1,
  BUTTON = 2,
  STRING_SELECT = 3,
  TEXT_INPUT = 4,
  USER_SELECT = 5,
  ROLE_SELECT = 6,
  MENTIONABLE_SELECT = 7,
  CHANNEL_SELECT = 8,
}

// Verify Discord signature using Web Crypto API (Edge runtime compatible)
export async function verifyDiscordSignature(
  body: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  const publicKey = process.env.DISCORD_PUBLIC_KEY
  if (!publicKey) {
    console.error('DISCORD_PUBLIC_KEY not configured')
    return false
  }

  try {
    // Convert hex public key to Uint8Array
    const keyData = hexToUint8Array(publicKey)

    // Import the public key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['verify']
    )

    // Convert signature from hex
    const signatureData = hexToUint8Array(signature)

    // Create message to verify (timestamp + body)
    const message = new TextEncoder().encode(timestamp + body)

    // Verify signature
    const isValid = await crypto.subtle.verify('Ed25519', key, signatureData, message)

    return isValid
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

// Response builders
export function pongResponse() {
  return NextResponse.json({ type: InteractionResponseType.PONG })
}

export function messageResponse(content: string, ephemeral = false) {
  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
      flags: ephemeral ? 64 : 0, // 64 = ephemeral flag
    },
  })
}

export function deferredResponse(ephemeral = false) {
  return NextResponse.json({
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: ephemeral ? 64 : 0,
    },
  })
}

export function messageWithButtonsResponse(
  content: string,
  buttons: { customId: string; label: string; style: ButtonStyle; emoji?: string }[]
) {
  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: buttons.map((btn) => ({
            type: ComponentType.BUTTON,
            custom_id: btn.customId,
            label: btn.label,
            style: btn.style,
            emoji: btn.emoji ? { name: btn.emoji } : undefined,
          })),
        },
      ],
    },
  })
}

export function updateMessageResponse(content: string, removeButtons = false) {
  return NextResponse.json({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      content,
      components: removeButtons ? [] : undefined,
    },
  })
}

// Discord API helpers for follow-up messages
const DISCORD_API_BASE = 'https://discord.com/api/v10'

export async function sendFollowupMessage(
  applicationId: string,
  interactionToken: string,
  content: string,
  buttons?: { customId: string; label: string; style: ButtonStyle; emoji?: string }[]
) {
  const body: Record<string, unknown> = { content }

  if (buttons && buttons.length > 0) {
    body.components = [
      {
        type: ComponentType.ACTION_ROW,
        components: buttons.map((btn) => ({
          type: ComponentType.BUTTON,
          custom_id: btn.customId,
          label: btn.label,
          style: btn.style,
          emoji: btn.emoji ? { name: btn.emoji } : undefined,
        })),
      },
    ]
  }

  const response = await fetch(
    `${DISCORD_API_BASE}/webhooks/${applicationId}/${interactionToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to send followup message:', error)
    throw new Error(`Discord API error: ${response.status}`)
  }

  return response.json()
}

export async function editOriginalMessage(
  applicationId: string,
  interactionToken: string,
  content: string,
  removeButtons = false
) {
  const body: Record<string, unknown> = { content }
  if (removeButtons) {
    body.components = []
  }

  const response = await fetch(
    `${DISCORD_API_BASE}/webhooks/${applicationId}/${interactionToken}/messages/@original`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to edit original message:', error)
    throw new Error(`Discord API error: ${response.status}`)
  }

  return response.json()
}

// Create a thread from a message
export async function createThread(
  channelId: string,
  messageId: string,
  name: string
): Promise<{ id: string }> {
  const response = await fetch(
    `${DISCORD_API_BASE}/channels/${channelId}/messages/${messageId}/threads`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        name: name.substring(0, 100), // Thread names max 100 chars
        auto_archive_duration: 1440, // Archive after 24 hours of inactivity
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to create thread:', error)
    throw new Error(`Discord API error: ${response.status}`)
  }

  return response.json()
}

// Send a message to a specific channel
export async function sendChannelMessage(
  channelId: string,
  content: string,
  buttons?: { customId: string; label: string; style: ButtonStyle; emoji?: string }[]
): Promise<DiscordMessage> {
  const body: Record<string, unknown> = { content }

  if (buttons && buttons.length > 0) {
    body.components = [
      {
        type: ComponentType.ACTION_ROW,
        components: buttons.map((btn) => ({
          type: ComponentType.BUTTON,
          custom_id: btn.customId,
          label: btn.label,
          style: btn.style,
          emoji: btn.emoji ? { name: btn.emoji } : undefined,
        })),
      },
    ]
  }

  const response = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to send channel message:', error)
    throw new Error(`Discord API error: ${response.status}`)
  }

  return response.json()
}

// Get display name for a Discord user
export function getDisplayName(interaction: DiscordInteraction): string {
  if (interaction.member) {
    return (
      interaction.member.nick ||
      interaction.member.user.global_name ||
      interaction.member.user.username
    )
  }
  if (interaction.user) {
    return interaction.user.global_name || interaction.user.username
  }
  return 'Unknown User'
}

export function getUserId(interaction: DiscordInteraction): string {
  return interaction.member?.user.id || interaction.user?.id || ''
}

// Get Discord username (the actual @username, not display name)
export function getUsername(interaction: DiscordInteraction): string {
  return interaction.member?.user.username || interaction.user?.username || 'unknown'
}
