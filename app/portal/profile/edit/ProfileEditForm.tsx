'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageCropper from '@/app/components/ImageCropper'

interface ProfileEditFormProps {
  profile: {
    name: string
    email: string
    website: string
    photo: string | null
    directoryVisible: boolean
    discordUsername?: string | null
    tier?: string | null
    status?: string | null
  }
  userId: string
}

export default function ProfileEditForm({
  profile,
  userId,
}: ProfileEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: profile.name,
    website: profile.website,
    discordUsername: profile.discordUsername || '',
    directoryVisible: profile.directoryVisible,
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')
  const [discordSyncStatus, setDiscordSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle')
  const [discordSyncMessage, setDiscordSyncMessage] = useState('')

  // Update form data when profile prop changes (e.g., after router.refresh())
  useEffect(() => {
    setFormData({
      name: profile.name,
      website: profile.website,
      discordUsername: profile.discordUsername || '',
      directoryVisible: profile.directoryVisible,
    })
    setStatus('idle')
    setMessage('')
    setPhotoFile(null)
    setShowCropper(false)
    setImageToCrop(null)
  }, [profile])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setImageToCrop(imageUrl)
      setShowCropper(true)
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'profile-photo.jpg', {
      type: 'image/jpeg',
    })
    setPhotoFile(croppedFile)
    setShowCropper(false)
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop)
    }
    setImageToCrop(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop)
    }
    setImageToCrop(null)
  }

  const handleEditExistingPhoto = () => {
    if (profile.photo) {
      setImageToCrop(profile.photo)
      setShowCropper(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('userId', userId)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('website', formData.website)
      formDataToSend.append('discordUsername', formData.discordUsername)
      formDataToSend.append(
        'directoryVisible',
        formData.directoryVisible.toString()
      )

      if (photoFile) {
        formDataToSend.append('photo', photoFile)
      }

      const response = await fetch('/portal/api/update-profile', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Profile updated successfully!')
        // Refresh the page to show updated data (useEffect will clear state)
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to update profile. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    }
  }

  const handleDiscordSync = async () => {
    if (!profile.discordUsername) return

    setDiscordSyncStatus('syncing')
    setDiscordSyncMessage('')

    try {
      const response = await fetch('/portal/api/sync-discord-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordUsername: profile.discordUsername,
          tier: profile.tier,
          status: profile.status,
          userId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDiscordSyncStatus('success')
        setDiscordSyncMessage('Discord role synced!')
        setTimeout(() => {
          setDiscordSyncStatus('idle')
          setDiscordSyncMessage('')
        }, 3000)
      } else {
        setDiscordSyncStatus('error')
        setDiscordSyncMessage(data.error || 'Failed to sync role')
      }
    } catch (error) {
      setDiscordSyncStatus('error')
      setDiscordSyncMessage('Network error. Please try again.')
    }
  }

  return (
    <>
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-2 border border-border-medium dark:border-border-medium-dark bg-background-subtle dark:bg-background-subtle-dark text-text-tertiary dark:text-text-tertiary-dark cursor-not-allowed"
          />
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">
            Ask a staff member if you want to update your email
          </p>
        </div>

        {/* Discord Username */}
        <div>
          <label
            htmlFor="discordUsername"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Discord Username
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="discordUsername"
              name="discordUsername"
              value={formData.discordUsername}
              onChange={handleChange}
              placeholder="yourname"
              className="flex-1 px-4 py-2 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
            />
            <a
              href="https://discord.gg/jZHTRHUWy9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors whitespace-nowrap"
            >
              Join Discord
            </a>
          </div>
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">
            Your Discord username (without the @). Find it in Discord under
            Settings → My Account.
          </p>
          {profile.discordUsername && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscordSync}
                disabled={discordSyncStatus === 'syncing'}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50"
              >
                {discordSyncStatus === 'syncing'
                  ? 'Syncing...'
                  : 'Sync Discord Role'}
              </button>
              {discordSyncMessage && (
                <span
                  className={`text-xs ${discordSyncStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  {discordSyncMessage}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-2 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Profile Photo
          </label>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 relative group">
              {photoFile || profile.photo ? (
                <>
                  <img
                    src={
                      photoFile
                        ? URL.createObjectURL(photoFile)
                        : profile.photo!
                    }
                    alt="Profile"
                    className="w-32 h-32 object-cover border-2 border-border-light dark:border-border-medium-dark"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (photoFile) {
                        setImageToCrop(URL.createObjectURL(photoFile))
                      } else if (profile.photo) {
                        setImageToCrop(profile.photo)
                      }
                      setShowCropper(true)
                    }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium"
                  >
                    Crop
                  </button>
                </>
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-secondary-100 dark:bg-gray-700 text-4xl font-bold text-secondary-600 dark:text-gray-300 border-2 border-border-light dark:border-border-medium-dark">
                  {profile.name
                    .split(' ')
                    .map((n) => n.charAt(0))
                    .join('')}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="photo"
                  className="inline-flex items-center px-4 py-2 border border-border-medium dark:border-border-medium-dark shadow-sm text-sm font-medium text-text-secondary dark:text-text-secondary-dark bg-background-surface dark:bg-background-subtle-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark cursor-pointer transition-colors"
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
                {(photoFile || profile.photo) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (photoFile) {
                        setImageToCrop(URL.createObjectURL(photoFile))
                      } else if (profile.photo) {
                        setImageToCrop(profile.photo)
                      }
                      setShowCropper(true)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-border-medium dark:border-border-medium-dark shadow-sm text-sm font-medium text-text-secondary dark:text-text-secondary-dark bg-background-surface dark:bg-background-subtle-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark transition-colors"
                  >
                    Crop
                  </button>
                )}
              </div>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
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
              <label
                htmlFor="directoryVisible"
                className="font-medium text-text-secondary dark:text-text-secondary-dark"
              >
                Show my profile in the member directory
              </label>
              <p className="text-sm text-text-muted dark:text-text-muted-dark">
                When enabled, other members can see your profile in the{' '}
                <a
                  href="/people"
                  className="text-brand dark:text-brand-dark-mode hover:underline"
                >
                  member directory
                </a>
                . You can change this setting at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 ${
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
            className="w-full bg-brand dark:bg-brand text-white py-2 px-4 hover:bg-brand-dark dark:hover:bg-brand-dark disabled:bg-text-muted dark:disabled:bg-text-muted-dark disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
    </>
  )
}
