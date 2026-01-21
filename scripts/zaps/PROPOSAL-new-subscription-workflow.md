# Proposal: Replace Zapier "New Subscription" Workflow with Code

## Current Zapier Workflow

**Zap ID:** 283145125
**Name:** On new Mox subscription, ping Discord & update Airtable

### Steps:
1. **Trigger:** Stripe - New Subscription
2. **Discord:** Send message to #bots channel
3. **Email:** Send welcome email to customer
4. **Zapier Tables:** Look up tier name from pricing sheet
5. **Airtable:** Find or create person record
6. **Airtable:** Update record with status/tier/Stripe ID

## Existing Code

The project already has:
- ✅ Stripe webhook at `app/api/webhooks/stripe/route.ts` handling `customer.subscription.created`
- ✅ Discord helpers at `app/lib/discord.ts` with `sendChannelMessage()`
- ✅ Airtable helpers at `app/lib/airtable-helpers.ts`
- ✅ Tier mapping in `MEMBERSHIP_PRODUCTS`

## Proposed Changes

### 1. Add Discord notification to webhook

Update `app/api/webhooks/stripe/route.ts`:

```typescript
import { sendChannelMessage } from '@/app/lib/discord';

const DISCORD_BOTS_CHANNEL_ID = '1339404215700947000';

// In handleNewSubscription(), after processing:
await sendChannelMessage(
  DISCORD_BOTS_CHANNEL_ID,
  `${customerName} just started their Mox membership 🎉`
);
```

### 2. Add welcome email

Option A: Use Resend/Postmark (recommended)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Rachel Shu <rachel@moxsf.com>',
  to: customerEmail,
  subject: 'Thanks for joining Mox!',
  text: `Hey ${customerName},

Thanks for joining Mox, excited to have you! Jump in our Discord for access instructions for your first day: https://moxsf.com/discord

If you'd like to cancel your membership or change tiers, you can do so here: https://moxsf.com/portal

And check out more onboarding info here: https://moxsf.notion.site/new-member-onboarding
`
});
```

Option B: Use existing email provider

### 3. Update Airtable record

Add Airtable API integration:

```typescript
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base('appkHZ2UvU6SouT5y');

// Find or create person
const records = await base('People').select({
  filterByFormula: `{Email} = '${escapeAirtableString(customerEmail)}'`,
  maxRecords: 1,
}).firstPage();

if (records.length > 0) {
  // Update existing
  await base('People').update(records[0].id, {
    'Status': 'Joined',
    'Tier': tier,
    'Stripe Customer ID': customerId,
  });
} else {
  // Create new
  await base('People').create({
    'Name': customerName,
    'Email': customerEmail,
    'Status': 'Joined',
    'Tier': tier,
    'Date Joined': new Date().toISOString().split('T')[0],
    'Stripe Customer ID': customerId,
  });
}
```

### 4. Tier lookup

Replace Zapier Tables lookup with a simple mapping:

```typescript
const PRICE_TO_TIER: Record<number, string> = {
  12900: 'Member',    // $129/month
  42900: 'Resident',  // $429/month
  2900: 'Friend',     // $29/month
};

const tier = PRICE_TO_TIER[price.unit_amount || 0] || 'Unknown';
```

## Environment Variables Needed

```bash
DISCORD_BOTS_CHANNEL_ID=1339404215700947000
RESEND_API_KEY=re_xxx  # or other email provider
AIRTABLE_API_KEY=patxxx
```

## Benefits of Code vs Zapier

| Aspect | Zapier | Code |
|--------|--------|------|
| Cost | $29+/month | Free |
| Latency | ~5-10s | ~1-2s |
| Debugging | Hard | Easy (logs) |
| Version control | None | Git |
| Customization | Limited | Full |
| Error handling | Basic | Custom |
| Rate limits | Zapier's | Your own |

## Implementation Steps

1. [ ] Add `resend` package: `bun add resend`
2. [ ] Add `airtable` package: `bun add airtable`
3. [ ] Add env vars to `.env.local` and Vercel
4. [ ] Update webhook handler with all steps
5. [ ] Test with Stripe test mode
6. [ ] Monitor logs for a week
7. [ ] Disable Zapier workflow

## Risk Mitigation

- Keep Zapier workflow enabled during testing (disable Discord step to avoid duplicates)
- Add comprehensive logging
- Use try/catch with graceful degradation (don't fail webhook if Discord is down)
- Consider adding retry logic for Airtable
