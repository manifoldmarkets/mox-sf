import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/app/lib/env'
import { findRecord, updateRecord, Tables } from '@/app/lib/airtable'
import { escapeAirtableString, isValidEmail } from '@/app/lib/airtable-helpers'
import {
  verifyKey,
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions'
import crypto from 'crypto'
import { Resend } from 'resend'

// Message flags
const MessageFlags = {
  EPHEMERAL: 64,
} as const

// Component types
const ComponentType = {
  ACTION_ROW: 1,
  TEXT_INPUT: 4,
} as const

// Text input styles
const TextInputStyle = {
  SHORT: 1,
  PARAGRAPH: 2,
} as const

interface PersonFields {
  Email?: string
  Name?: string
  Tier?: string
  Status?: string
  'Discord Username'?: string
  magic_link_token?: string
  token_expires?: string
}

/**
 * Generate a magic link token for a Discord user (for /login)
 */
async function generateMagicLinkForDiscordUser(
  discordUsername: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const escapedUsername = escapeAirtableString(discordUsername)
  const formula = `{Discord Username} = '${escapedUsername}'`

  const record = await findRecord<PersonFields>(Tables.People, formula)

  if (!record) {
    return {
      success: false,
      error: 'Your Discord account is not linked to a Mox membership. Use /link to connect your account.',
    }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await updateRecord<PersonFields>(Tables.People, record.id, {
    magic_link_token: token,
    token_expires: expiresAt.toISOString(),
  })

  const baseUrl = env.NEXT_PUBLIC_BASE_URL
  const url = `${baseUrl}/portal/verify?token=${token}`

  return { success: true, url }
}

/**
 * Send a Discord link verification email (uses existing magic link flow)
 */
async function sendDiscordLinkEmail(
  email: string,
  discordUsername: string
): Promise<{ success: boolean; error?: string }> {
  const escapedEmail = escapeAirtableString(email.toLowerCase().trim())
  const formula = `{Email} = '${escapedEmail}'`

  const record = await findRecord<PersonFields>(Tables.People, formula)

  if (!record) {
    return {
      success: false,
      error: 'No Mox account found with that email address.',
    }
  }

  // Check if this email already has a different Discord username linked
  if (record.fields['Discord Username'] && record.fields['Discord Username'] !== discordUsername) {
    return {
      success: false,
      error: 'This email is already linked to a different Discord account. Please contact staff for help.',
    }
  }

  // Generate magic link token (reuse existing flow)
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await updateRecord<PersonFields>(Tables.People, record.id, {
    magic_link_token: token,
    token_expires: expiresAt.toISOString(),
  })

  // Send verification email with Discord username in the URL
  const resend = new Resend(env.RESEND_API_KEY)
  const baseUrl = env.NEXT_PUBLIC_BASE_URL
  const verifyUrl = `${baseUrl}/portal/verify?token=${token}&discord=${encodeURIComponent(discordUsername)}`

  await resend.emails.send({
    from: 'Mox SF <noreply@account.moxsf.com>',
    to: email.toLowerCase().trim(),
    subject: 'Link your Discord account to Mox',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Link your Discord account</h2>
        <p>Hi ${record.fields.Name || 'there'},</p>
        <p>Click the link below to connect your Discord account (<strong>${discordUsername}</strong>) to your Mox membership:</p>
        <p style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #5865F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Link Discord Account
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this URL: ${verifyUrl}
        </p>
      </div>
    `,
  })

  return { success: true }
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
      const discordUser = interaction.member?.user || interaction.user
      const username = discordUser?.username

      if (!username) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Could not identify your Discord account.',
            flags: MessageFlags.EPHEMERAL,
          },
        })
      }

      const result = await generateMagicLinkForDiscordUser(username)

      if (!result.success) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: result.error,
            flags: MessageFlags.EPHEMERAL,
          },
        })
      }

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `**Your personal portal link** (expires in 5 minutes):\n${result.url}\n\nThis link is just for you - don't share it!`,
          flags: MessageFlags.EPHEMERAL,
        },
      })
    }

    if (commandName === 'link') {
      // Show modal to collect email
      return NextResponse.json({
        type: 9, // MODAL
        data: {
          custom_id: 'link_email_modal',
          title: 'Link your Mox account',
          components: [
            {
              type: ComponentType.ACTION_ROW,
              components: [
                {
                  type: ComponentType.TEXT_INPUT,
                  custom_id: 'email_input',
                  label: 'Email address',
                  style: TextInputStyle.SHORT,
                  placeholder: 'Enter the email associated with your Mox account',
                  required: true,
                  min_length: 5,
                  max_length: 254,
                },
              ],
            },
          ],
        },
      })
    }
  }

  // Handle modal submissions
  if (interaction.type === 5) { // MODAL_SUBMIT
    const customId = interaction.data?.custom_id

    if (customId === 'link_email_modal') {
      const discordUser = interaction.member?.user || interaction.user
      const username = discordUser?.username
      const userId = discordUser?.id

      if (!username || !userId) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Could not identify your Discord account.',
            flags: MessageFlags.EPHEMERAL,
          },
        })
      }

      // Extract email from modal response
      const emailComponent = interaction.data?.components?.[0]?.components?.[0]
      const email = emailComponent?.value

      if (!email || !isValidEmail(email)) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Please enter a valid email address.',
            flags: MessageFlags.EPHEMERAL,
          },
        })
      }

      // Send verification email
      const result = await sendDiscordLinkEmail(email, username)

      if (!result.success) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: result.error,
            flags: MessageFlags.EPHEMERAL,
          },
        })
      }

      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Verification email sent to **${email}**!\n\nCheck your inbox and click the link to connect your Discord account. The link expires in 15 minutes.`,
          flags: MessageFlags.EPHEMERAL,
        },
      })
    }
  }

  // Unknown interaction
  return NextResponse.json({ error: 'Unknown interaction' }, { status: 400 })
}
