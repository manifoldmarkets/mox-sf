'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WelcomeFormProps {
  userId: string
  initialName: string
  existingPhoto: string | null
}

export default function WelcomeForm({
  userId: _userId,
  initialName,
  existingPhoto,
}: WelcomeFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    if (!name.trim()) {
      setStatus('error')
      setMessage('please enter your name.')
      return
    }
    if (!photoFile && !existingPhoto) {
      setStatus('error')
      setMessage('please take or upload a photo.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      if (photoFile) formData.append('photo', photoFile)

      const response = await fetch('/portal/api/welcome', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/portal')
        router.refresh()
      } else {
        setStatus('error')
        setMessage(data.error || 'something went wrong. please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('network error. please try again.')
    }
  }

  const photoPreview = photoFile
    ? URL.createObjectURL(photoFile)
    : existingPhoto

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">your name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="first last"
        />
      </div>

      <div className="form-group">
        <label>photo</label>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Your photo"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                border: '1px solid #ccc',
              }}
            />
          )}
          <div>
            <input
              type="file"
              id="photo-camera"
              accept="image/*"
              capture="user"
              onChange={(e) =>
                e.target.files?.[0] && setPhotoFile(e.target.files[0])
              }
              style={{ display: 'none' }}
            />
            <input
              type="file"
              id="photo-upload"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              onChange={(e) =>
                e.target.files?.[0] && setPhotoFile(e.target.files[0])
              }
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('photo-camera')?.click()}
              className="primary"
              style={{ marginRight: '8px' }}
            >
              take photo
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              upload photo
            </button>
            {photoFile && (
              <p className="muted" style={{ marginTop: '5px' }}>
                {photoFile.name}
              </p>
            )}
            <p className="muted" style={{ marginTop: '5px', fontSize: '0.9em' }}>
              JPG, PNG, WebP, GIF, or HEIC. max 10MB.
            </p>
          </div>
        </div>
      </div>

      {message && status === 'error' && <p className="error">{message}</p>}

      <button type="submit" disabled={status === 'loading'} className="primary">
        {status === 'loading' ? 'saving...' : 'continue to portal'}
      </button>
    </form>
  )
}
