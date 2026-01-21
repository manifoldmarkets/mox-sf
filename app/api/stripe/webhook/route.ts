import Stripe from 'stripe';
import { NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if this is a member day pass purchase
      if (session.metadata?.type === 'member_day_pass') {
        const userName = session.metadata.userName;
        const userEmail = session.metadata.userEmail;

        // Create a record in Airtable "Day Passes" table
        const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
        const airtableResponse = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Day%20Passes`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: {
                Name: session.id, // Use checkout session ID as the payment ID
                Username: userName,
                Status: 'Unused',
                'Stripe link (from User)': `Member day pass - $25 - ${userEmail}`,
              },
            }),
          }
        );

        if (!airtableResponse.ok) {
          console.error('Failed to create Airtable record:', await airtableResponse.text());
          return Response.json({ error: 'Failed to create day pass record' }, { status: 500 });
        }

        console.log(`Created day pass record for ${userName} (${userEmail})`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
