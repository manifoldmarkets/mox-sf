import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/app/lib/session'
import { isValidToken, escapeAirtableString } from '@/app/lib/airtable-helpers'
import { findRecord, updateRecord, Tables } from '@/app/lib/airtable'
import { syncDiscordRole } from '@/app/lib/discord'

interface PersonFields {
  Email?: string
  Name?: string
  Tier?: string
  Status?: string
  'Discord Username'?: string
  discord_link_token?: string
  discord_link_expires?: string
  discord_link_user_id?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      new URL('/portal/login?error=invalid', request.url)
    )
  }

  // Validate token format (should be 64-char hex string from randomBytes(32))
  if (!isValidToken(token, 64)) {
    return NextResponse.redirect(
      new URL('/portal/login?error=invalid', request.url)
    )
  }

  try {
    // Find user by discord link token
    const escapedToken = escapeAirtableString(token)
    const formula = `{discord_link_token} = '${escapedToken}'`

    const record = await findRecord<PersonFields>(Tables.People, formula)

    if (!record) {
      return NextResponse.redirect(
        new URL('/portal/login?error=expired', request.url)
      )
    }

    // Check if token is expired
    const expiresAt = new Date(record.fields.discord_link_expires || '')
    if (expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL('/portal/login?error=expired', request.url)
      )
    }

    // Email is required
    if (!record.fields.Email) {
      return NextResponse.redirect(
        new URL('/portal/login?error=invalid', request.url)
      )
    }

    // Get the Discord user ID that was stored when the link was requested
    const discordUserId = record.fields.discord_link_user_id
    if (!discordUserId) {
      return NextResponse.redirect(
        new URL('/portal/login?error=invalid', request.url)
      )
    }

    // We need to get the Discord username from the user ID
    // For now, we'll fetch it from Discord API
    const discordUsername = await getDiscordUsername(discordUserId)
    if (!discordUsername) {
      return NextResponse.redirect(
        new URL('/portal/login?error=server', request.url)
      )
    }

    // Update the user's Discord username
    await updateRecord<PersonFields>(Tables.People, record.id, {
      'Discord Username': discordUsername,
      discord_link_token: '',
      discord_link_expires: undefined,
      discord_link_user_id: '',
    })

    // Sync their Discord role based on their tier
    if (record.fields.Tier && record.fields.Status) {
      await syncDiscordRole(
        discordUsername,
        record.fields.Tier,
        record.fields.Status
      )
    }

    // Create session and log them in
    await createSession(
      record.id,
      record.fields.Email,
      record.fields.Name,
      record.fields.Tier === 'Staff'
    )

    // Redirect to portal with success message
    return NextResponse.redirect(
      new URL('/portal?discord_linked=true', request.url)
    )
  } catch (error) {
    console.error('Error verifying Discord link token:', error)
    return NextResponse.redirect(
      new URL('/portal/login?error=server', request.url)
    )
  }
}

/**
 * Get Discord username from user ID
 */
async function getDiscordUsername(userId: string): Promise<string | null> {
  const { env } = await import('@/app/lib/env')

  if (!env.DISCORD_BOT_TOKEN) {
    console.error('Discord bot token not configured')
    return null
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch Discord user:', response.status)
      return null
    }

    const user = await response.json()
    return user.username
  } catch (error) {
    console.error('Error fetching Discord user:', error)
    return null
  }
}
