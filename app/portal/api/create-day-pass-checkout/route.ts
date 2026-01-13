import { getSession } from '@/app/lib/session';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      console.error('Day pass checkout: User not logged in');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { stripeCustomerId, userName, userEmail } = body;

    console.log('Day pass checkout request:', { stripeCustomerId, userName, userEmail });

    if (!stripeCustomerId || !userName || !userEmail) {
      console.error('Day pass checkout: Missing required fields', { stripeCustomerId, userName, userEmail });
      return Response.json({ error: 'Missing required information' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Day pass checkout: STRIPE_SECRET_KEY not configured');
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('Day pass checkout: NEXT_PUBLIC_BASE_URL not configured');
      return Response.json({ error: 'Base URL not configured' }, { status: 500 });
    }

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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/day-pass/activate?payment_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/portal`,
      metadata: {
        type: 'member_day_pass',
        userName: userName,
        userEmail: userEmail,
      },
    });

    console.log('Day pass checkout session created:', checkoutSession.id);
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
