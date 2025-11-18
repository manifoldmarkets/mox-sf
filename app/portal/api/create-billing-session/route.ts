import { getSession } from '@/app/lib/session';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { stripeCustomerId } = body;

    if (!stripeCustomerId) {
      return Response.json({ error: 'No Stripe customer ID provided' }, { status: 400 });
    }

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/portal`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return Response.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
