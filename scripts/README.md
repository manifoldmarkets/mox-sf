# Scripts

Utility scripts for data management and maintenance.

## backfill-tiers.ts

Backfills the `Tier` field in Airtable from Stripe subscription data.

### What it does

1. Fetches all members from Airtable who have a `Stripe Customer ID`
2. For each member, retrieves their active subscription from Stripe
3. Gets the product name (tier) from the subscription
4. Updates the `Tier` field in Airtable if it's different

### Usage

```bash
bun run scripts/backfill-tiers.ts
```

### Requirements

Ensure the following environment variables are set in `.env.local`:

- `STRIPE_SECRET_KEY` - Stripe API secret key
- `AIRTABLE_API_KEY` - Airtable read API key
- `AIRTABLE_WRITE_KEY` - Airtable write API key
- `AIRTABLE_BASE_ID` - Airtable base ID

### Output

The script will show progress for each member:

```
Processing: John Doe (john@example.com)
  Current tier: (none)
  Stripe Customer ID: cus_xxxxx
  Stripe tier: Premium
  🔄 Updating tier from "(none)" to "Premium"
  ✅ Updated successfully
```

### Safety Features

- Only updates records where the tier has changed
- Skips members without active subscriptions
- Includes rate limiting (100ms between API calls)
- Provides a summary at the end with counts of updated/skipped/errored records

## backfill-work-fun-things.ts

Generates and backfills both "Work thing" and "Fun thing" fields for paying members using Claude Haiku AI.

### What it does

1. Fetches all paying members from Airtable who have an AI score
2. For each member, analyzes their outreach notes, AI evaluation, and other relevant data
3. Uses Claude Haiku to generate BOTH a work thing AND a fun thing (each 1-3 words)
4. Each thing is a single item, not a list (e.g., "Rock climbing", not "surfing, golf, tennis")
5. Optionally includes a relevant URL for each
6. Updates both the `Work thing` and `Fun thing` fields in Airtable (only if empty)

### Usage

```bash
bun run scripts/backfill-work-fun-things.ts
```

### Requirements

Ensure the following environment variables are set in `.env.local`:

- `ANTHROPIC_API_KEY` - Anthropic API key for Claude
- `AIRTABLE_API_KEY` - Airtable read API key
- `AIRTABLE_WRITE_KEY` - Airtable write API key
- `AIRTABLE_BASE_ID` - Airtable base ID

### Airtable Schema

The script expects the following fields in the People table:

- `Name` - Member name
- `Email` - Member email
- `Tier` - Membership tier
- `AI Score` - AI evaluation score (must be present to process)
- `Outreach Notes` - Notes from outreach (optional)
- `AI Evaluation` - AI evaluation text (optional)
- `Website` - Member website (optional)
- `Work thing` - Target field for work-related thing (will be created/updated)
- `Work thing URL` - URL for work thing (will be created/updated if provided)
- `Fun thing` - Target field for fun-related thing (will be created/updated)
- `Fun thing URL` - URL for fun thing (will be created/updated if provided)

### Output Format

Generated things are stored in separate fields:
- Text fields: `Work thing` = `"AI safety"`, `Fun thing` = `"Rock climbing"`
- URL fields (optional): `Work thing URL` = `"https://example.com/research"`, `Fun thing URL` = `"https://climbing.com"`

### Output

The script will show progress for each member:

```
Processing: Jane Smith (jane@example.com)
  Current Work thing: (none)
  Current Fun thing: (none)
  AI Score: 85
  Generated Work thing: "AI safety" (https://example.com/research)
  Generated Fun thing: "Rock climbing"
  ✅ Updated Work thing
  ✅ Updated Fun thing
```

### Safety Features

- Skips members who already have both Work thing and Fun thing populated
- Uses Claude Haiku (fast and cost-effective model)
- Validates generated text is 3 words or less
- Includes rate limiting (500ms between API calls)
- Provides a summary at the end with counts of updated/skipped/errored records

## check-paused-cancelled.ts

Checks Stripe subscription status for all joined members and updates Airtable Status field for problematic subscriptions.

### What it does

1. Fetches all members from Airtable with Status="Joined" and a Stripe Customer ID
2. For each member, checks their subscription status in Stripe
3. Identifies subscriptions that are:
   - Paused (temporarily suspended)
   - Cancelled (scheduled to end at period end)
   - Already ended (status: canceled)
   - Past due (payment failed)
   - Incomplete or missing
4. **Updates Airtable Status field**:
   - Sets Status to **"Paused"** for paused subscriptions
   - Sets Status to **"Payment Issue"** for cancelled or problematic subscriptions

### Usage

```bash
bun run scripts/check-paused-cancelled.ts
```

### Requirements

Ensure the following environment variables are set in `.env.local`:

- `STRIPE_SECRET_KEY` - Stripe API secret key
- `AIRTABLE_API_KEY` - Airtable read API key
- `AIRTABLE_WRITE_KEY` - Airtable write API key (required for updating Status)
- `AIRTABLE_BASE_ID` - Airtable base ID

### Output

The script provides three detailed sections:

**1. Paused Memberships**
```
John Doe (john@example.com)
  Tier: Premium
  Stripe Customer ID: cus_xxxxx
  Subscription ID: sub_xxxxx
  Paused Until: 01/15/2026
  Status: active
```

**2. Cancelled Memberships (scheduled to end)**
```
Jane Smith (jane@example.com)
  Tier: Basic
  Stripe Customer ID: cus_yyyyy
  Subscription ID: sub_yyyyy
  Cancels At: 02/01/2026
  Status: active
```

**3. Other Problems**
- No subscription found
- Already ended subscriptions
- Incomplete or past due payments

**4. Summary**
```
Total members checked: 150
Paused: 5
Cancelled (scheduled to end): 8
Other problems: 2
Active and healthy: 135

Airtable status updates:
  Updated successfully: 15
  Update errors: 0
```

### Features

- Automatically updates Airtable Status field for problem subscriptions
- Checks all subscription statuses comprehensively
- Includes rate limiting (100ms between API calls)
- Provides detailed reports grouped by issue type
- Safe error handling for failed updates
