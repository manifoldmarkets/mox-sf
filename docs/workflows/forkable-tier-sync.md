# Forkable Tier Sync (Airtable Automation)

This documents how to sync Private Office and Program members to Forkable via Airtable automation.

## Overview

Members with specific Airtable tiers are automatically added to Forkable meal clubs:

| Airtable Tier | Forkable Club |
|---------------|---------------|
| Private Office | MOX_RESIDENTS (7097) |
| Program | MOX_MEMBERS (6314) |

This is separate from the Stripe flow (which handles Member/Resident tiers via subscription purchase).

## Airtable Automation Setup

### 1. Create New Automation

In Airtable, go to **Automations** → **Create automation**

### 2. Configure Trigger

**Trigger type:** When a record matches conditions

**Table:** People

**Conditions:**
- `Tier` is one of: "Private Office", "Program"
- `Status` is "Joined"
- `In Forkable` is unchecked (empty)

### 3. Add Action

**Action type:** Run a script

```javascript
// Airtable automation script
const config = input.config();
const recordId = config.recordId;
const apiUrl = 'https://moxsf.com/api/forkable-sync';
const secret = 'YOUR_FORKABLE_SYNC_SECRET'; // Set in env

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    recordId: recordId,
    secret: secret,
  }),
});

const result = await response.json();
console.log('Forkable sync result:', result);

if (!result.success && !result.skipped) {
  throw new Error(`Forkable sync failed: ${JSON.stringify(result.errors)}`);
}
```

**Input variables:**
- `recordId`: Record ID (from trigger)

### 4. Environment Setup

Add to your `.env`:
```
FORKABLE_SYNC_SECRET=your-secret-here
```

Generate a secure secret:
```bash
openssl rand -hex 32
```

## What the API Does

1. Fetches the person record from Airtable
2. Validates they're eligible (Status = "Joined", not already in Forkable)
3. Maps their Tier to the appropriate Forkable club
4. Calls Forkable API to add them to the meal club
5. Updates the "In Forkable" checkbox in Airtable
6. Sends notification email to team@moxsf.com

## Manual Testing

```bash
curl -X POST https://moxsf.com/api/forkable-sync \
  -H "Content-Type: application/json" \
  -d '{"recordId": "recXXXXXXXXXXXXXX", "secret": "your-secret"}'
```

## Key Files

- API endpoint: [app/api/forkable-sync/route.ts](../../app/api/forkable-sync/route.ts)
- Forkable client: [app/lib/forkable.ts](../../app/lib/forkable.ts)
- Environment config: [app/lib/env.ts](../../app/lib/env.ts)
