import { getSession } from '@/app/lib/session'
import { getRecord, Tables } from '@/app/lib/airtable'
import Stripe from 'stripe'
import { env } from '@/app/lib/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
})

interface PersonFields {
  Email?: string
  Name?: string
  'Stripe Customer ID'?: string
}

// Send email notification to staff
async function notifyStaff(
  userEmail: string,
  userName: string,
  resumeDate: string | null,
  reason: string
) {
  const pauseInfo = resumeDate
    ? `Resume on: ${new Date(resumeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
    : 'Paused indefinitely'

  try {
    const resendApiKey = env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('[Pause Subscription] No Resend API key found')
      return
    }

    const emailBody = `
User: ${userName} (${userEmail})
${pauseInfo}
Reason: ${reason}

This is an automated notification from the member portal.
    `.trim()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: ['team@moxsf.com'],
        subject: `Subscription Pause: ${userName}`,
        text: emailBody,
      }),
    })

    if (!response.ok) {
      const responseData = await response.json()
      console.error('[Pause Subscription] Resend API error:', response.status, responseData)
    }
  } catch (error) {
    console.error(
      '[Pause Subscription] Failed to send notification email:',
      error
    )
  }
}

// Send confirmation email to the user about their subscription pause
async function notifyUserPause(
  userEmail: string,
  userName: string,
  resumeDate: string | null,
  reason: string
) {
  const pauseInfo = resumeDate
    ? `Your subscription will automatically resume on ${new Date(resumeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
    : 'Your subscription is paused indefinitely. You can resume it anytime from your member portal.'

  try {
    const resendApiKey = env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('[Pause Subscription] No Resend API key found')
      return
    }

    const emailBody = `
Hi ${userName},

Your Mox membership has been paused.

${pauseInfo}

Reason: ${reason}

If you have any questions, please contact us at team@moxsf.com.

Best,
The Mox Team
    `.trim()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: [userEmail],
        subject: 'Your Mox Membership Has Been Paused',
        text: emailBody,
      }),
    })

    const responseData = await response.json()
    console.log(
      '[Pause Subscription] User notification response:',
      response.status,
      responseData
    )
  } catch (error) {
    console.error(
      '[Pause Subscription] Failed to send user notification email:',
      error
    )
  }
}

// Send notification to admin when they pause a subscription for another user
async function notifyAdminPause(
  adminEmail: string,
  adminName: string,
  userEmail: string,
  userName: string,
  resumeDate: string | null,
  reason: string
) {
  const pauseInfo = resumeDate
    ? `Resume on: ${new Date(resumeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
    : 'Paused indefinitely'

  try {
    const resendApiKey = env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('[Pause Subscription] No Resend API key found')
      return
    }

    const emailBody = `
Hi ${adminName},

You have paused the membership for ${userName} (${userEmail}).

${pauseInfo}
Reason: ${reason}

This is a confirmation of the action you took in the member portal.

Best,
The Mox Team
    `.trim()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: [adminEmail],
        subject: `Confirmation: You Paused ${userName}'s Membership`,
        text: emailBody,
      }),
    })

    const responseData = await response.json()
    console.log(
      '[Pause Subscription] Admin notification response:',
      response.status,
      responseData
    )
  } catch (error) {
    console.error(
      '[Pause Subscription] Failed to send admin notification email:',
      error
    )
  }
}

// Send email notification to staff when subscription is resumed
async function notifyStaffResume(userEmail: string, userName: string) {
  try {
    const resendApiKey = env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('[Resume Subscription] No Resend API key found')
      return
    }

    const emailBody = `
User: ${userName} (${userEmail})

This is an automated notification from the member portal.
    `.trim()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: ['team@moxsf.com'],
        subject: `Subscription Resumed: ${userName}`,
        text: emailBody,
      }),
    })

    const responseData = await response.json()
    console.log(
      '[Resume Subscription] Resend API response:',
      response.status,
      responseData
    )
  } catch (error) {
    console.error(
      '[Resume Subscription] Failed to send notification email:',
      error
    )
  }
}

// Send confirmation email to the user about their subscription resuming
async function notifyUserResume(userEmail: string, userName: string) {
  try {
    const resendApiKey = env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('[Resume Subscription] No Resend API key found')
      return
    }

    const emailBody = `
Hi ${userName},

Your Mox membership has been resumed and is now active again.

Your next billing cycle will begin according to your subscription schedule.

If you have any questions, please contact us at team@moxsf.com.

Best,
The Mox Team
    `.trim()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: [userEmail],
        subject: 'Your Mox Membership Has Been Resumed',
        text: emailBody,
      }),
    })

    const responseData = await response.json()
    console.log(
      '[Resume Subscription] User notification response:',
      response.status,
      responseData
    )
  } catch (error) {
    console.error(
      '[Resume Subscription] Failed to send user notification email:',
      error
    )
  }
}

