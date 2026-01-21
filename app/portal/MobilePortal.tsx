'use client';

import { useState } from 'react';
import Link from 'next/link';
import HostedEvents from './HostedEvents';
import ProfileEditForm from './profile/edit/ProfileEditForm';
import LogoutButton from './LogoutButton';
import VerkadaPin from './VerkadaPin';
import AdminViewAsSelector from './AdminViewAsSelector';
import AdminBanner from './AdminBanner';
import MembershipStatus from './MembershipStatus';
import DayPassPurchase from './DayPassPurchase';

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
  isStaff?: boolean;
  viewingAsUserId?: string;
  viewingAsName?: string;
  status?: string | null;
  tier?: string | null;
  orgId?: string | null;
}

type Section = 'subscription' | 'events' | 'profile';

export default function MobilePortal({ profile, userId, isStaff, viewingAsUserId, viewingAsName, status, tier, orgId }: MobilePortalProps) {
  const [activeSection, setActiveSection] = useState<Section>('subscription');

  return (
    <div className="min-h-screen bg-background-page dark:bg-background-page-dark font-sans flex flex-col">
      {/* Admin banner when viewing as another user */}
      {viewingAsUserId && viewingAsName && (
        <AdminBanner viewingAsName={viewingAsName} />
      )}

      {/* Header with Back to Home */}
      <header className="bg-background-surface dark:bg-background-surface-dark border-b border-border-light dark:border-border-light-dark sticky top-0 z-10">
        <div className="flex items-center justify-between p-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-tertiary dark:text-text-tertiary-dark hover:text-brand dark:hover:text-brand-dark-mode transition-colors font-sans"
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
            {/* Admin view-as selector */}
            {isStaff && (
              <div className="space-y-4 mb-4">
                <AdminViewAsSelector
                  currentViewingAsUserId={viewingAsUserId}
                  currentViewingAsName={viewingAsName}
                />
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4">
                  <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">Admin Tools</div>
                  <Link
                    href="/portal/admin/discord-mapping"
                    className="text-sm text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    Discord Username Mapping Tool →
                  </Link>
                </div>
              </div>
            )}

            {/* Unified Membership Status */}
            <MembershipStatus
              status={status}
              firstName={profile.name.split(' ')[0]}
              stripeCustomerId={profile.stripeCustomerId}
              tier={tier}
              orgId={orgId}
            />

            {/* Day Pass Purchase */}
            <DayPassPurchase
              stripeCustomerId={profile.stripeCustomerId}
              userName={profile.name}
              userEmail={profile.email}
            />

            <VerkadaPin isViewingAs={!!viewingAsUserId} />
          </div>
        )}

        {activeSection === 'events' && (
          <div className="p-3">
            <HostedEvents userName={profile.name} />
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="p-3">
            <div className="bg-background-surface dark:bg-background-surface-dark border border-border-light dark:border-border-light-dark p-3">
              <h1 className="text-xl font-bold text-brand dark:text-brand-dark-mode mb-6 font-display">Profile</h1>
              <ProfileEditForm profile={profile} userId={userId} />

              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t border-border-light dark:border-border-light-dark">
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background-surface dark:bg-background-surface-dark border-t border-border-light dark:border-border-light-dark z-20 safe-area-inset-bottom font-sans">
        <div className="grid grid-cols-3 h-16">
          <button
            onClick={() => setActiveSection('subscription')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === 'subscription'
                ? 'text-brand dark:text-brand-dark-mode'
                : 'text-text-tertiary dark:text-text-tertiary-dark'
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
                ? 'text-brand dark:text-brand-dark-mode'
                : 'text-text-tertiary dark:text-text-tertiary-dark'
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
                ? 'text-brand dark:text-brand-dark-mode'
                : 'text-text-tertiary dark:text-text-tertiary-dark'
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
