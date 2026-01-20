import Stripe from 'stripe';
import { Resend } from 'resend';
import { getDayPassActivationEmail } from '@/app/lib/emails/day-pass-activation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const resend = new Resend(process.env.RESEND_API_KEY);

// Map Stripe product IDs to pass types
const DAY_PASS_PRODUCTS: Record<string, { type: string; description: string; durationDays: number }> = {
  'prod_T5NXc8MwPn1ZIl': { type: 'Day Pass', description: 'Full day access (9 AM - 11 PM)', durationDays: 1 },
  'prod_T5NXlD25uP8tnI': { type: 'Happy Hour Pass', description: 'Evening access (after 4 PM)', durationDays: 1 },
  'prod_SqejoSJqKlR4A5': { type: 'Week Pass', description: 'Full week of access', durationDays: 7 },
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

  // Handle checkout.session.completed for day pass purchases
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleDayPassPurchase(session);
    } catch (error) {
      console.error('[Stripe Webhook] Error handling day pass purchase:', error);
      // Return 200 to prevent Stripe from retrying - we'll log the error
      return Response.json({ received: true, error: 'Processing failed' });
    }
  }

  return Response.json({ received: true });
}

async function handleDayPassPurchase(session: Stripe.Checkout.Session) {
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
  const paymentId = session.payment_intent as string;

  if (!customerEmail) {
    console.error('[Stripe Webhook] No customer email found');
    return;
  }

  console.log(`[Stripe Webhook] Processing ${passInfo.type} purchase for ${customerEmail}`);

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

  console.log(`[Stripe Webhook] Successfully processed ${passInfo.type} for ${customerEmail}`);
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
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Day%20Passes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Name: paymentId,
            Username: customerName,
            Email: customerEmail,
            'Pass Type': passType,
            Status: 'Unused',
            'Date Purchased': new Date().toISOString().split('T')[0],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Stripe Webhook] Airtable error:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('[Stripe Webhook] Created Airtable record:', data.id);
    return data;
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://moxsf.com';
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
