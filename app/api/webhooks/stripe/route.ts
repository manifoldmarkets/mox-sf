import type Stripe from 'stripe';
import { stripe } from '@/app/lib/stripe';
import { Resend } from 'resend';
import { getDayPassActivationEmail } from '@/app/lib/emails/day-pass-activation';
import {
  Tables,
  createRecord,
  findRecord,
  escapeAirtableString,
} from '@/app/lib/airtable';
import { sendChannelMessage, DISCORD_CHANNELS } from '@/app/lib/discord';
import { env } from '@/app/lib/env';
import {
  addMemberToForkable,
  FORKABLE_CLUBS,
  parseFullName,
} from '@/app/lib/forkable';

const resend = new Resend(env.RESEND_API_KEY);

// Map Stripe product IDs to pass types
const DAY_PASS_PRODUCTS: Record<
  string,
  { type: string; description: string; durationDays: number }
> = {
  prod_T5NXc8MwPn1ZIl: {
    type: 'Day Pass',
    description: 'Full day access (9 AM - 11 PM)',
    durationDays: 1,
  },
  prod_T5NXlD25uP8tnI: {
    type: 'Happy Hour Pass',
    description: 'Evening access (after 4 PM)',
    durationDays: 1,
  },
  prod_SqejoSJqKlR4A5: {
    type: 'Week Pass',
    description: 'Full week of access',
    durationDays: 7,
  },
};

// Map Stripe product IDs to membership tiers
const MEMBERSHIP_PRODUCTS: Record<
  string,
  { tier: string; forkableClubIds: number[] }
> = {
  prod_RpkYg9EMJoi5oi: {
    tier: 'Member',
    forkableClubIds: [FORKABLE_CLUBS.MOX_MEMBERS],
  },
  prod_RpkufjD9E3esG5: {
    tier: 'Resident',
    forkableClubIds: [FORKABLE_CLUBS.MOX_RESIDENTS],
  },
  prod_Rq9VzfM9QoJwPD: { tier: 'Friend', forkableClubIds: [] }, // No Forkable access
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
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleDayPassPurchase(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.created':
        await handleNewSubscription(event.data.object as Stripe.Subscription);
        break;

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

// ============================================================================
// Day Pass Handlers
// ============================================================================

async function handleDayPassPurchase(session: Stripe.Checkout.Session) {
  // Check if this is a member day pass purchase (from portal)
  if (session.metadata?.type === 'member_day_pass') {
    await handleMemberDayPass(session);
    return;
  }

  // Handle guest day pass purchases
  await handleGuestDayPass(session);
}

async function handleMemberDayPass(session: Stripe.Checkout.Session) {
  const userName = session.metadata?.userName;
  const userEmail = session.metadata?.userEmail;

  if (!userName || !userEmail) {
    console.error('[Stripe Webhook] Missing member metadata');
    return;
  }

  console.log(
    `[Stripe Webhook] Processing member day pass for ${userName} (${userEmail})`
  );

  try {
    await createRecord(Tables.DayPasses, {
      Name: session.id,
      Username: userName,
      Status: 'Unused',
      'Stripe link (from User)': `Member day pass - $25 - ${userEmail}`,
    });

    console.log(`[Stripe Webhook] Created member day pass for ${userName}`);
  } catch (error) {
    console.error('[Stripe Webhook] Failed to create member day pass:', error);
    throw error;
  }
}

async function handleGuestDayPass(session: Stripe.Checkout.Session) {
  // Get line items to check product ID
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ['data.price.product'],
  });

  if (!lineItems.data.length) {
    console.log('[Stripe Webhook] No line items found');
    return;
  }

  const lineItem = lineItems.data[0];
  const product = lineItem.price?.product as Stripe.Product;

  if (!product || !DAY_PASS_PRODUCTS[product.id]) {
    console.log('[Stripe Webhook] Not a day pass product:', product?.id);
    return;
  }

  const passInfo = DAY_PASS_PRODUCTS[product.id];
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name || 'Guest';
  const paymentId = session.id;

  if (!customerEmail) {
    console.error('[Stripe Webhook] No customer email found');
    return;
  }

  console.log(
    `[Stripe Webhook] Processing ${passInfo.type} purchase for ${customerEmail}`
  );

  // Create Airtable record
  const airtableRecord = await createAirtableRecord({
    paymentId,
    customerName,
    customerEmail,
    passType: passInfo.type,
  });

  if (!airtableRecord) {
    console.error('[Stripe Webhook] Failed to create Airtable record');
    return;
  }

  // Send activation email
  await sendActivationEmail({
    customerEmail,
    customerName,
    passType: passInfo.type,
    passDescription: passInfo.description,
    paymentId,
  });

  console.log(
    `[Stripe Webhook] Successfully processed ${passInfo.type} for ${customerEmail}`
  );
}

