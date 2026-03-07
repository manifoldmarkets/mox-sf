import { renameDiscordChannel, sendChannelMessage, DISCORD_CHANNELS } from '@/app/lib/discord'
import { env } from '@/app/lib/env'
import { withAutomation } from '@/app/lib/automation'

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
async function getVerkadaToken(): Promise<string> {
  const tokenRes = await fetch('https://api.verkada.com/token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'x-api-key': env.VERKADA_MEMBER_KEY,
    },
  })

  if (!tokenRes.ok) {
    throw new Error(`Verkada token request failed: ${tokenRes.status}`)
  }

  const { token } = await tokenRes.json()
  return token
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
): Promise<VerkadaUser> {
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
    throw new Error(`Verkada get user failed: ${response.status}`)
  }

  return await response.json()
}

/**
 * Set entry code for a Verkada user by UUID
 */
async function setVerkadaEntryCode(
  userId: string,
  entryCode: string,
  token: string
): Promise<void> {
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
    throw new Error(`Verkada set entry code failed: ${response.status} ${errorText}`)
  }
}

export const GET = withAutomation({ type: 'cron' }, async (run) => {
  const token = await run.step('Get Verkada API token', () => getVerkadaToken())

  const weeklyUser = await run.step('Fetch current door code', () =>
    getVerkadaUserById(env.VERKADA_WEEKLY_ACCESS_USER_ID, token)
  )

  const oldCode = weeklyUser.entry_code
  const newCode = generateSecure4DigitCode()

  if (oldCode) {
    await run.step('Move old code to backup user', () =>
      setVerkadaEntryCode(env.VERKADA_OLD_WEEKLY_ACCESS_USER_ID, oldCode, token)
    )
  } else {
    run.skip('Move old code to backup user')
  }

  await run.step('Set new code on weekly user', () =>
    setVerkadaEntryCode(env.VERKADA_WEEKLY_ACCESS_USER_ID, newCode, token)
  )

  await run.step('Update Discord channel name', () =>
    renameDiscordChannel(DISCORD_CHANNELS.DOOR_CODE, `🚪 Code: ${newCode}#`)
  )

  if (oldCode) {
    const nextMonday = new Date()
    nextMonday.setDate(nextMonday.getDate() + 7)
    const expiryDate = nextMonday.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

    await run.step('Post rotation notice to #packages', () =>
      sendChannelMessage(
        DISCORD_CHANNELS.PACKAGES,
        `Door code has rotated, for package deliveries, the old door code **${oldCode}#** will continue to work until ${expiryDate}.`
      )
    )
  } else {
    run.skip('Post rotation notice to #packages')
  }

  return { newCode, oldCode: oldCode || null }
})
