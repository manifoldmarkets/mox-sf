import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { syncDiscordRole, isDiscordConfigured } from '@/app/lib/discord'

/**
 * POST: Sync Discord role for a specific user (staff only, or self)
 * Used after profile update or for manual sync
 */
export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDiscordConfigured()) {
    return NextResponse.json(
      { error: 'Discord integration not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { discordUsername, tier, status, userId } = body

    // Only allow syncing own role, or staff can sync anyone
    if (userId !== session.userId && !session.isStaff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!discordUsername) {
      return NextResponse.json(
        { error: 'Discord username required' },
        { status: 400 }
      )
    }

    const result = await syncDiscordRole(discordUsername, tier, status)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      discordUserId: result.discordUserId,
      roleAssigned: result.roleAssigned,
    })
  } catch (error) {
    console.error('Error syncing Discord role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
