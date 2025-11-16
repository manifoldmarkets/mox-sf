import { getSession } from '@/app/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import ProfileEditForm from './profile/edit/ProfileEditForm';
import SubscriptionInfo from './SubscriptionInfo';
import HostedEvents from './HostedEvents';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 text-sm">
            ← Back
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <SubscriptionInfo stripeCustomerId={profile.stripeCustomerId} />

        <HostedEvents userName={profile.name} />

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-6">Profile</h1>
          <ProfileEditForm profile={profile} userId={session.userId} />
        </div>
      </div>
    </div>
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
