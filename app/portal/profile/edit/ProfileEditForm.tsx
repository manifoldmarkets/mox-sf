'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileEditFormProps {
  profile: {
    name: string;
    email: string;
    website: string;
    interests: string[];
    photo: string | null;
    directoryVisible: boolean;
  };
  userId: string;
}

export default function ProfileEditForm({ profile, userId }: ProfileEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: profile.name,
    website: profile.website,
    interests: profile.interests.join(', '),
    directoryVisible: profile.directoryVisible,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Update form data when profile prop changes (e.g., after router.refresh())
  useEffect(() => {
    setFormData({
      name: profile.name,
      website: profile.website,
      interests: profile.interests.join(', '),
      directoryVisible: profile.directoryVisible,
    });
    setStatus('idle');
    setMessage('');
    setPhotoFile(null);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', userId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('interests', formData.interests);
      formDataToSend.append('directoryVisible', formData.directoryVisible.toString());

      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await fetch('/portal/api/update-profile', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Profile updated successfully!');
        // Refresh the page to show updated data (useEffect will clear state)
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Interests */}
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="AI, philosophy, effective altruism (comma-separated)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
        </div>

        {/* Photo */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          {profile.photo && !photoFile && (
            <div className="mb-4">
              <img
                src={profile.photo}
                alt="Current profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <p className="text-xs text-gray-500 mt-1">Current photo</p>
            </div>
          )}
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a new photo to replace the current one
          </p>
        </div>

        {/* Directory Visibility */}
        <div className="border-t pt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="directoryVisible"
                name="directoryVisible"
                checked={formData.directoryVisible}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="directoryVisible" className="font-medium text-gray-700">
                Show my profile in the member directory
              </label>
              <p className="text-sm text-gray-500">
                When enabled, other members can see your profile in the{' '}
                <a href="/people" className="text-blue-600 hover:underline">member directory</a>.
                You can change this setting at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              status === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
