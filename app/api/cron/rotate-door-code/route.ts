import { renameDiscordChannel, sendChannelMessage, DISCORD_CHANNELS } from '@/app/lib/discord'
import { env } from '@/app/lib/env'

/**
 * Generate a cryptographically secure random 4-digit code
 */
function generateSecure4DigitCode(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  // Generate a number between 1000 and 9999 (4 digits, no leading zero)
  return ((array[0] % 9000) + 1000).toString()
}

/**
 * Get Verkada API authentication token
 */
async function getVerkadaToken(): Promise<string | null> {
  try {
    const tokenRes = await fetch('https://api.verkada.com/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': env.VERKADA_MEMBER_KEY,
      },
    })

    if (!tokenRes.ok) {
      console.error('[Verkada API] Failed to get token:', tokenRes.status)
      return null
    }

    const { token } = await tokenRes.json()
    return token
  } catch (error) {
    console.error('[Verkada API] Token error:', error)
    return null
  }
}

interface VerkadaUser {
  user_id: string
  entry_code?: string
}

/**
 * Get a Verkada user by their UUID
 */
async function getVerkadaUserById(
  userId: string,
  token: string
): Promise<VerkadaUser | null> {
  try {
    const response = await fetch(
      `https://api.verkada.com/access/v1/access_users/user?user_id=${encodeURIComponent(userId)}`,
      {
        headers: {
          accept: 'application/json',
          'x-verkada-auth': token,
        },
      }
    )

    if (!response.ok) {
      console.error('[Verkada API] Failed to get user:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[Verkada API] Get user error:', error)
    return null
  }
}

/**
 * Set entry code for a Verkada user by UUID
 */
async function setVerkadaEntryCode(
  userId: string,
  entryCode: string,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.verkada.com/access/v1/access_users/user/entry_code?user_id=${encodeURIComponent(userId)}&override=true`,
      {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-verkada-auth': token,
        },
        body: JSON.stringify({
          entry_code: entryCode,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        '[Verkada API] Failed to set entry code:',
        response.status,
        errorText
      )
      return false
    }

    return true
  } catch (error) {
    console.error('[Verkada API] Set entry code error:', error)
    return false
  }
}

export async function GET(request: Request) {
  const startTime = Date.now()

  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    console.error('[Cron rotate-door-code] Unauthorized request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Cron rotate-door-code] Starting weekly door code rotation...')

  try {
    // Get Verkada API token
    const token = await getVerkadaToken()
    if (!token) {
      throw new Error('Failed to get Verkada API token')
    }

    // Step 1: Get current code from "Weekly Access" user
    const weeklyUser = await getVerkadaUserById(env.VERKADA_WEEKLY_ACCESS_USER_ID, token)
    if (!weeklyUser) {
      throw new Error('Failed to fetch Weekly Access user')
    }

    const oldCode = weeklyUser.entry_code
    if (!oldCode) {
      console.warn(
        '[Cron rotate-door-code] Weekly Access user has no entry code'
      )
    }

    // Step 2: Generate new 4-digit code
    const newCode = generateSecure4DigitCode()
    console.log(`[Cron rotate-door-code] Generated new code: ${newCode}`)

    // Step 3: Move old code to "Old Weekly Access" user
    if (oldCode) {
      const movedOldCode = await setVerkadaEntryCode(
        env.VERKADA_OLD_WEEKLY_ACCESS_USER_ID,
        oldCode,
        token
      )
      if (!movedOldCode) {
        throw new Error('Failed to set old code on Old Weekly Access user')
      }
      console.log(
        '[Cron rotate-door-code] Moved old code to Old Weekly Access user'
      )
    }

    // Step 4: Set new code on "Weekly Access" user
    const setNewCode = await setVerkadaEntryCode(
      env.VERKADA_WEEKLY_ACCESS_USER_ID,
      newCode,
      token
    )
    if (!setNewCode) {
      throw new Error('Failed to set new code on Weekly Access user')
    }
    console.log('[Cron rotate-door-code] Set new code on Weekly Access user')

    // Step 5: Update Discord channel name
    const channelRenamed = await renameDiscordChannel(
      DISCORD_CHANNELS.DOOR_CODE,
      `🚪 Code: ${newCode}#`
    )
    if (!channelRenamed) {
      // Log error but don't fail - Verkada changes succeeded
      console.error('[Cron rotate-door-code] Failed to rename Discord channel')
    } else {
      console.log('[Cron rotate-door-code] Updated Discord channel name')
    }

    // Step 6: Post message to #packages channel
    const nextMonday = new Date()
    nextMonday.setDate(nextMonday.getDate() + 7)
    const expiryDate = nextMonday.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

    let messageSent = false
    if (oldCode) {
      messageSent = await sendChannelMessage(
        DISCORD_CHANNELS.PACKAGES,
        `Door code has rotated, for package deliveries, the old door code **${oldCode}#** will continue to work until ${expiryDate}.`
      )
      if (!messageSent) {
        console.error(
          '[Cron rotate-door-code] Failed to send message to #packages'
        )
      } else {
        console.log(
          '[Cron rotate-door-code] Posted rotation message to #packages'
        )
      }
    }

    const duration = Date.now() - startTime
    console.log(`[Cron rotate-door-code] Completed in ${duration}ms`)

    return Response.json({
      success: true,
      newCode,
      oldCode: oldCode || null,
      discordUpdated: channelRenamed,
      messageSent,
      durationMs: duration,
    })
  } catch (error) {
    console.error('[Cron rotate-door-code] Error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
