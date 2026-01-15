/**
 * Script to register Discord slash commands for the Mox event bot.
 *
 * Run this script once when setting up the bot or when changing commands:
 *   bun run scripts/register-discord-commands.ts
 *
 * Required environment variables:
 *   DISCORD_APPLICATION_ID - Your Discord application ID
 *   DISCORD_BOT_TOKEN - Your Discord bot token
 *   DISCORD_GUILD_ID (optional) - For guild-specific commands (faster updates during dev)
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10'

interface SlashCommand {
  name: string
  description: string
  type?: number
  options?: CommandOption[]
}

interface CommandOption {
  name: string
  description: string
  type: number
  required?: boolean
}

// Application command option types
const OptionType = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTACHMENT: 11,
}

// Define the commands to register
const commands: SlashCommand[] = [
  {
    name: 'add-event',
    description: 'Add an event to the Mox calendar',
    type: 1, // CHAT_INPUT
    options: [
      {
        name: 'request',
        description:
          'Describe the event (e.g., "yoga class at 7pm Thursday" or "repeat cafe event every Friday")',
        type: OptionType.STRING,
        required: true,
      },
    ],
  },
]

async function registerCommands() {
  const applicationId = process.env.DISCORD_APPLICATION_ID
  const botToken = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID // Optional: for guild-specific commands

  if (!applicationId || !botToken) {
    console.error('Error: Missing required environment variables')
    console.error('Required: DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN')
    process.exit(1)
  }

  // Determine endpoint - guild commands update instantly, global take up to 1 hour
  const endpoint = guildId
    ? `${DISCORD_API_BASE}/applications/${applicationId}/guilds/${guildId}/commands`
    : `${DISCORD_API_BASE}/applications/${applicationId}/commands`

  console.log(`Registering ${commands.length} command(s)...`)
  console.log(`Endpoint: ${guildId ? `Guild (${guildId})` : 'Global'}`)

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${botToken}`,
      },
      body: JSON.stringify(commands),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to register commands:', error)
      process.exit(1)
    }

    const data = await response.json()
    console.log('Successfully registered commands:')
    data.forEach((cmd: { name: string; id: string }) => {
      console.log(`  - /${cmd.name} (ID: ${cmd.id})`)
    })

    if (!guildId) {
      console.log('\nNote: Global commands may take up to 1 hour to propagate.')
      console.log('For faster testing, set DISCORD_GUILD_ID for guild-specific commands.')
    }
  } catch (error) {
    console.error('Error registering commands:', error)
    process.exit(1)
  }
}

// Run the script
registerCommands()
