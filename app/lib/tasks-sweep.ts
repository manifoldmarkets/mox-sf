/**
 * Task board maintenance sweep, run by the tasks-sweep cron:
 *   1. ✅ approvals — close "In review" tasks whose Discord message got a ✅.
 *   2. Nudge — email claimers who've gone quiet past NUDGE_HOURS.
 *   3. Auto-release — return stale claims (past RELEASE_HOURS) to Open.
 */
import { sendChannelMessage } from './discord'
import { DISCORD_CHANNELS } from './discord-constants'
import { sendEmail } from './email'
import { env } from './env'
import {
  listTasks,
  logTaskEvent,
  NUDGE_HOURS,
  RELEASE_HOURS,
  updateTask,
  type Task,
} from './tasks'

const BASE = env.TASKS_BASE_URL

function emailShell(body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;line-height:1.55">
  <p style="font-weight:700;letter-spacing:0.08em;font-size:13px;color:#78350f;margin:0 0 20px">MOX ᴛᴀꜱᴋꜱ</p>
  ${body}
  <p style="color:#6b7280;font-size:13px;margin-top:28px">— the Mox task board, ${BASE}</p>
</div>`
}

async function hasCheckReaction(messageId: string): Promise<boolean> {
  const token = env.DISCORD_BOT_TOKEN
  if (!token) return false
  try {
    const res = await fetch(
      `https://discord.com/api/v10/channels/${DISCORD_CHANNELS.TASKS}/messages/${messageId}`,
      { headers: { Authorization: `Bot ${token}` }, cache: 'no-store' }
    )
    if (!res.ok) return false
    const msg = await res.json()
    return (msg.reactions ?? []).some(
      (r: { emoji?: { name?: string } }) => r.emoji?.name === '✅'
    )
  } catch (err) {
    console.error('[tasks-sweep] reaction check failed:', err)
    return false
  }
}

async function processApprovals(tasks: Task[]): Promise<string[]> {
  const approved: string[] = []
  for (const task of tasks) {
    if (task.status !== 'In review' || !task.discordMessageId) continue
    if (!(await hasCheckReaction(task.discordMessageId))) continue
    await updateTask(task.id, { Status: 'Done' })
    await logTaskEvent({
      taskId: task.id,
      taskTitle: task.title,
      name: 'Mox team',
      type: 'Approved',
      note: 'Approved via ✅ reaction on Discord',
    })
    await sendChannelMessage(
      DISCORD_CHANNELS.TASKS,
      `🎉 **${task.title}** approved & closed. Thanks ${task.claimantName.split(' ')[0] || 'friend'}!`
    )
    approved.push(task.title)
  }
  return approved
}

export async function sweepTasks(): Promise<{
  approved: string[]
  nudged: string[]
  released: string[]
}> {
  const tasks = await listTasks()
  const approved = await processApprovals(tasks)
  const nudged: string[] = []
  const released: string[] = []
  const now = Date.now()

  for (const task of tasks) {
    if (task.status !== 'Claimed' || !task.claimedAt) continue
    const hours = (now - Date.parse(task.claimedAt)) / 3600_000
    const first = task.claimantName.split(' ')[0] || 'there'
    const taskUrl = `${BASE}/tasks/${task.id}`

    if (hours >= RELEASE_HOURS) {
      await updateTask(task.id, {
        Status: 'Open',
        'Claimant name': null,
        'Claimant email': null,
        'Claimed at': null,
        'Nudged at': null,
      })
      await logTaskEvent({
        taskId: task.id,
        taskTitle: task.title,
        name: task.claimantName,
        email: task.claimantEmail,
        type: 'Auto-released',
        note: `No completion after ${Math.round(hours)}h`,
      })
      if (task.claimantEmail) {
        await sendEmail({
          to: task.claimantEmail,
          from: 'Mox Tasks <portal@account.moxsf.com>',
          subject: `“${task.title}” went back on the board`,
          text: `Hey ${first}, no worries — "${task.title}" wasn't marked done within ${RELEASE_HOURS} hours, so it's back on the board. Grab another anytime: ${BASE}`,
          html: emailShell(
            `<p>Hey ${first},</p>
             <p>No worries at all — <strong>${task.title}</strong> wasn't marked done within ${RELEASE_HOURS} hours, so it's back on the board for someone else. That's just how we keep tasks fresh.</p>
             <p>If you actually finished it, tell us and we'll sort it out. And feel free to <a href="${BASE}" style="color:#78350f">claim another task</a> anytime.</p>`
          ),
        })
      }
      released.push(task.title)
    } else if (hours >= NUDGE_HOURS && !task.nudgedAt) {
      await updateTask(task.id, { 'Nudged at': new Date().toISOString() })
      if (task.claimantEmail) {
        await sendEmail({
          to: task.claimantEmail,
          from: 'Mox Tasks <portal@account.moxsf.com>',
          subject: `Still on “${task.title}”?`,
          text: `Hey ${first}, you claimed "${task.title}" about ${Math.round(hours)}h ago. Claims auto-release after ${RELEASE_HOURS}h. Mark it done or release it: ${taskUrl}`,
          html: emailShell(
            `<p>Hey ${first},</p>
             <p>You claimed <strong>${task.title}</strong> about ${Math.round(hours)} hours ago. Claims auto-release after ${RELEASE_HOURS} hours so the board stays fresh.</p>
             <p><a href="${taskUrl}" style="color:#78350f;font-weight:600">Mark it done</a> when you finish (a photo closes it instantly), or release it from the same page if today got away from you — zero judgment.</p>`
          ),
        })
      }
      nudged.push(task.title)
    }
  }

  return { approved, nudged, released }
}
