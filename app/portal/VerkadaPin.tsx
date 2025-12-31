'use client';

import { useState, useEffect } from 'react';

interface VerkadaPinProps {
  isViewingAs?: boolean;
}

export default function VerkadaPin({ isViewingAs = false }: VerkadaPinProps) {
  const [pin, setPin] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

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

  const handleRegenerateClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRegenerate = async () => {
    setShowConfirmModal(false);
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
      <h2 className="text-xl font-bold text-brand dark:text-brand-dark-mode font-display">Front Door Access</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-2">Your personal, unchanging PIN Code, you can give this to your guests, although you still need to be in the building when they are.</p>
          <div className="bg-background-page dark:bg-background-page-dark border-2 border-brand dark:border-brand-dark-mode p-4 inline-block">
            <p className="text-4xl font-bold text-brand dark:text-brand-dark-mode tracking-wider font-mono">
              {pin}#
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={handleRegenerateClick}
            disabled={regenerating || isViewingAs}
            className="px-4 py-2 text-sm border border-border-medium dark:border-border-medium-dark text-text-secondary dark:text-text-secondary-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isViewingAs ? "To change this user's PIN, please use the Verkada admin portal" : undefined}
          >
            {regenerating ? 'Generating new PIN...' : 'Regenerate PIN'}
          </button>
          {isViewingAs && (
            <p className="mt-2 text-xs text-text-muted dark:text-text-muted-dark">
              To change this user's PIN, please use the Verkada admin portal
            </p>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Regenerate PIN Code?</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This is mostly for if you regret posting it somewhere or sharing it with someone. Your current PIN ({pin}#) will stop working immediately, and you'll get a random new one.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmRegenerate}
                className="flex-1 px-4 py-2 bg-amber-800 dark:bg-amber-700 text-white font-medium hover:bg-amber-900 dark:hover:bg-amber-800 transition-colors"
              >
                Yes, Regenerate
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white font-medium hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
