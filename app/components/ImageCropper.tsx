'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [localImageSrc, setLocalImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const isExternalUrl = imageSrc.startsWith('http://') || imageSrc.startsWith('https://')

    if (isExternalUrl) {
      setLoading(true)
      setError(null)

      // Use our proxy API to avoid CORS issues
      const proxyUrl = `/portal/api/proxy-image?url=${encodeURIComponent(imageSrc)}`

      fetch(proxyUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch image')
          return res.blob()
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob)
          blobUrlRef.current = url
          setLocalImageSrc(url)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching image:', err)
          setError('Could not load image. Try uploading a new photo instead.')
          setLoading(false)
        })
    } else {
      // Local blob URL, use directly
      setLocalImageSrc(imageSrc)
      setLoading(false)
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [imageSrc])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }, [])

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const pixelCrop = {
      x: completedCrop.x * scaleX,
      y: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY,
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    })
  }, [completedCrop])

  const handleSave = async () => {
    const croppedBlob = await getCroppedImg()
    if (croppedBlob) {
      onCropComplete(croppedBlob)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background-surface dark:bg-background-subtle-dark max-w-2xl w-full max-h-[90vh] overflow-auto p-4">
        <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark mb-4">
          Crop Photo
        </h3>

        <div className="flex justify-center mb-4 min-h-[200px] items-center">
          {loading && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-text-muted dark:text-text-muted-dark text-sm">Loading...</p>
            </div>
          )}
          {error && (
            <p className="text-error-text dark:text-error-text-dark text-center">{error}</p>
          )}
          {!loading && !error && localImageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
            >
              <img
                ref={imgRef}
                src={localImageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh', maxWidth: '100%' }}
              />
            </ReactCrop>
          )}
        </div>

        {!loading && !error && (
          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4 text-center">
            Drag to reposition. Drag corners to resize.
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border-medium dark:border-border-medium-dark text-text-secondary dark:text-text-secondary-dark hover:bg-background-subtle dark:hover:bg-background-subtle-dark transition-colors"
          >
            Cancel
          </button>
          {!error && (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              Apply Crop
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
