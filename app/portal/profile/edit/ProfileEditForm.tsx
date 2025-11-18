'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileEditFormProps {
  profile: {
    name: string;
    email: string;
    website: string;
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border-medium dark:border-border-medium-dark rounded-lg bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-2 border border-border-medium dark:border-border-medium-dark rounded-lg bg-background-subtle dark:bg-background-subtle-dark text-text-tertiary dark:text-text-tertiary-dark cursor-not-allowed"
          />
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">Ask a staff member if you want to update your email</p>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-2 border border-border-medium dark:border-border-medium-dark rounded-lg bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Profile Photo
          </label>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src={photoFile ? URL.createObjectURL(photoFile) : profile.photo || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-border-light dark:border-border-medium-dark"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="photo"
                className="inline-flex items-center px-4 py-2 border border-border-medium dark:border-border-medium-dark rounded-lg shadow-sm text-sm font-medium text-text-secondary dark:text-text-secondary-dark bg-background-surface dark:bg-background-subtle-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark cursor-pointer transition-colors"
              >
                Choose File
                <input
                  type="file"
                  id="photo"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-text-muted dark:text-text-muted-dark mt-2">
                JPG, PNG, WebP, GIF, or HEIC. Max size 10MB.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Visibility */}
        <div className="border-t border-border-light dark:border-border-light-dark pt-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="directoryVisible"
                name="directoryVisible"
                checked={formData.directoryVisible}
                onChange={handleChange}
                className="w-4 h-4 text-brand dark:text-brand border-border-medium dark:border-border-medium-dark rounded focus:ring-brand dark:focus:ring-brand"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="directoryVisible" className="font-medium text-text-secondary dark:text-text-secondary-dark">
                Show my profile in the member directory
              </label>
              <p className="text-sm text-text-muted dark:text-text-muted-dark">
                When enabled, other members can see your profile in the{' '}
                <a href="/people" className="text-brand dark:text-brand-dark-mode hover:underline">member directory</a>.
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
                ? 'bg-success-bg dark:bg-success-bg-dark text-success-text dark:text-success-text-dark border border-success-bg dark:border-success-bg-dark'
                : 'bg-error-bg dark:bg-error-bg-dark text-error-text dark:text-error-text-dark border border-error-bg dark:border-error-bg-dark'
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
            className="w-full bg-brand dark:bg-brand text-white py-2 px-4 rounded-lg hover:bg-brand-dark dark:hover:bg-brand-dark disabled:bg-text-muted dark:disabled:bg-text-muted-dark disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
