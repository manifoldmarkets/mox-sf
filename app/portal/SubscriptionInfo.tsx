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
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
        <p className="text-sm text-gray-500">Loading subscription details...</p>
      </div>
    );
  }

  if (!stripeCustomerId || error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
        <p className="text-sm text-gray-500">No active subscription found</p>
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
        <button
          onClick={handleManageBilling}
          disabled={billingLoading}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {billingLoading ? 'Loading...' : 'Manage billing on Stripe'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm text-blue-600 font-medium mb-1">Plan</p>
          <p className="text-base font-semibold text-gray-900">{subscription.tier}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-sm text-green-600 font-medium mb-1">Rate</p>
          <p className="text-base font-semibold text-gray-900">{subscription.rate}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <p className="text-sm text-amber-600 font-medium mb-1">Renewal Date</p>
          <p className="text-base font-semibold text-gray-900">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
