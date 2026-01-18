'use client';

import { useState } from 'react';

interface DayPassPurchaseProps {
  stripeCustomerId: string | null;
  userName: string;
  userEmail: string;
}

export default function DayPassPurchase({ stripeCustomerId, userName, userEmail }: DayPassPurchaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchaseDayPass = async () => {
    if (!stripeCustomerId) {
      setError('No Stripe customer ID found. Please contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating day pass checkout for:', { stripeCustomerId, userName, userEmail });

      const response = await fetch('/portal/api/create-day-pass-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripeCustomerId,
          userName,
          userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        const errorMsg = data.details || data.error || 'Failed to create checkout session';
        console.error('Checkout error:', data);
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-3 sm:p-6 mb-4 sm:mb-6">
      <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">Day Pass</h2>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-background-subtle dark:bg-background-subtle-dark p-4 border border-border-light dark:border-border-light-dark">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-text-primary dark:text-text-primary-dark mb-1">Member Day Pass</h3>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                Single day access to Mox
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-brand dark:text-brand-dark-mode">$25</span>
              <button
                onClick={handlePurchaseDayPass}
                disabled={loading || !stripeCustomerId}
                className="px-6 py-2 bg-brand dark:bg-brand-dark-mode text-white text-sm font-medium hover:bg-brand-dark dark:hover:bg-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans whitespace-nowrap"
              >
                {loading ? 'Loading...' : 'Purchase'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted dark:text-text-muted-dark">
          After purchase, you'll receive an activation link to access your day pass and door code.
        </p>
      </div>
    </div>
  );
}
