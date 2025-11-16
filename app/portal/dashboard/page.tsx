import { getSession } from '@/app/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import ProfileEditForm from '../profile/edit/ProfileEditForm';

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
          <p className="text-gray-600">Unable to load your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back to Mox SF
            </Link>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {profile.name}!</h1>
          <p className="text-gray-600">Manage your Mox SF membership and profile</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Edit Form - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
              <p className="text-gray-600">Update your information to help other members discover you</p>
            </div>
            <ProfileEditForm profile={profile} userId={session.userId} />
          </div>

          {/* Quick Actions Card - Takes up 1 column */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="https://billing.stripe.com/p/login/5kAbIOdVF0Oa1vq6oo"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg text-center"
              >
                Manage Billing
              </a>
              <Link
                href="/people"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg text-center"
              >
                View Member Directory
              </Link>
              <Link
                href="/events"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg text-center"
              >
                View Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getUserProfile(recordId: string) {
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
  const showInDirectory = fields['Show in directory'];

  return {
    name: fields.Name || '',
    email: fields.Email || '',
    website: fields.Website || '',
    interests: fields.Interests || [],
    photo: fields.Photo?.[0]?.url || null,
    directoryVisible: showInDirectory === true,
  };
}
