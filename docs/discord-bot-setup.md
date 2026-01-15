# Mox Discord Event Bot Setup

This document explains how to set up the Discord bot for adding events to the Mox calendar.

## Overview

The bot uses Discord's HTTP-based interactions (slash commands) hosted on Vercel. Users can run `/add-event` in Discord to propose events, which are then created in Airtable with "idea" status.

## Architecture

```
Discord → POST /api/discord/interactions → Parse request → Propose event → User confirms → Create in Airtable
```

**Files:**
- `/app/api/discord/interactions/route.ts` - Main webhook handler
- `/app/lib/discord.ts` - Discord utilities (signature verification, response builders)
- `/app/lib/discord-events.ts` - Event parsing and Airtable integration
- `/scripts/register-discord-commands.ts` - Command registration script

## Setup Steps

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it (e.g., "Moxette")
3. Note down the **Application ID** and **Public Key** from the General Information page

### 2. Create Bot User

1. Go to the "Bot" section in your application
2. Click "Reset Token" to generate a bot token (save it securely!)
3. Under "Privileged Gateway Intents", you can leave all off (we use interactions, not message content)

### 3. Set Environment Variables

Add these to your `.env.local` and Vercel environment:

```bash
DISCORD_APPLICATION_ID=your_application_id
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id  # Optional: for faster command updates during dev
```

### 4. Deploy to Vercel

Deploy your changes to Vercel so the `/api/discord/interactions` endpoint is live.

### 5. Configure Discord Interactions URL

1. In Discord Developer Portal, go to your application
2. Go to "General Information"
3. Set **Interactions Endpoint URL** to: `https://moxsf.com/api/discord/interactions`
4. Discord will send a PING to verify - if verification fails, check your logs

### 6. Register Slash Commands

Run the registration script:

```bash
bun run register-discord
```

Or for guild-specific commands (faster updates during development):

```bash
DISCORD_GUILD_ID=your_guild_id bun run register-discord
```

### 7. Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions: `Send Messages`, `Use Slash Commands`
4. Copy the generated URL and open it to invite the bot to your server

## Usage

Users can run:
```
/add-event yoga class at 7pm on Thursday
/add-event repeat my cafe event every Friday
/add-event team dinner at 6:30pm on Jan 25
```

The bot will:
1. Parse the request using Claude
2. Display a proposal with confirm/cancel buttons
3. On confirmation, create the event(s) in Airtable with status "idea"
4. Provide a link to the portal for further edits

## Event Flow

```
User: /add-event yoga at 7pm Thursday
            ↓
Bot: Parses with Claude AI
            ↓
Bot: **Proposal:** yoga
     Thursday, January 16 at 7:00 PM - 9:00 PM PT
     Hosted by: @username
     Status: Idea
     [✅ Confirm] [❌ Cancel] [Use Form Instead]
            ↓
User: Clicks ✅ Confirm
            ↓
Bot: **Created "yoga"**
     Date: Thursday, January 16, 2025
     Time: 7:00 PM - 9:00 PM PT
     Status: **Idea** (pending confirmation)
     To edit details, visit: https://moxsf.com/portal
```

## Configuration

- **Timezone**: All times are interpreted as Pacific Time
- **Recurring Events**: Capped at 3 months (max ~13 occurrences)
- **Event Status**: Always created as "idea"
- **Complex Requests**: Bot will provide a prefilled form link instead

## Troubleshooting

### "Invalid signature" errors
- Verify `DISCORD_PUBLIC_KEY` is correct
- Make sure the endpoint URL in Discord matches your deployed URL

### Commands not appearing
- Global commands take up to 1 hour to propagate
- Use `DISCORD_GUILD_ID` for instant updates during testing
- Check that bot has `applications.commands` scope

### Event creation fails
- Verify `AIRTABLE_WRITE_KEY` is set and has write permissions
- Check Vercel logs for specific errors

### Bot not responding
- Check Vercel function logs
- Verify the interactions endpoint is returning 200 for PING
- Ensure bot has necessary permissions in the channel