// Find or create a person in the People table by email
async function findOrCreatePerson({
  customerName,
  customerEmail,
}: {
  customerName: string;
  customerEmail: string;
}): Promise<string | null> {
  try {
    // Search for existing person by email
    const existingPerson = await findRecord(
      Tables.People,
      `{Email}="${escapeAirtableString(customerEmail)}"`
    );

    if (existingPerson) {
      console.log('[Stripe Webhook] Found existing person:', existingPerson.id);
      return existingPerson.id;
    }

    // Create new person
    const newPerson = await createRecord(Tables.People, {
      Name: customerName,
      Email: customerEmail,
    });

    console.log('[Stripe Webhook] Created new person:', newPerson.id);
    return newPerson.id;
  } catch (error) {
    console.error('[Stripe Webhook] Error in findOrCreatePerson:', error);
    return null;
  }
}

async function createAirtableRecord({
  paymentId,
  customerName,
  customerEmail,
  passType,
}: {
  paymentId: string;
  customerName: string;
  customerEmail: string;
  passType: string;
}) {
  try {
    // Find or create the person first
    const personId = await findOrCreatePerson({ customerName, customerEmail });

    const fields: Record<string, unknown> = {
      Name: paymentId,
      'Pass Type': passType,
      Status: 'Unused',
    };

    // Link to person if we have their ID
    if (personId) {
      fields['User'] = [personId];
    }

    const record = await createRecord(Tables.DayPasses, fields);
    console.log('[Stripe Webhook] Created Airtable record:', record.id);
    return record;
  } catch (error) {
    console.error('[Stripe Webhook] Error creating Airtable record:', error);
    return null;
  }
}

async function sendActivationEmail({
  customerEmail,
  customerName,
  passType,
  passDescription,
  paymentId,
}: {
  customerEmail: string;
  customerName: string;
  passType: string;
  passDescription: string;
  paymentId: string;
}) {
  const baseUrl = env.NEXT_PUBLIC_BASE_URL;
  const activationLink = `${baseUrl}/day-pass/activate?id=${paymentId}`;

  const { subject, text } = getDayPassActivationEmail({
    customerName,
    passType,
    passDescription,
    activationLink,
  });

  try {
    const result = await resend.emails.send({
      from: 'Mox SF <noreply@account.moxsf.com>',
      to: customerEmail,
      subject,
      text,
    });

    console.log('[Stripe Webhook] Sent activation email:', result);
    return result;
  } catch (error) {
    console.error('[Stripe Webhook] Error sending email:', error);
    return null;
  }
}

// ============================================================================
// Subscription / Forkable Handlers
// ============================================================================

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
    console.log(
      '[Stripe Webhook] Not a membership product:',
      product.id,
      product.name
    );
    return;
  }

  // Get customer details
  const customerId =
    typeof subscription.customer === 'string'
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

  console.log(
    `[Stripe Webhook] Processing new ${membershipConfig.tier} subscription for ${customerEmail}`
  );

  // Skip Forkable if no club IDs configured for this tier
  if (membershipConfig.forkableClubIds.length === 0) {
    console.log(
      `[Stripe Webhook] No Forkable clubs configured for ${membershipConfig.tier}, skipping`
    );
    return;
  }

  // Parse name into first/last
  const { firstName, lastName } = parseFullName(customerName);

  // Add member to Forkable
  const result = await addMemberToForkable({
    email: customerEmail,
    firstName: firstName || customerEmail.split('@')[0], // Fallback to email prefix
    lastName,
    clubIds: membershipConfig.forkableClubIds as typeof FORKABLE_CLUBS[keyof typeof FORKABLE_CLUBS][],
  });

  if (!result.success) {
    console.error(
      `[Stripe Webhook] Failed to add ${customerEmail} to Forkable:`,
      result.errors
    );
    // Send failure notification
    await sendForkableNotification({
      customerEmail,
      customerName,
      tier: membershipConfig.tier,
      success: false,
      errors: result.errors,
    });
  } else {
    console.log(
      `[Stripe Webhook] Successfully added ${customerEmail} to Forkable`
    );
    // Send success notification
    await sendForkableNotification({
      customerEmail,
      customerName,
      tier: membershipConfig.tier,
      success: true,
    });
  }
}

async function sendForkableNotification({
  customerEmail,
  customerName,
  tier,
  success,
  errors,
}: {
  customerEmail: string;
  customerName: string;
  tier: string;
  success: boolean;
  errors?: string[];
}) {
  const channelId = DISCORD_CHANNELS.NOTIFICATIONS;
  if (!channelId) {
    console.log('[Stripe Webhook] No Discord notifications channel configured, skipping notification');
    return;
  }

  const name = customerName || customerEmail;
  const message = success
    ? `✅ **Forkable:** ${name} (${customerEmail}) added to Mox ${tier}s`
    : `❌ **Forkable:** Failed to add ${name} (${customerEmail}) to Mox ${tier}s. ` +
      `Please add them manually at https://forkable.com\n\n` +
      `**Errors:**\n${errors?.join('\n') || 'Unknown error'}`;

  const sent = await sendChannelMessage(channelId, message);
  if (sent) {
    console.log('[Stripe Webhook] Sent Forkable Discord notification');
  } else {
    console.error('[Stripe Webhook] Failed to send Forkable Discord notification');
  }
}
