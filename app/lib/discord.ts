// Discord API integration for role management

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID

// Map Airtable tiers to Discord role IDs
// You'll need to set these in your .env file
// Note: Staff role is NOT auto-synced to avoid permission issues
const TIER_TO_ROLE: Record<string, string | undefined> = {
  Friend: process.env.DISCORD_ROLE_FRIEND,
  Member: process.env.DISCORD_ROLE_MEMBER,
  Resident: process.env.DISCORD_ROLE_RESIDENT,
  'Private Office': process.env.DISCORD_ROLE_PRIVATE_OFFICE,
  Program: process.env.DISCORD_ROLE_PROGRAM,
}

// All member roles (for removing old roles when tier changes)
function getAllMemberRoleIds(): string[] {
  const roles = [
    process.env.DISCORD_ROLE_FRIEND,
    process.env.DISCORD_ROLE_MEMBER,
    process.env.DISCORD_ROLE_RESIDENT,
    process.env.DISCORD_ROLE_PRIVATE_OFFICE,
    process.env.DISCORD_ROLE_PROGRAM,
  ]
  return roles.filter((r): r is string => !!r)
}

/**
 * Helper to make Discord API requests with rate limit handling
 */
async function discordFetch(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  const headers = {
    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    ...options.headers,
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, { ...options, headers })

    if (response.status === 429) {
      // Rate limited - wait and retry
      const retryAfter = parseFloat(response.headers.get('retry-after') || '5')
      console.log(`Rate limited, waiting ${retryAfter}s before retry...`)
      await new Promise((resolve) =>
        setTimeout(resolve, (retryAfter + 0.5) * 1000)
      )
      continue
    }

    return response
  }

  // If we exhausted retries, return the last response
  return fetch(url, { ...options, headers })
}

interface DiscordMember {
  user: {
    id: string
    username: string
    global_name: string | null
  }
  nick: string | null
  roles: string[]
}

interface SyncResult {
  success: boolean
  error?: string
  discordUserId?: string
  roleAssigned?: string
  previousRoles?: string[]
}

/**
 * Find a Discord member by username in the guild
 */
export async function findDiscordMember(
  username: string
): Promise<DiscordMember | null> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    console.error('Discord bot token or guild ID not configured')
    return null
  }

  const normalizedUsername = username.toLowerCase().trim()

  try {
    // Search for member by query (Discord API v10)
    const searchUrl = `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/search?query=${encodeURIComponent(normalizedUsername)}&limit=10`

    const response = await discordFetch(searchUrl)

    if (!response.ok) {
      console.error(
        'Discord search failed:',
        response.status,
        await response.text()
      )
      return null
    }

    const members: DiscordMember[] = await response.json()

    // Find exact username match
    const exactMatch = members.find(
      (m) => m.user.username.toLowerCase() === normalizedUsername
    )

    return exactMatch || null
  } catch (error) {
    console.error('Error searching Discord member:', error)
    return null
  }
}

/**
 * Assign a role to a Discord member
 */
export async function assignRole(
  discordUserId: string,
  roleId: string
): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    return false
  }

  try {
    const response = await discordFetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}/roles/${roleId}`,
      { method: 'PUT' }
    )

    if (!response.ok && response.status !== 204) {
      console.error(
        'Failed to assign role:',
        response.status,
        await response.text()
      )
      return false
    }

    return true
  } catch (error) {
    console.error('Error assigning Discord role:', error)
    return false
  }
}

/**
 * Remove a role from a Discord member
 */
export async function removeRole(
  discordUserId: string,
  roleId: string
): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    return false
  }

  try {
    const response = await discordFetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}/roles/${roleId}`,
      { method: 'DELETE' }
    )

    if (!response.ok && response.status !== 204) {
      console.error(
        'Failed to remove role:',
        response.status,
        await response.text()
      )
      return false
    }

    return true
  } catch (error) {
    console.error('Error removing Discord role:', error)
    return false
  }
}

/**
 * Sync a member's Discord role based on their Airtable tier
 */
export async function syncDiscordRole(
  discordUsername: string,
  tier: string | null,
  status: string | null
): Promise<SyncResult> {
  // Only sync for active members (Staff excluded - managed manually)
  const activeTiers = [
    'Friend',
    'Member',
    'Resident',
    'Private Office',
    'Program',
  ]
  const isActive = status === 'Joined' && tier && activeTiers.includes(tier)

  if (!isActive) {
    return {
      success: false,
      error: 'User is not an active member',
    }
  }

  // Find the Discord member
  const member = await findDiscordMember(discordUsername)
  if (!member) {
    return {
      success: false,
      error: `Discord user "${discordUsername}" not found in server`,
    }
  }

  // Get the target role for this tier
  const targetRoleId = TIER_TO_ROLE[tier]
  if (!targetRoleId) {
    return {
      success: false,
      error: `No Discord role configured for tier: ${tier}`,
    }
  }

  // Remove any existing member roles (except the one we're assigning)
  const allMemberRoles = getAllMemberRoleIds()
  const rolesToRemove = allMemberRoles.filter(
    (r) => r !== targetRoleId && member.roles.includes(r)
  )

  for (const roleId of rolesToRemove) {
    await removeRole(member.user.id, roleId)
  }

  // Assign the new role if they don't already have it
  if (!member.roles.includes(targetRoleId)) {
    const assigned = await assignRole(member.user.id, targetRoleId)
    if (!assigned) {
      return {
        success: false,
        error: 'Failed to assign Discord role',
        discordUserId: member.user.id,
      }
    }
  }

  return {
    success: true,
    discordUserId: member.user.id,
    roleAssigned: targetRoleId,
    previousRoles: rolesToRemove,
  }
}

/**
 * Check if Discord integration is configured
 */
export function isDiscordConfigured(): boolean {
  return !!(DISCORD_BOT_TOKEN && DISCORD_GUILD_ID)
}

/**
 * Rename a Discord channel
 */
export async function renameDiscordChannel(
  channelId: string,
  newName: string
): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN) {
    console.error('[Discord] Bot token not configured')
    return false
  }

  try {
    const response = await discordFetch(
      `https://discord.com/api/v10/channels/${channelId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
        }),
      }
    )

    if (!response.ok) {
      console.error(
        '[Discord] Failed to rename channel:',
        response.status,
        await response.text()
      )
      return false
    }

    return true
  } catch (error) {
    console.error('[Discord] Rename channel error:', error)
    return false
  }
}

/**
 * Send a message to a Discord channel
 */
export async function sendChannelMessage(
  channelId: string,
  content: string
): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN) {
    console.error('[Discord] Bot token not configured')
    return false
  }

  try {
    const response = await discordFetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      }
    )

    if (!response.ok) {
      console.error(
        '[Discord] Failed to send message:',
        response.status,
        await response.text()
      )
      return false
    }

    return true
  } catch (error) {
    console.error('[Discord] Send message error:', error)
    return false
  }
}
