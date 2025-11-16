'use client';

import { useState } from 'react';
import Link from 'next/link';
import SubscriptionInfo from './SubscriptionInfo';
import HostedEvents from './HostedEvents';
import ProfileEditForm from './profile/edit/ProfileEditForm';
import LogoutButton from './LogoutButton';

interface MobilePortalProps {
  profile: {
    name: string;
    email: string;
    website: string;
    photo: string | null;
    directoryVisible: boolean;
    stripeCustomerId: string | null;
  };
  userId: string;
}

type Section = 'subscription' | 'events' | 'profile';

export default function MobilePortal({ profile, userId }: MobilePortalProps) {
  const [activeSection, setActiveSection] = useState<Section>('subscription');

  return (
    <div className="min-h-screen bg-gray-50 font-geist flex flex-col">
      {/* Header with Back to Home */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-geist"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Content Area - Full screen for active section */}
      <div className="flex-1 overflow-y-auto pb-16">
        {activeSection === 'subscription' && (
          <div className="p-3">
            <SubscriptionInfo stripeCustomerId={profile.stripeCustomerId} />
          </div>
        )}

        {activeSection === 'events' && (
          <div className="p-3">
            <HostedEvents userName={profile.name} />
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="p-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h1 className="text-xl font-bold text-gray-900 mb-6 font-playfair">Profile</h1>
              <ProfileEditForm profile={profile} userId={userId} />

              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 safe-area-inset-bottom font-geist">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => setActiveSection('subscription')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === 'subscription'
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs font-medium">Subscription</span>
          </button>
          <button
            onClick={() => setActiveSection('events')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === 'events'
                ? 'text-green-600'
                : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Events</span>
          </button>
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === 'profile'
                ? 'text-purple-600'
                : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
