// Discord server configuration
// These IDs are public and can be checked in the Discord app

export const DISCORD_GUILD_ID = '1339404214081687675'

// Role IDs for membership tiers
export const DISCORD_ROLES = {
  FRIEND: '1395888120855134278',
  MEMBER: '1395888265919467680',
  RESIDENT: '1395877757585461407',
  PRIVATE_OFFICE: '1461980016999927875',
  PROGRAM: '1461978789956554806',
  GUEST_PROGRAM: '1465090219597627444',
} as const

// Channel IDs
export const DISCORD_CHANNELS = {
  DOOR_CODE: '1360304053887701092',
  PACKAGES: '1409615290353844397',
  NOTIFICATIONS: '1465054507816980523',
  ROOM_AVAILABILITY: '1466343013146951774',
} as const

// Message ID for the room availability status message that gets edited
export const DISCORD_ROOM_AVAILABILITY_MESSAGE_ID = '1466343657014558742'

// Map Airtable tiers to Discord role IDs
export const TIER_TO_ROLE: Record<string, string> = {
  Friend: DISCORD_ROLES.FRIEND,
  Member: DISCORD_ROLES.MEMBER,
  Resident: DISCORD_ROLES.RESIDENT,
  'Private Office': DISCORD_ROLES.PRIVATE_OFFICE,
  Program: DISCORD_ROLES.PROGRAM,
  'Guest Program': DISCORD_ROLES.GUEST_PROGRAM,
}

// All member role IDs (for removing old roles when tier changes)
export const ALL_MEMBER_ROLE_IDS = Object.values(DISCORD_ROLES)

// Tiers that should have Discord roles synced
export const ACTIVE_TIERS = [
  'Friend',
  'Member',
  'Resident',
  'Private Office',
  'Program',
  'Guest Program',
]
