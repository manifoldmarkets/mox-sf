# Discord Integration

This document describes the Discord bot integration for member role management and notifications.

## Overview

The Discord integration:
- Syncs membership tiers from Airtable to Discord roles
- Updates channel names to display door codes
- Posts notifications about code rotations

## Environment Variables

All Discord variables are **optional**. If not configured, Discord features are silently disabled.

```
DISCORD_BOT_TOKEN              # Bot authentication token
DISCORD_GUILD_ID               # Server ID
DISCORD_ROLE_FRIEND            # Role ID for Friend tier
DISCORD_ROLE_MEMBER            # Role ID for Member tier
DISCORD_ROLE_RESIDENT          # Role ID for Resident tier
DISCORD_ROLE_PRIVATE_OFFICE    # Role ID for Private Office tier
DISCORD_ROLE_PROGRAM           # Role ID for Program tier
DISCORD_DOOR_CODE_CHANNEL_ID   # Channel for door code display
DISCORD_PACKAGES_CHANNEL_ID    # Channel for notifications
```

## Role Mapping

| Airtable Tier | Discord Role | Auto-Synced |
|---------------|--------------|-------------|
| Friend | Friend | Yes |
| Member | Member | Yes |
| Resident | Resident | Yes |
| Private Office | Private Office | Yes |
| Program | Program | Yes |
| Staff | (manual) | No |

**Notes:**
- Only members with `Status = "Joined"` get roles
- Staff roles are managed manually to avoid permission issues
- Changing tiers removes old role and adds new one

## Core Functions

Located in [discord.ts](../app/lib/discord.ts):

### `syncDiscordRole(discordUsername, tier, status)`
Main sync function. Finds member, removes old tier roles, assigns new role based on tier.

### `findDiscordMember(username)`
Searches guild for member by username. Returns Discord user ID if found.

### `assignRole(discordUserId, roleId)` / `removeRole(...)`
Low-level role management via Discord API.

### `renameDiscordChannel(channelId, newName)`
Updates channel name (used for door code display).

### `sendChannelMessage(channelId, content)`
Posts message to a channel.

### `isDiscordConfigured()`
Returns true if bot token and guild ID are set.

## API Endpoints

### POST `/portal/api/sync-discord-role`
Sync role for a single user.

- **Auth:** User (own role) or Staff
- **Body:** `{ discordUsername, tier, status, userId }`

### POST `/portal/api/bulk-sync-discord-roles`
Sync roles for all members with Discord usernames.

- **Auth:** Staff only
- **Rate limiting:** 1.5s delay between requests

### POST `/portal/api/update-discord`
Bulk update Discord usernames in Airtable.

- **Auth:** Staff only
- **Body:** `{ mappings: [{ personId, discordUsername }] }`

## Admin Tools

Located at `/portal/admin/discord-mapping`:

### Discord Mapping Tool
Matches Discord members to Airtable records using fuzzy matching:
- Parses various Discord export formats
- Uses Levenshtein distance for name matching
- Prioritizes server nicknames (often real names)
- 70% confidence threshold for auto-match

### Bulk Role Sync
One-click sync for all linked Discord members.

## Door Code Integration

The weekly cron job (`/api/cron/rotate-door-code`) updates Discord:

1. Renames door code channel: `🚪 Code: 1234#`
2. Posts to packages channel with rotation notice

## Notification Types

The bot posts notifications to `DISCORD_PACKAGES_CHANNEL_ID` (aka #notifications):

| Event | Message Format |
|-------|----------------|
| Door code rotation | Weekly code change announcement |
| Package arrival | Package notification for member |
| EAG day pass registration | Name, email, and website of registrant |

### EAG Day Pass Notifications

When someone registers for an EAG day pass at `/eag26`, a notification is posted:

```
🎫 **EAG Day Pass Registration**
**Name:** John Doe
**Email:** john@example.com
**Website:** https://linkedin.com/in/johndoe
```

This is triggered by `POST /eag26/api/register`.

## Rate Limiting

Built into `discordFetch()`:
- Automatic retry on rate limit
- Respects `retry-after` header
- Max 3 retry attempts

## Bot Permissions Required

The Discord bot needs:
- Manage Roles (to assign/remove tier roles)
- Manage Channels (to rename door code channel)
- Send Messages (for notifications)
- View Channel (to access channels)

Bot role must be **higher** than the tier roles it manages.

## Troubleshooting

**Role sync fails with 403:**
- Bot role may be below the target role in hierarchy
- Check bot has "Manage Roles" permission

**Member not found:**
- User may have left the server
- Username may have changed (Discord allows this)

**Rate limited:**
- Bulk sync has built-in delays
- Wait for retry-after period

**Discord not configured:**
- Check environment variables are set
- `isDiscordConfigured()` returns false if missing
