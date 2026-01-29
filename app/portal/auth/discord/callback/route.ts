import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/app/lib/env'
import { createSession } from '@/app/lib/session'
import { findRecord, Tables } from '@/app/lib/airtable'
import { escapeAirtableString } from '@/app/lib/airtable-helpers'
import { cookies } from 'next/headers'

interface DiscordUser {
  id: string
  username: string
  global_name: string | null
}

interface PersonFields {
  Email?: string
  Name?: string
  Tier?: string
  'Discord Username'?: string
}

/**
 * Discord OAuth2 callback handler
 * Exchanges the authorization code for user info and creates a session
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle user denying authorization
  if (error) {
    console.log('Discord OAuth error:', error)
    return NextResponse.redirect(
      new URL('/portal/login?error=discord_denied', request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/portal/login?error=invalid', request.url)
    )
  }

  // Verify state to prevent CSRF attacks
  const cookieStore = await cookies()
  const storedState = cookieStore.get('discord_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/portal/login?error=invalid_state', request.url)
    )
  }

  // Clear the state cookie
  cookieStore.delete('discord_oauth_state')

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/portal/auth/discord/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Discord token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/portal/login?error=discord_token_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch Discord user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Discord user fetch failed:', userResponse.status)
      return NextResponse.redirect(
        new URL('/portal/login?error=discord_user_failed', request.url)
      )
    }

    const discordUser: DiscordUser = await userResponse.json()
    console.log('Discord user authenticated:', discordUser.id, discordUser.username)

    // Look up user in Airtable by Discord ID
    // The "Discord Username" field actually stores the Discord user ID
    const escapedDiscordId = escapeAirtableString(discordUser.id)
    const formula = `{Discord Username} = '${escapedDiscordId}'`

    const record = await findRecord<PersonFields>(Tables.People, formula)

    if (!record) {
      // User not found in our system
      console.log('Discord user not found in Airtable:', discordUser.id)
      return NextResponse.redirect(
        new URL('/portal/login?error=discord_not_linked', request.url)
      )
    }

    if (!record.fields.Email) {
      console.error('User found but has no email:', record.id)
      return NextResponse.redirect(
        new URL('/portal/login?error=no_email', request.url)
      )
    }

    // Create session
    const isStaff = record.fields.Tier === 'Staff'
    await createSession(record.id, record.fields.Email, record.fields.Name, isStaff)

    console.log('Discord login successful for:', record.fields.Email)

    // Redirect to portal
    return NextResponse.redirect(new URL('/portal', request.url))
  } catch (error) {
    console.error('Discord OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/portal/login?error=server', request.url)
    )
  }
}
