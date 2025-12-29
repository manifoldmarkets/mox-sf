'use client';

import { useState, useEffect } from 'react';

export default function VerkadaPin() {
  const [pin, setPin] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPin() {
      try {
        const response = await fetch('/portal/api/verkada-pin');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch PIN');
          setLoading(false);
          return;
        }

        setPin(data.pin);
        setHasAccess(data.hasAccess);
        setLoading(false);
      } catch (err) {
        console.error('[VerkadaPin] Exception:', err);
        setError('Failed to load door access information');
        setLoading(false);
      }
    }

    fetchPin();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);

    try {
      const response = await fetch('/portal/api/verkada-pin', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to regenerate PIN');
        setRegenerating(false);
        return;
      }

      setPin(data.pin);
      setRegenerating(false);
    } catch (err) {
      console.error('[VerkadaPin] Regenerate exception:', err);
      setError('Failed to regenerate PIN');
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-8">
        <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">Door Access</h2>
        <div className="flex items-center gap-2 text-text-muted dark:text-text-muted-dark">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand dark:border-brand-dark-mode"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-8">
        <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">Door Access</h2>
        <p className="text-error-text dark:text-error-text-dark">{error}</p>
      </div>
    );
  }

  if (!hasAccess || !pin) {
    return (
      <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-8">
        <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">Door Access</h2>
        <p className="text-text-secondary dark:text-text-secondary-dark">
          Door access is not available for your account. Please contact a staff member to set up Verkada access.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-6 mb-8">
      <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-4 font-display">Door Access</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-2">Your PIN Code</p>
          <div className="bg-background-page dark:bg-background-page-dark border-2 border-brand dark:border-brand-dark-mode p-4 inline-block">
            <p className="text-4xl font-bold text-brand dark:text-brand-dark-mode tracking-wider font-mono">
              {pin}#
            </p>
          </div>
        </div>

        <div className="text-sm text-text-secondary dark:text-text-secondary-dark space-y-2">
          <p>Use this code at the keypad next to the main entrance.</p>
          <p className="text-text-muted dark:text-text-muted-dark">
            Enter the digits followed by the # key.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-4 py-2 text-sm border border-border-medium dark:border-border-medium-dark text-text-secondary dark:text-text-secondary-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {regenerating ? 'Generating new PIN...' : 'Regenerate PIN'}
        </button>
      </div>
    </div>
  );
}
