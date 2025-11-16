import { getSession } from '@/app/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import ProfileEditForm from './profile/edit/ProfileEditForm';
import SubscriptionInfo from './SubscriptionInfo';
import HostedEvents from './HostedEvents';
import MobilePortal from './MobilePortal';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/portal/login');
  }

  // Fetch user profile from Airtable
  const profile = await getUserProfile(session.userId);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">Unable to load your profile.</p>
          <p className="text-gray-500 text-sm">
            Your session is valid but we couldn't fetch your profile data.
            Please try <Link href="/portal/login" className="text-blue-600 hover:underline">logging in again</Link> or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  // Mobile view - separate screens for each section
  const mobileView = (
    <div className="lg:hidden">
      <MobilePortal profile={profile} userId={session.userId} />
    </div>
  );

  // Desktop view - original layout
  const desktopView = (
    <div className="hidden lg:block min-h-screen bg-gray-50 font-geist">

      <div className="flex">
        {/* Desktop Left Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 sticky top-0 h-screen">
          <div className="px-4 py-6 h-full flex flex-col">
            <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 mb-8 transition-colors px-4 py-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </Link>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              <a
                href="#subscription"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Subscription</span>
              </a>
              <a
                href="#events"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Events</span>
              </a>
              <a
                href="#profile"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-all group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </a>
            </nav>

            <div className="border-t border-gray-700 pt-4 mt-auto">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div id="subscription" className="scroll-mt-8">
              <SubscriptionInfo stripeCustomerId={profile.stripeCustomerId} />
            </div>

            <div id="events" className="scroll-mt-8">
              <HostedEvents userName={profile.name} />
            </div>

            <div id="profile" className="scroll-mt-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-6 font-playfair">Profile</h1>
                <ProfileEditForm profile={profile} userId={session.userId} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}

async function getUserProfile(recordId: string): Promise<{
  name: string;
  email: string;
  website: string;
  photo: string | null;
  directoryVisible: boolean;
  stripeCustomerId: string | null;
  error?: string;
} | null> {
  // Fetch only the fields we need for the profile edit form
  // Note: We can't filter for 'Show in directory' because Airtable omits it when unchecked
  // So we fetch all fields and handle missing fields in the response
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${recordId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const fields = data.fields;

  if (!fields) {
    return null;
  }

  // Airtable omits checkbox fields when unchecked, so we need to handle undefined
  const showInDirectory = fields['Show in directory'];

  return {
    name: fields.Name || '',
    email: fields.Email || '',
    website: fields.Website || '',
    photo: fields.Photo?.[0]?.url || null,
    directoryVisible: showInDirectory === true, // Will be false if field is undefined/unchecked
    stripeCustomerId: fields['Stripe Customer ID'] || null,
  };
}
