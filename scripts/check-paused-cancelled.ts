/**
 * Check for Paused and Cancelled Memberships in Stripe
 *
 * This script fetches all members from Airtable who you think are currently paying
 * (Status = "Joined" and have a Stripe Customer ID), then checks their subscription
 * status in Stripe to identify any paused or cancelled subscriptions.
 *
 * For paused subscriptions, it updates Status to "Paused".
 * For cancelled or problem subscriptions, it updates Status to "Payment Issue".
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Email?: string;
    Status?: string;
    Tier?: string;
    'Stripe Customer ID'?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface MemberSubscriptionStatus {
  airtableRecordId: string;
  name: string;
  email: string;
  tier: string | undefined;
  stripeCustomerId: string;
  subscriptionStatus: string | null;
  isPaused: boolean;
  pausedUntil: Date | null;
  isCancelled: boolean;
  cancelAt: Date | null;
  currentPeriodEnd: Date | null;
  subscriptionId: string | null;
}

async function fetchJoinedMembersWithStripe(): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  console.log('Fetching joined members with Stripe Customer IDs from Airtable...');

  do {
    const url = new URL(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People`);

    // Filter for members who have joined and have a Stripe Customer ID
    url.searchParams.set(
      'filterByFormula',
      'AND({Status} = "Joined", {Stripe Customer ID} != "")'
    );

    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data: AirtableResponse = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;

    console.log(`Fetched ${data.records.length} records (total: ${allRecords.length})`);
  } while (offset);

  return allRecords;
}

async function checkStripeSubscription(
  stripeCustomerId: string
): Promise<{
  status: string | null;
  isPaused: boolean;
  pausedUntil: Date | null;
  isCancelled: boolean;
  cancelAt: Date | null;
  currentPeriodEnd: Date | null;
  subscriptionId: string | null;
}> {
  try {
    // Fetch all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return {
        status: null,
        isPaused: false,
        pausedUntil: null,
        isCancelled: false,
        cancelAt: null,
        currentPeriodEnd: null,
        subscriptionId: null,
      };
    }

    // Find the most relevant subscription (active, trialing, past_due, or paused)
    const subscription = subscriptions.data.find(s =>
      ['active', 'trialing', 'past_due', 'paused'].includes(s.status)
    ) || subscriptions.data[0]; // Fall back to the first subscription if none are active/paused

    const isPaused = !!subscription.pause_collection;
    const pausedUntil = subscription.pause_collection?.resumes_at
      ? new Date(subscription.pause_collection.resumes_at * 1000)
      : null;

    const isCancelled = subscription.status === 'canceled' || !!subscription.cancel_at;
    const cancelAt = subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null;
    const currentPeriodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : null;

    return {
      status: subscription.status,
      isPaused,
      pausedUntil,
      isCancelled,
      cancelAt,
      currentPeriodEnd,
      subscriptionId: subscription.id,
    };
  } catch (error: any) {
    if (error.code === 'resource_missing') {
      console.error(`  ⚠️  Stripe customer not found: ${stripeCustomerId}`);
      return {
        status: 'not_found',
        isPaused: false,
        pausedUntil: null,
        isCancelled: false,
        cancelAt: null,
        currentPeriodEnd: null,
        subscriptionId: null,
      };
    }
    throw error;
  }
}

async function updateAirtableStatus(
  recordId: string,
  newStatus: 'Paused' | 'Payment Issue'
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            Status: newStatus,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable update error: ${response.statusText} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error(`  ❌ Error updating record ${recordId}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting subscription status check...\n');

  // Validate environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not set');
  }
  if (!process.env.AIRTABLE_WRITE_KEY) {
    throw new Error('AIRTABLE_WRITE_KEY is not set');
  }
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is not set');
  }

  // Fetch all joined members with Stripe Customer IDs
  const members = await fetchJoinedMembersWithStripe();

  console.log(`\nFound ${members.length} joined members with Stripe Customer IDs\n`);

  const results: MemberSubscriptionStatus[] = [];
  const pausedMembers: MemberSubscriptionStatus[] = [];
  const cancelledMembers: MemberSubscriptionStatus[] = [];
  const problemMembers: MemberSubscriptionStatus[] = [];

  let statusUpdated = 0;
  let statusUpdateErrors = 0;

  // Process each member
  for (const member of members) {
    const name = member.fields.Name || 'Unknown';
    const email = member.fields.Email || 'Unknown';
    const tier = member.fields.Tier;
    const stripeCustomerId = member.fields['Stripe Customer ID']!;

    console.log(`Checking: ${name} (${email})`);
    console.log(`  Stripe Customer ID: ${stripeCustomerId}`);

    try {
      const subscriptionInfo = await checkStripeSubscription(stripeCustomerId);

      const memberStatus: MemberSubscriptionStatus = {
        airtableRecordId: member.id,
        name,
        email,
        tier,
        stripeCustomerId,
        subscriptionStatus: subscriptionInfo.status,
        isPaused: subscriptionInfo.isPaused,
        pausedUntil: subscriptionInfo.pausedUntil,
        isCancelled: subscriptionInfo.isCancelled,
        cancelAt: subscriptionInfo.cancelAt,
        currentPeriodEnd: subscriptionInfo.currentPeriodEnd,
        subscriptionId: subscriptionInfo.subscriptionId,
      };

      results.push(memberStatus);

      // Determine what action to take
      let needsStatusUpdate = false;
      let newStatus: 'Paused' | 'Payment Issue' | null = null;

      // Check for issues
      if (subscriptionInfo.isPaused) {
        console.log(`  ⚠️  PAUSED until ${subscriptionInfo.pausedUntil?.toLocaleDateString()}`);
        pausedMembers.push(memberStatus);
        needsStatusUpdate = true;
        newStatus = 'Paused';
      }

      if (subscriptionInfo.isCancelled) {
        console.log(`  ❌ CANCELLED (ends ${subscriptionInfo.cancelAt?.toLocaleDateString() || subscriptionInfo.currentPeriodEnd?.toLocaleDateString()})`);
        cancelledMembers.push(memberStatus);
        needsStatusUpdate = true;
        newStatus = 'Payment Issue';
      }

      if (subscriptionInfo.status === 'canceled') {
        console.log(`  ❌ ALREADY ENDED (status: canceled)`);
        problemMembers.push(memberStatus);
        needsStatusUpdate = true;
        newStatus = 'Payment Issue';
      }

      if (subscriptionInfo.status === 'incomplete' || subscriptionInfo.status === 'incomplete_expired') {
        console.log(`  ⚠️  INCOMPLETE subscription (status: ${subscriptionInfo.status})`);
        problemMembers.push(memberStatus);
        needsStatusUpdate = true;
        newStatus = 'Payment Issue';
      }

      if (subscriptionInfo.status === 'past_due') {
        console.log(`  ⚠️  PAST DUE (payment failed)`);
        problemMembers.push(memberStatus);
        needsStatusUpdate = true;
        newStatus = 'Payment Issue';
      }

      if (subscriptionInfo.status === null || subscriptionInfo.status === 'not_found') {
        console.log(`  ❌ NO SUBSCRIPTION FOUND`);
        problemMembers.push(memberStatus);
        needsStatusUpdate = true;
        newStatus = 'Payment Issue';
      }

      if (!subscriptionInfo.isPaused && !subscriptionInfo.isCancelled && subscriptionInfo.status === 'active') {
        console.log(`  ✅ Active subscription`);
      }

      // Update Airtable status if needed
      if (needsStatusUpdate && newStatus) {
        console.log(`  🔄 Updating Airtable status to "${newStatus}"...`);
        const updateSuccess = await updateAirtableStatus(member.id, newStatus);
        if (updateSuccess) {
          console.log(`  ✅ Status updated to "${newStatus}"`);
          statusUpdated++;
        } else {
          statusUpdateErrors++;
        }
      }

      // Rate limiting: wait 100ms between API calls
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`  ❌ Error checking subscription: ${error}`);
    }
  }

  // Print detailed summaries
  console.log('\n' + '='.repeat(80));
  console.log('PAUSED MEMBERSHIPS');
  console.log('='.repeat(80));
  if (pausedMembers.length === 0) {
    console.log('No paused memberships found.');
  } else {
    pausedMembers.forEach(member => {
      console.log(`\n${member.name} (${member.email})`);
      console.log(`  Tier: ${member.tier || 'Unknown'}`);
      console.log(`  Stripe Customer ID: ${member.stripeCustomerId}`);
      console.log(`  Subscription ID: ${member.subscriptionId}`);
      console.log(`  Paused Until: ${member.pausedUntil?.toLocaleDateString()}`);
      console.log(`  Status: ${member.subscriptionStatus}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('CANCELLED MEMBERSHIPS (scheduled to end)');
  console.log('='.repeat(80));
  if (cancelledMembers.length === 0) {
    console.log('No cancelled memberships found.');
  } else {
    cancelledMembers.forEach(member => {
      console.log(`\n${member.name} (${member.email})`);
      console.log(`  Tier: ${member.tier || 'Unknown'}`);
      console.log(`  Stripe Customer ID: ${member.stripeCustomerId}`);
      console.log(`  Subscription ID: ${member.subscriptionId}`);
      console.log(`  Cancels At: ${member.cancelAt?.toLocaleDateString() || member.currentPeriodEnd?.toLocaleDateString()}`);
      console.log(`  Status: ${member.subscriptionStatus}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('OTHER PROBLEMS (no subscription, past due, incomplete, already ended)');
  console.log('='.repeat(80));
  if (problemMembers.length === 0) {
    console.log('No problem memberships found.');
  } else {
    // Deduplicate problem members (they might also be in cancelled/paused lists)
    const uniqueProblemMembers = problemMembers.filter(
      member => !pausedMembers.includes(member) && !cancelledMembers.includes(member)
    );

    if (uniqueProblemMembers.length === 0) {
      console.log('No additional problem memberships found.');
    } else {
      uniqueProblemMembers.forEach(member => {
        console.log(`\n${member.name} (${member.email})`);
        console.log(`  Tier: ${member.tier || 'Unknown'}`);
        console.log(`  Stripe Customer ID: ${member.stripeCustomerId}`);
        console.log(`  Subscription ID: ${member.subscriptionId || 'None'}`);
        console.log(`  Status: ${member.subscriptionStatus || 'No subscription found'}`);
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total members checked: ${members.length}`);
  console.log(`Paused: ${pausedMembers.length}`);
  console.log(`Cancelled (scheduled to end): ${cancelledMembers.length}`);
  console.log(`Other problems: ${problemMembers.filter(m => !pausedMembers.includes(m) && !cancelledMembers.includes(m)).length}`);
  console.log(`Active and healthy: ${members.length - pausedMembers.length - cancelledMembers.length - problemMembers.filter(m => !pausedMembers.includes(m) && !cancelledMembers.includes(m)).length}`);
  console.log('');
  console.log(`Airtable status updates:`);
  console.log(`  Updated successfully: ${statusUpdated}`);
  console.log(`  Update errors: ${statusUpdateErrors}`);
  console.log('='.repeat(80));
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
