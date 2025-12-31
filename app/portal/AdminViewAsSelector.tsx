'use client';

import { useState, useRef } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface AdminViewAsSelectorProps {
  currentViewingAsUserId?: string;
  currentViewingAsName?: string;
}

export default function AdminViewAsSelector({
  currentViewingAsUserId,
  currentViewingAsName
}: AdminViewAsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function searchMembers(query: string) {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/portal/api/members-search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.members || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Failed to search members:', error);
    } finally {
      setSearching(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchMembers(query);
    }, 300);
  }

  async function handleSelectMember(member: Member) {
    if (switching) return;
    setSwitching(true);

    try {
      await fetch('/portal/api/view-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.id,
          userName: member.name
        }),
      });

      // Reload page to show new view
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch view:', error);
      setSwitching(false);
    }
  }

  async function handleClearView() {
    if (switching) return;
    setSwitching(true);

    try {
      await fetch('/portal/api/view-as', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: null }),
      });

      window.location.reload();
    } catch (error) {
      console.error('Failed to clear view:', error);
      setSwitching(false);
    }
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="view-as-search" className="text-sm font-medium text-purple-900 dark:text-purple-100">
          Admin: View Portal As
        </label>
        {currentViewingAsUserId && (
          <button
            onClick={handleClearView}
            disabled={switching}
            className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            View as yourself
          </button>
        )}
      </div>

      {currentViewingAsUserId && (
        <div className="mb-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 text-sm text-purple-900 dark:text-purple-100">
          Currently viewing as: <span className="font-semibold">{currentViewingAsName}</span>
        </div>
      )}

      <div className="relative">
          <input
            id="view-as-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            disabled={switching}
            className="w-full px-3 py-2 border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            onBlur={() => {
              // Delay to allow click on results
              setTimeout(() => setShowResults(false), 200);
            }}
          />

          {searching && (
            <div className="absolute right-3 top-2.5 text-purple-600 dark:text-purple-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 max-h-60 overflow-y-auto shadow-lg">
              {searchResults.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="w-full text-left px-4 py-2 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{member.email}</div>
                </button>
              ))}
            </div>
          )}

          {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 px-4 py-3 text-gray-600 dark:text-gray-400 shadow-lg">
              No members found
            </div>
          )}
        </div>

      {switching && (
        <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">Switching view...</div>
      )}
    </div>
  );
}
