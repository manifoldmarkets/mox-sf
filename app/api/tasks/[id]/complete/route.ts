import { NextRequest, NextResponse } from 'next/server'
import { sendChannelMessage } from '@/app/lib/discord'
import { DISCORD_CHANNELS } from '@/app/lib/discord-constants'
import { getClaimer } from '@/app/lib/tasks-auth'
import {
  airtableTaskUrl,
  getTask,
  logTaskEvent,
  updateTask,
  uploadTaskImage,
} from '@/app/lib/tasks'

const MAX_PHOTO_BYTES = 4 * 1024 * 1024

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claimer = await getClaimer()
  if (!claimer)
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })

  const { id } = await params
  const task = await getTask(id)
  if (!task)
    return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
  if (task.status !== 'Claimed' || task.claimantEmail !== claimer.email) {
    return NextResponse.json(
      { error: "This task isn't claimed by you." },
      { status: 403 }
    )
  }

  const form = await request.formData()
  const note = String(form.get('note') || '').trim()
  const photo = form.get('photo')

  let photoUrl: string | null = null
  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: 'Photo too large — keep it under 4 MB.' },
        { status: 413 }
      )
    }
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are accepted as proof.' },
        { status: 415 }
      )
    }
    const base64 = Buffer.from(await photo.arrayBuffer()).toString('base64')
    photoUrl = await uploadTaskImage(base64)
  }

  // Photo proof auto-closes the task; without a photo it waits for review.
  const hasPhoto = !!photoUrl
  const newStatus = hasPhoto ? 'Done' : 'In review'
  await updateTask(id, {
    Status: newStatus,
    'Completed at': new Date().toISOString(),
    ...(note ? { 'Completion note': note } : {}),
    ...(photoUrl ? { 'Proof photo': [{ url: photoUrl }] } : {}),
  })

  await logTaskEvent({
    taskId: id,
    taskTitle: task.title,
    name: claimer.name,
    email: claimer.email,
    type: 'Completed',
    note,
  })

  const noteLine = note ? `\n> ${note.replace(/\n/g, ' ')}` : ''
  if (hasPhoto) {
    await sendChannelMessage(
      DISCORD_CHANNELS.TASKS,
      `✅ **${claimer.name}** finished **${task.title}** — photo proof uploaded, auto-closed.${noteLine}\n<${airtableTaskUrl(id)}>`
    )
  } else {
    const result = await sendChannelMessage(
      DISCORD_CHANNELS.TASKS,
      `🔎 **${claimer.name}** marked **${task.title}** as done — react with ✅ to approve & close it.${noteLine}\n<${airtableTaskUrl(id)}>`
    )
    if (result.messageId)
      await updateTask(id, { 'Discord message id': result.messageId })
  }

  return NextResponse.json({ ok: true, status: newStatus })
}
