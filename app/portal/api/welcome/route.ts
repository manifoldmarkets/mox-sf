import { getSession } from '@/app/lib/session'
import { updateRecord, Tables } from '@/app/lib/airtable'
import { env } from '@/app/lib/env'

const MAX_PHOTO_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]

interface PersonFields {
  Name?: string
  Photo?: { url: string; filename: string }[]
}

async function uploadPhotoToImgBB(photoFile: File): Promise<string | null> {
  const arrayBuffer = await photoFile.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  const imgbbFormData = new FormData()
  imgbbFormData.append('image', base64)
  imgbbFormData.append('name', photoFile.name || 'profile-photo')

  const imgbbResponse = await fetch(
    `https://api.imgbb.com/1/upload?key=${env.IMGBB_API_KEY}`,
    { method: 'POST', body: imgbbFormData }
  )

  if (!imgbbResponse.ok) {
    const errorText = await imgbbResponse.text()
    console.error('ImgBB upload error:', errorText)
    return null
  }

  const imgbbData = await imgbbResponse.json()
  return imgbbData.data?.url || null
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const effectiveUserId = session.viewingAsUserId || session.userId

    const formData = await request.formData()
    const name = (formData.get('name') as string | null)?.trim() || ''
    const photoFile = formData.get('photo') as File | null

    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }
    if (name.length > 200) {
      return Response.json(
        { error: 'Name is too long (max 200 characters)' },
        { status: 400 }
      )
    }
    if (!photoFile || photoFile.size === 0) {
      return Response.json({ error: 'Photo is required' }, { status: 400 })
    }
    if (photoFile.size > MAX_PHOTO_SIZE) {
      return Response.json(
        {
          error: `Photo is too large (max ${MAX_PHOTO_SIZE / 1024 / 1024}MB)`,
        },
        { status: 400 }
      )
    }
    if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
      return Response.json(
        { error: 'Invalid photo format. Allowed: JPEG, PNG, WebP, GIF, HEIC' },
        { status: 400 }
      )
    }

    const imageUrl = await uploadPhotoToImgBB(photoFile)
    if (!imageUrl) {
      return Response.json(
        { error: 'Failed to upload photo. Please try again.' },
        { status: 500 }
      )
    }

    await updateRecord<PersonFields>(Tables.People, effectiveUserId, {
      Name: name,
      Photo: [{ url: imageUrl, filename: photoFile.name || 'profile-photo.jpg' }],
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error in welcome submit:', error)
    return Response.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
