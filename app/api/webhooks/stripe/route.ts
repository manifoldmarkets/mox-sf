import Stripe from 'stripe';
import { addMemberToForkable, FORKABLE_CLUBS, parseFullName } from '@/app/lib/forkable';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// Map Stripe product IDs to membership tiers
const MEMBERSHIP_PRODUCTS: Record<string, { tier: string; forkableClubIds: number[] }> = {
  'prod_RpkYg9EMJoi5oi': { tier: 'Member', forkableClubIds: [FORKABLE_CLUBS.MOX_MEMBERS] },
  'prod_RpkufjD9E3esG5': { tier: 'Resident', forkableClubIds: [FORKABLE_CLUBS.MOX_RESIDENTS] },
  'prod_Rq9VzfM9QoJwPD': { tier: 'Friend', forkableClubIds: [] }, // No Forkable access
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] No signature provided');
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleNewSubscription(event.data.object as Stripe.Subscription);
        break;

      // Optionally handle subscription updates/cancellations
      // case 'customer.subscription.deleted':
      //   await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
      //   break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    // Return 200 to prevent Stripe from retrying - we'll log the error
    return Response.json({ received: true, error: 'Processing failed' });
  }

  return Response.json({ received: true });
}

async function handleNewSubscription(subscription: Stripe.Subscription) {
  // Get the product ID from the subscription
  const item = subscription.items.data[0];
  if (!item) {
    console.log('[Stripe Webhook] No subscription items found');
    return;
  }

  const priceId = typeof item.price === 'string' ? item.price : item.price.id;
  const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
  const product = price.product as Stripe.Product;

  const membershipConfig = MEMBERSHIP_PRODUCTS[product.id];
  if (!membershipConfig) {
    console.log('[Stripe Webhook] Not a membership product:', product.id, product.name);
    return;
  }

  // Get customer details
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const customerResponse = await stripe.customers.retrieve(customerId);

  if (customerResponse.deleted) {
    console.error('[Stripe Webhook] Customer has been deleted');
    return;
  }

  const customer = customerResponse as Stripe.Customer;
  const customerEmail = customer.email;
  const customerName = customer.name || '';

  if (!customerEmail) {
    console.error('[Stripe Webhook] No customer email found');
    return;
  }

  console.log(`[Stripe Webhook] Processing new ${membershipConfig.tier} subscription for ${customerEmail}`);

  // Skip Forkable if no club IDs configured for this tier
  if (membershipConfig.forkableClubIds.length === 0) {
    console.log(`[Stripe Webhook] No Forkable clubs configured for ${membershipConfig.tier}, skipping`);
    return;
  }

  // Parse name into first/last
  const { firstName, lastName } = parseFullName(customerName);

  // Add member to Forkable
  const result = await addMemberToForkable({
    email: customerEmail,
    firstName: firstName || customerEmail.split('@')[0], // Fallback to email prefix
    lastName,
    clubIds: membershipConfig.forkableClubIds as any,
  });

  if (!result.success) {
    console.error(`[Stripe Webhook] Failed to add ${customerEmail} to Forkable:`, result.errors);
  } else {
    console.log(`[Stripe Webhook] Successfully added ${customerEmail} to Forkable`);
  }
}
