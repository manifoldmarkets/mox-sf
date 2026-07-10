import { NextRequest, NextResponse } from 'next/server'
import { isOrganizer } from '@/app/lib/tasks-auth'
import { createTask, updateTask, uploadTaskImage } from '@/app/lib/tasks'

const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const MAX_PHOTOS = 4

// Organizer-only: add a task to the board. Organizer = Mox staff (member
// session) or an allowlisted claimer email — never Google alone.
export async function POST(request: NextRequest) {
  if (!(await isOrganizer())) {
    return NextResponse.json(
      { error: 'Only the Mox team can add tasks.' },
      { status: 403 }
    )
  }

  const form = await request.formData()
  const title = String(form.get('title') || '').trim()
  if (!title)
    return NextResponse.json({ error: 'A title is required.' }, { status: 400 })

  const str = (k: string) => String(form.get(k) || '').trim()
  const skills = form.getAll('skills').map(String).filter(Boolean)

  const fields: Record<string, unknown> = { Name: title, Status: 'Open' }
  if (str('summary')) fields['Summary'] = str('summary')
  if (str('brief')) fields['Brief'] = str('brief')
  if (str('doneCriteria')) fields['Done criteria'] = str('doneCriteria')
  if (str('contextLinks')) fields['Context links'] = str('contextLinks')
  if (str('floor')) fields['Floor'] = str('floor')
  if (str('effort')) fields['Effort'] = str('effort')
  if (skills.length) fields['Skills'] = skills

  const mp = str('mapPoint')
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(mp)) fields['Map point'] = mp

  const id = await createTask(fields)

  const photos = form
    .getAll('photos')
    .filter((p): p is File => p instanceof File && p.size > 0)
  const urls: { url: string }[] = []
  for (const photo of photos.slice(0, MAX_PHOTOS)) {
    if (photo.size > MAX_PHOTO_BYTES || !photo.type.startsWith('image/'))
      continue
    const base64 = Buffer.from(await photo.arrayBuffer()).toString('base64')
    const url = await uploadTaskImage(base64)
    if (url) urls.push({ url })
  }
  if (urls.length) {
    await updateTask(id, { 'Reference photos': urls })
  }

  return NextResponse.json({ ok: true, id })
}
