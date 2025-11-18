'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionInfoProps {
  stripeCustomerId: string | null;
}

interface SubscriptionData {
  tier: string;
  rate: string;
  renewalDate: string;
  status: string;
}

export default function SubscriptionInfo({ stripeCustomerId }: SubscriptionInfoProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    async function fetchSubscription() {
      if (!stripeCustomerId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/portal/api/subscription?customerId=${stripeCustomerId}`);
        const data = await response.json();

        if (response.ok && data.subscription) {
          setSubscription(data.subscription);
        } else {
          setError(data.message || 'No active subscription');
        }
      } catch (err) {
        setError('Failed to load subscription');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [stripeCustomerId]);

  const handleManageBilling = async () => {
    if (!stripeCustomerId) return;

    setBillingLoading(true);
    try {
      const response = await fetch('/portal/api/create-billing-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeCustomerId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe billing portal
        window.location.href = data.url;
      } else {
        alert('Failed to open billing portal. Please try again.');
        setBillingLoading(false);
      }
    } catch (err) {
      alert('Failed to open billing portal. Please try again.');
      setBillingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-400 mb-4 font-playfair">Subscription</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading subscription details...</p>
      </div>
    );
  }

  if (!stripeCustomerId || error) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-400 mb-4 font-playfair">Subscription</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">No active subscription found</p>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const renewalDate = new Date(subscription.renewalDate);
  const formattedDate = renewalDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-6 mb-4 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-400 font-playfair">Subscription</h2>
        <button
          onClick={handleManageBilling}
          disabled={billingLoading}
          className="px-4 py-2 bg-amber-800 dark:bg-amber-700 text-white text-sm font-medium hover:bg-amber-900 dark:hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto font-sans"
        >
          {billingLoading ? 'Loading...' : (
            <>
              Manage
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 font-sans">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Plan</p>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{subscription.tier}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Rate</p>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{subscription.rate}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Renewal Date</p>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
