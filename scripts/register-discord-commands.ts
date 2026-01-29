/**
 * Script to register Discord slash commands for the bot.
 * Run with: bun run scripts/register-discord-commands.ts
 */

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_GUILD_ID = '1339404214081687675'

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID environment variables')
  process.exit(1)
}

const commands = [
  {
    name: 'login',
    description: 'Get a magic link to access the MOX member portal',
  },
]

async function registerCommands() {
  // Register guild-specific commands (instant update, good for development)
  const url = `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/guilds/${DISCORD_GUILD_ID}/commands`

  console.log('Registering commands to guild:', DISCORD_GUILD_ID)

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Failed to register commands:', response.status, error)
    process.exit(1)
  }

  const data = await response.json()
  console.log('Successfully registered commands:')
  for (const cmd of data) {
    console.log(`  - /${cmd.name}: ${cmd.description}`)
  }
}

registerCommands().catch(console.error)
