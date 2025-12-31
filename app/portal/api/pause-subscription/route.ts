import { getSession } from '@/app/lib/session';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// Send email notification to staff
async function notifyStaff(userEmail: string, userName: string, resumeDate: string | null, reason: string) {
  const pauseInfo = resumeDate
    ? `Resume on: ${new Date(resumeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
    : 'Paused indefinitely';

  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('[Pause Subscription] No Resend API key found');
      return;
    }

    const emailBody = `
User: ${userName} (${userEmail})
${pauseInfo}
Reason: ${reason}

This is an automated notification from the member portal.
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: ['team@moxsf.com'],
        subject: `Subscription Pause: ${userName}`,
        text: emailBody,
      }),
    });

    const responseData = await response.json();
    console.log('[Pause Subscription] Resend API response:', response.status, responseData);
  } catch (error) {
    console.error('[Pause Subscription] Failed to send notification email:', error);
  }
}

// Send email notification to staff when subscription is resumed
async function notifyStaffResume(userEmail: string, userName: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('[Resume Subscription] No Resend API key found');
      return;
    }

    const emailBody = `
User: ${userName} (${userEmail})

This is an automated notification from the member portal.
    `.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Member Portal <portal@account.moxsf.com>',
        to: ['team@moxsf.com'],
        subject: `Subscription Resumed: ${userName}`,
        text: emailBody,
      }),
    });

    const responseData = await response.json();
    console.log('[Resume Subscription] Resend API response:', response.status, responseData);
  } catch (error) {
    console.error('[Resume Subscription] Failed to send notification email:', error);
  }
}


// Get user info from Airtable
async function getUserInfo(userId: string) {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return {
    email: data.fields?.['Email'] || '',
    name: data.fields?.['Name'] || '',
    customerId: data.fields?.['Stripe Customer ID'] || '',
  };
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeDate, reason } = await request.json();

    // Validate reason
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return Response.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Validate resumeDate if provided
    if (resumeDate) {
      const resumeDateObj = new Date(resumeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      if (resumeDateObj < today) {
        return Response.json({ error: 'Resume date must be in the future' }, { status: 400 });
      }
    }

    // Get user information
    const userInfo = await getUserInfo(session.userId);
    if (!userInfo || !userInfo.customerId) {
      return Response.json({ error: 'User or subscription not found' }, { status: 404 });
    }

    // Get the user's active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: userInfo.customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const subscription = subscriptions.data[0];

    // Calculate pause end date from resumeDate if provided
    let pauseEndTimestamp: number | undefined = undefined;
    let pausedUntilString: string | null = null;

    if (resumeDate) {
      // Convert the date string to a Unix timestamp (start of day in user's timezone)
      const resumeDateObj = new Date(resumeDate);
      pauseEndTimestamp = Math.floor(resumeDateObj.getTime() / 1000);
      pausedUntilString = resumeDateObj.toISOString();
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
    });

    // Notify staff
    await notifyStaff(userInfo.email, userInfo.name, resumeDate, reason);

    return Response.json({
      success: true,
      pausedUntil: pausedUntilString,
      indefinite: !resumeDate,
    });
  } catch (error) {
    console.error('[Pause Subscription] Error pausing subscription:', error);
    return Response.json({ error: 'Failed to pause subscription' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user information
    const userInfo = await getUserInfo(session.userId);
    if (!userInfo || !userInfo.customerId) {
      return Response.json({ error: 'User or subscription not found' }, { status: 404 });
    }

    // Get the user's paused subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: userInfo.customerId,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return Response.json({ error: 'No subscription found' }, { status: 404 });
    }

    const subscription = subscriptions.data[0];

    // Check if subscription is paused
    if (!subscription.pause_collection) {
      return Response.json({ error: 'Subscription is not paused' }, { status: 400 });
    }

    // Resume the subscription - Stripe automatically handles billing cycle adjustment
    await stripe.subscriptions.update(subscription.id, {
      pause_collection: null,
      metadata: {
        pause_reason: '',
      },
    });

    // Notify staff about resume
    await notifyStaffResume(userInfo.email, userInfo.name);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Pause Subscription] Error resuming subscription:', error);
    return Response.json({ error: 'Failed to resume subscription' }, { status: 500 });
  }
}
