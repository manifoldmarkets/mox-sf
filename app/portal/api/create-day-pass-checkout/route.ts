import { getSession } from '@/app/lib/session';
import { stripe } from '@/app/lib/stripe';
import { env } from '@/app/lib/env';
import { getRecord, Tables } from '@/app/lib/airtable';
import { canIssueGuestDayPass } from '@/app/lib/membership';
import { getPassType } from '@/app/lib/day-pass-pricing';

interface PurchaserPersonFields {
  Status?: string;
  Tier?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const effectiveUserId = session.viewingAsUserId || session.userId;
    const record = await getRecord<PurchaserPersonFields>(
      Tables.People,
      effectiveUserId
    );
    const purchaserMembership = {
      status: record?.fields.Status ?? null,
      tier: record?.fields.Tier ?? null,
    };
    if (!canIssueGuestDayPass(purchaserMembership)) {
      return Response.json(
        { error: 'Guest day passes are only available to active members.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      stripeCustomerId,
      purchaserName,
      purchaserEmail,
      guestName,
      guestEmail,
      passTypeId,
    } = body;

    if (!purchaserName || !purchaserEmail || !guestName || !guestEmail || !passTypeId) {
      return Response.json(
        { error: 'Missing required information' },
        { status: 400 }
      );
    }

    const passType = getPassType(passTypeId);
    if (
      !passType ||
      passType.memberPriceCents === null ||
      passType.stripeMemberPriceId === null
    ) {
      return Response.json(
        { error: 'This pass type is not available for members' },
        { status: 400 }
      );
    }

    const requestUrl = new URL(request.url);
    const baseUrl =
      env.NEXT_PUBLIC_BASE_URL ||
      `${requestUrl.protocol}//${requestUrl.host}`;

    // Charge goes to the purchaser's Stripe customer (existing or created
    // on the fly via email). Guest details ride in metadata so the webhook
    // can create the DayPass under the guest's identity.
    const customerFields = stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: purchaserEmail };

    // Reference the member Price by id so product-scoped coupons can attach.
    const checkoutSession = await stripe.checkout.sessions.create({
      ...customerFields,
      mode: 'payment',
      allow_promotion_codes: true,
      line_items: [{ price: passType.stripeMemberPriceId, quantity: 1 }],
      success_url: `${baseUrl}/portal?day_pass_purchased=1`,
      cancel_url: `${baseUrl}/portal`,
      metadata: {
        type: 'member_day_pass',
        passTypeId: passType.id,
        passTypeLabel: passType.label,
        guestName,
        guestEmail,
        purchaserUserId: effectiveUserId,
        purchaserEmail,
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating day pass checkout session:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    );
  }
}
