'use client';

import { useState } from 'react';

interface SyncResults {
  total: number;
  synced: number;
  failed: number;
  skipped: number;
  results: {
    success: Array<{ name: string; discordUsername: string; role: string }>;
    failed: Array<{ name: string; discordUsername: string; error: string }>;
    skipped: Array<{ name: string; discordUsername: string; reason: string }>;
  };
}

export default function BulkRoleSync() {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<SyncResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    if (syncing) return;

    const confirmed = window.confirm(
      'This will sync Discord roles for ALL members with linked Discord usernames. Continue?'
    );
    if (!confirmed) return;

    setSyncing(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/portal/api/bulk-sync-discord-roles', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sync roles');
        return;
      }

      setResults(data);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Bulk Role Sync
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Sync Discord roles for all members who have linked their Discord username.
        Assigns roles based on Airtable tier: Friend, Member, Resident, Private Office, Program.
        Staff roles are managed manually.
      </p>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium transition-colors"
      >
        {syncing ? 'Syncing...' : 'Sync All Discord Roles'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{results.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{results.synced}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Synced</div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{results.skipped}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Skipped</div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30">
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{results.failed}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
            </div>
          </div>

          {results.results.failed.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Failed:</h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {results.results.failed.map((f, i) => (
                  <li key={i}>
                    {f.name} ({f.discordUsername}): {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.results.skipped.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-yellow-800 dark:text-yellow-200 font-medium">
                Skipped ({results.skipped})
              </summary>
              <ul className="mt-2 text-yellow-700 dark:text-yellow-300 space-y-1 ml-4">
                {results.results.skipped.map((s, i) => (
                  <li key={i}>
                    {s.name} ({s.discordUsername}): {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {results.results.success.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-green-800 dark:text-green-200 font-medium">
                Successfully synced ({results.synced})
              </summary>
              <ul className="mt-2 text-green-700 dark:text-green-300 space-y-1 ml-4">
                {results.results.success.map((s, i) => (
                  <li key={i}>
                    {s.name} ({s.discordUsername})
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
