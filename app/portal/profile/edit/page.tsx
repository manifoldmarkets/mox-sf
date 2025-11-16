import { getSession } from '@/app/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProfileEditForm from './ProfileEditForm';

export default async function EditProfilePage() {
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/portal/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Your Profile</h1>
          <p className="text-gray-600">Update your information to help other members discover you</p>
        </div>

        <ProfileEditForm profile={profile} userId={session.userId} />
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