// Send notification to admin when they resume a subscription for another user
async function notifyAdminResume(
  adminEmail: string,
  adminName: string,
  userEmail: string,
  userName: string
) {
  try {
    const resendApiKey = env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('[Resume Subscription] No Resend API key found')
      return
    }

    const emailBody = `
Hi ${adminName},

You have resumed the membership for ${userName} (${userEmail}).

Their subscription is now active again.

This is a confirmation of the action you took in the member portal.

Best,
The Mox Team
    `.trim()

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: [adminEmail],
        subject: `Confirmation: You Resumed ${userName}'s Membership`,
        text: emailBody,
      }),
    })

    const responseData = await response.json()
    console.log(
      '[Resume Subscription] Admin notification response:',
      response.status,
      responseData
    )
  } catch (error) {
    console.error(
      '[Resume Subscription] Failed to send admin notification email:',
      error
    )
  }
}

// Get user info from Airtable
async function getUserInfo(userId: string) {
  const record = await getRecord<PersonFields>(Tables.People, userId)

  if (!record) {
    return null
  }

  return {
    email: record.fields.Email || '',
    name: record.fields.Name || '',
    customerId: record.fields['Stripe Customer ID'] || '',
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeDate, reason } = await request.json()

    // Validate reason
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return Response.json({ error: 'Reason is required' }, { status: 400 })
    }

    // Validate resumeDate if provided
    if (resumeDate) {
      const resumeDateObj = new Date(resumeDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today

      if (resumeDateObj < today) {
        return Response.json(
          { error: 'Resume date must be in the future' },
          { status: 400 }
        )
      }
    }

    // Get user information - use viewingAsUserId if staff is viewing as another user
    const effectiveUserId = session.viewingAsUserId || session.userId
    const userInfo = await getUserInfo(effectiveUserId)
    if (!userInfo || !userInfo.customerId) {
      return Response.json(
        { error: 'User or subscription not found' },
        { status: 404 }
      )
    }

    // Get the user's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: userInfo.customerId,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return Response.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    const subscription = subscriptions.data[0]

    // Calculate pause end date from resumeDate if provided
    let pauseEndTimestamp: number | undefined = undefined
    let pausedUntilString: string | null = null

    if (resumeDate) {
      // Convert the date string to a Unix timestamp (start of day in user's timezone)
      const resumeDateObj = new Date(resumeDate)
      pauseEndTimestamp = Math.floor(resumeDateObj.getTime() / 1000)
      pausedUntilString = resumeDateObj.toISOString()
    }

    // Pause the subscription in Stripe
    await stripe.subscriptions.update(subscription.id, {
      pause_collection: {
        behavior: 'void', // Don't collect payment, adjust billing cycle
        resumes_at: pauseEndTimestamp,
      },
      metadata: {
        pause_reason: reason,
      },
    })

    // Notify staff
    await notifyStaff(userInfo.email, userInfo.name, resumeDate, reason)

    // Notify the user
    await notifyUserPause(userInfo.email, userInfo.name, resumeDate, reason)

    // If an admin is acting on behalf of another user, notify the admin
    if (session.viewingAsUserId && session.viewingAsUserId === effectiveUserId) {
      await notifyAdminPause(
        session.email,
        session.name || 'Admin',
        userInfo.email,
        userInfo.name,
        resumeDate,
        reason
      )
    }

    return Response.json({
      success: true,
      pausedUntil: pausedUntilString,
      indefinite: !resumeDate,
    })
  } catch (error) {
    console.error('[Pause Subscription] Error pausing subscription:', error)
    return Response.json(
      { error: 'Failed to pause subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user information - use viewingAsUserId if staff is viewing as another user
    const effectiveUserId = session.viewingAsUserId || session.userId
    const userInfo = await getUserInfo(effectiveUserId)
    if (!userInfo || !userInfo.customerId) {
      return Response.json(
        { error: 'User or subscription not found' },
        { status: 404 }
      )
    }

    // Get the user's paused subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: userInfo.customerId,
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return Response.json({ error: 'No subscription found' }, { status: 404 })
    }

    const subscription = subscriptions.data[0]

    // Check if subscription is paused
    if (!subscription.pause_collection) {
      return Response.json(
        { error: 'Subscription is not paused' },
        { status: 400 }
      )
    }

    // Resume the subscription - Stripe automatically handles billing cycle adjustment
    await stripe.subscriptions.update(subscription.id, {
      pause_collection: null,
      metadata: {
        pause_reason: '',
      },
    })

    // Notify staff about resume
    await notifyStaffResume(userInfo.email, userInfo.name)

    // Notify the user
    await notifyUserResume(userInfo.email, userInfo.name)

    // If an admin is acting on behalf of another user, notify the admin
    if (session.viewingAsUserId && session.viewingAsUserId === effectiveUserId) {
      await notifyAdminResume(
        session.email,
        session.name || 'Admin',
        userInfo.email,
        userInfo.name
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Pause Subscription] Error resuming subscription:', error)
    return Response.json(
      { error: 'Failed to resume subscription' },
      { status: 500 }
    )
  }
}
