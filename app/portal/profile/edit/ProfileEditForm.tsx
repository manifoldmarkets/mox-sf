'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')
  const [discordSyncStatus, setDiscordSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle')
  const [discordSyncMessage, setDiscordSyncMessage] = useState('')

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
      setPhotoFile(e.target.files[0])
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
        setMessage('profile updated!')
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        setStatus('error')
        setMessage(data.error || 'failed to update profile. please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('an error occurred. please try again.')
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
        setDiscordSyncMessage('discord role synced!')
        setTimeout(() => {
          setDiscordSyncStatus('idle')
          setDiscordSyncMessage('')
        }, 3000)
      } else {
        setDiscordSyncStatus('error')
        setDiscordSyncMessage(data.error || 'failed to sync role')
      }
    } catch (error) {
      setDiscordSyncStatus('error')
      setDiscordSyncMessage('network error. please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">name *</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">email</label>
        <input type="email" id="email" value={profile.email} disabled />
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
          ask a staff member if you want to update your email
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="discordUsername">discord username</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <input
            type="text"
            id="discordUsername"
            name="discordUsername"
            value={formData.discordUsername}
            onChange={handleChange}
            placeholder="yourname"
            style={{ flex: 1 }}
          />
          <a
            href="https://discord.gg/jZHTRHUWy9"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            join discord
          </a>
        </div>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
          your discord username (without the @). find it in discord under
          Settings → My Account.
        </p>
        {profile.discordUsername && (
          <p style={{ marginTop: '10px' }}>
            <button
              type="button"
              onClick={handleDiscordSync}
              disabled={discordSyncStatus === 'syncing'}
            >
              {discordSyncStatus === 'syncing'
                ? 'syncing...'
                : 'sync discord role'}
            </button>
            {discordSyncMessage && (
              <span
                className={
                  discordSyncStatus === 'success' ? 'success' : 'error'
                }
                style={{ marginLeft: '10px' }}
              >
                {discordSyncMessage}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="website">website</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div className="form-group">
        <label>profile photo</label>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          {(photoFile || profile.photo) && (
            <img
              src={photoFile ? URL.createObjectURL(photoFile) : profile.photo!}
              alt="Profile"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                border: '1px solid #ccc',
              }}
            />
          )}
          <div>
            <input
              type="file"
              id="photo"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              onChange={handlePhotoChange}
            />
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
              JPG, PNG, WebP, GIF, or HEIC. Max 10MB.
            </p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            id="directoryVisible"
            name="directoryVisible"
            checked={formData.directoryVisible}
            onChange={handleChange}
          />
          show my profile in the <Link href="/people">member directory</Link>
        </label>
      </div>

      {message && (
        <p className={status === 'success' ? 'success' : 'error'}>{message}</p>
      )}

      <button type="submit" disabled={status === 'loading'} className="primary">
        {status === 'loading' ? 'saving...' : 'save changes'}
      </button>
    </form>
  )
}
