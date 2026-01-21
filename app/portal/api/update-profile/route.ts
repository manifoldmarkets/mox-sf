import { getSession } from '@/app/lib/session'
import { syncDiscordRole, isDiscordConfigured } from '@/app/lib/discord'
import { updateRecord, Tables } from '@/app/lib/airtable'

const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]

function isValidURL(url: string): boolean {
  if (!url) return true // Empty is okay
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidDiscordUsername(username: string): boolean {
  if (!username) return true // Empty is okay (unlinking)
  // Discord usernames: 2-32 chars, lowercase letters, numbers, underscores, periods
  // New format (2023+): no discriminator, just username
  const trimmed = username.trim().toLowerCase()
  if (trimmed.length < 2 || trimmed.length > 32) return false
  // Allow alphanumeric, underscores, periods
  return /^[a-z0-9_.]+$/.test(trimmed)
}

interface PersonFields {
  Name?: string
  Website?: string
  'Discord Username'?: string | null
  'Show in directory'?: boolean
  Photo?: { url: string; filename: string }[]
  Tier?: string
  Status?: string
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const name = formData.get('name') as string
    const website = formData.get('website') as string
    const discordUsername = formData.get('discordUsername') as string | null
    const directoryVisible = formData.get('directoryVisible') === 'true'
    const photoFile = formData.get('photo') as File | null

    // Verify the user is updating their own profile
    if (userId !== session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Validate name
    if (!name || name.trim().length === 0) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    if (name.length > 200) {
      return Response.json(
        { error: 'Name is too long (max 200 characters)' },
        { status: 400 }
      )
    }

    // Validate website URL
    const trimmedWebsite = website?.trim() || ''
    if (trimmedWebsite && !isValidURL(trimmedWebsite)) {
      return Response.json({ error: 'Invalid website URL' }, { status: 400 })
    }

    // Validate Discord username
    const trimmedDiscord = discordUsername?.trim().toLowerCase() || ''
    if (trimmedDiscord && !isValidDiscordUsername(trimmedDiscord)) {
      return Response.json(
        {
          error:
            'Invalid Discord username. Use 2-32 characters: lowercase letters, numbers, underscores, or periods.',
        },
        { status: 400 }
      )
    }

    // Prepare fields to update
    const fields: Partial<PersonFields> = {
      Name: name.trim(),
      Website: trimmedWebsite,
      'Discord Username': trimmedDiscord || null,
      'Show in directory': directoryVisible,
    }

    // Handle photo upload if provided
    if (photoFile && photoFile.size > 0) {
      // Validate file size
      if (photoFile.size > MAX_PHOTO_SIZE) {
        return Response.json(
          {
            error: `Photo is too large (max ${MAX_PHOTO_SIZE / 1024 / 1024}MB)`,
          },
          { status: 400 }
        )
      }

      // Validate file type
      if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
        return Response.json(
          {
            error: 'Invalid photo format. Allowed: JPEG, PNG, WebP, GIF, HEIC',
          },
          { status: 400 }
        )
      }

      try {
        // Convert photo to base64
        const arrayBuffer = await photoFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')
        const mimeType = photoFile.type

        // Airtable accepts attachments as URLs or data URLs
        fields.Photo = [
          {
            url: `data:${mimeType};base64,${base64}`,
            filename: photoFile.name,
          },
        ]
      } catch (photoError) {
        console.error('Error processing photo:', photoError)
        return Response.json(
          { error: 'Failed to process photo. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Update Airtable record
    const data = await updateRecord<PersonFields>(Tables.People, userId, fields)

    // Sync Discord role if username was provided and Discord is configured
    let discordSyncResult = null
    if (trimmedDiscord && isDiscordConfigured()) {
      const tier = data.fields.Tier || null
      const status = data.fields.Status || null
      discordSyncResult = await syncDiscordRole(trimmedDiscord, tier, status)
    }

    return Response.json({
      success: true,
      profile: data.fields,
      discordSync: discordSyncResult,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return Response.json(
      { error: 'An error occurred while updating your profile' },
      { status: 500 }
    )
  }
}
