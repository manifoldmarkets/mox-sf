import { getSession } from '@/app/lib/session';
import { stripe } from '@/app/lib/stripe';
import { env } from '@/app/lib/env';
import { getRecord, Tables } from '@/app/lib/airtable';
import { canIssueGuestDayPass } from '@/app/lib/membership';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const effectiveUserId = session.viewingAsUserId || session.userId;
    const record = await getRecord<{ Status?: string; Tier?: string }>(
      Tables.People,
      effectiveUserId
    );
    if (
      !canIssueGuestDayPass({
        status: record?.fields.Status ?? null,
        tier: record?.fields.Tier ?? null,
      })
    ) {
      return Response.json(
        { error: 'Guest day passes are only available to active paying members.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { stripeCustomerId, userName, userEmail } = body;

    if (!stripeCustomerId || !userName || !userEmail) {
      return Response.json({ error: 'Missing required information' }, { status: 400 });
    }

    // Get the base URL from the request or environment variable
    const requestUrl = new URL(request.url);
    const baseUrl = env.NEXT_PUBLIC_BASE_URL || `${requestUrl.protocol}//${requestUrl.host}`;

    // Create a checkout session for a $25 day pass
    // The payment intent ID will be stored in Airtable after successful payment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 2500, // $25.00
            product_data: {
              name: 'Mox Member Day Pass',
              description: 'Single day access pass for existing Mox members',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/day-pass/activate?id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/portal`,
      metadata: {
        type: 'member_day_pass',
        userName: userName,
        userEmail: userEmail,
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating day pass checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      {
        error: 'Failed to create checkout session',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
