import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/app/lib/env'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

/**
 * Discord OAuth2 authorization endpoint
 * Redirects users to Discord to authorize the application
 */
export async function GET(request: NextRequest) {
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL('/portal/login?error=discord_not_configured', request.url)
    )
  }

  // Generate a state parameter for CSRF protection
  const state = randomBytes(16).toString('hex')

  // Store state in a cookie for verification in the callback
  const cookieStore = await cookies()
  cookieStore.set('discord_oauth_state', state, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  // Build the Discord OAuth2 authorization URL
  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/portal/auth/discord/callback`,
    response_type: 'code',
    scope: 'identify', // We only need basic user info
    state,
  })

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

  return NextResponse.redirect(discordAuthUrl)
}
