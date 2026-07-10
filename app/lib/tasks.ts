/**
 * Data layer for the public task board (app/tasks, served at tasks.moxsf.com).
 *
 * Built on the shared Airtable helpers. Two tables in the Mox base:
 *   - Tasks       — one row per task; rows with Status "Open" show publicly.
 *   - Task Claims — append-only activity log (claims/completions/releases…).
 *
 * Note on the map: the pin uses app/lib/tasks-floorplans.ts (a snapshot of the
 * internal room-map service with real room polygons). The repo's own Floors
 * table only has static SVG images with no room coordinates, so it can't drive
 * clickable pins — hence the dedicated snapshot.
 */
import {
  createRecord,
  deleteRecord,
  getRecord,
  getRecords,
  Tables,
  updateRecord,
} from './airtable'
import { env } from './env'
import { storyForFloor } from './tasks-floorplans'

export { storyForFloor }

export const SKILLS = [
  'Space & setup',
  'Errand',
  'Design',
  'Writing',
  'Tech',
  'Events',
  'Ops & admin',
] as const

export const EFFORTS = ['< 1h', '1–2h', '2–3h'] as const
export const FLOORS = [
  '1st floor',
  '2nd floor',
  '3rd floor',
  '4th floor',
  'Rooftop',
] as const

export const NUDGE_HOURS = Number(env.TASKS_NUDGE_HOURS) || 8
export const RELEASE_HOURS = Number(env.TASKS_RELEASE_HOURS) || 24

export type TaskStatus = 'Open' | 'Claimed' | 'In review' | 'Done' | 'Archived'
export type TaskEventType =
  | 'Claimed'
  | 'Completed'
  | 'Released'
  | 'Auto-released'
  | 'Approved'

export interface ContextLink {
  label: string
  url: string
}

export interface TaskPhoto {
  url: string
  thumbUrl: string
  filename: string
}

// Raw Airtable field shape (by name) for the Tasks table.
interface TaskFields {
  Name?: string
  Summary?: string
  Brief?: string
  'Done criteria'?: string
  'Context links'?: string
  Skills?: string[]
  Effort?: string
  Status?: TaskStatus
  Floor?: string
  'Map point'?: string
  'Claimant name'?: string
  'Claimant email'?: string
  'Claimed at'?: string
  'Nudged at'?: string
  'Completed at'?: string
  'Completion note'?: string
  'Proof photo'?: AirtableAttachment[]
  'Reference photos'?: AirtableAttachment[]
  'Discord message id'?: string
}

interface AirtableAttachment {
  url: string
  filename?: string
  thumbnails?: { large?: { url: string } }
}

export interface Task {
  id: string
  title: string
  summary: string
  brief: string
  doneCriteria: string
  contextLinks: ContextLink[]
  skills: string[]
  effort: string
  status: TaskStatus
  floor: string
  mapPoint: { x: number; y: number } | null
  claimantName: string
  claimantEmail: string
  claimedAt: string | null
  nudgedAt: string | null
  completedAt: string | null
  completionNote: string
  hasProofPhoto: boolean
  refPhotos: TaskPhoto[]
  discordMessageId: string
}

function parseContextLinks(raw: string): ContextLink[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split('|').map((s) => s.trim())
      return b ? { label: a, url: b } : { label: a, url: a }
    })
    .filter((l) => l.url.startsWith('http'))
}

function parseMapPoint(raw?: string): { x: number; y: number } | null {
  if (!raw) return null
  const [x, y] = raw.split(',').map((s) => Number(s.trim()))
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x, y }
}

function parsePhotos(atts?: AirtableAttachment[]): TaskPhoto[] {
  return (atts ?? []).map((a) => ({
    url: a.url,
    thumbUrl: a.thumbnails?.large?.url ?? a.url,
    filename: a.filename ?? 'photo',
  }))
}

function toTask(rec: { id: string; fields: TaskFields }): Task {
  const f = rec.fields
  return {
    id: rec.id,
    title: f.Name ?? '',
    summary: f.Summary ?? '',
    brief: f.Brief ?? '',
    doneCriteria: f['Done criteria'] ?? '',
    contextLinks: parseContextLinks(f['Context links'] ?? ''),
    skills: f.Skills ?? [],
    effort: f.Effort ?? '',
    status: (f.Status ?? 'Open') as TaskStatus,
    floor: f.Floor ?? '',
    mapPoint: parseMapPoint(f['Map point']),
    claimantName: f['Claimant name'] ?? '',
    claimantEmail: f['Claimant email'] ?? '',
    claimedAt: f['Claimed at'] ?? null,
    nudgedAt: f['Nudged at'] ?? null,
    completedAt: f['Completed at'] ?? null,
    completionNote: f['Completion note'] ?? '',
    hasProofPhoto: (f['Proof photo']?.length ?? 0) > 0,
    refPhotos: parsePhotos(f['Reference photos']),
    discordMessageId: f['Discord message id'] ?? '',
  }
}

export async function listTasks(): Promise<Task[]> {
  const records = await getRecords<TaskFields>(Tables.Tasks, {
    maxRecords: 500,
  })
  return records.map(toTask)
}

export async function getTask(id: string): Promise<Task | null> {
  const rec = await getRecord<TaskFields>(Tables.Tasks, id)
  return rec ? toTask(rec) : null
}

// Writes accept a loose record so callers can pass `null` to clear a field
// (e.g. resetting claimant details on release), which Airtable requires.
export async function createTask(
  fields: Record<string, unknown>
): Promise<string> {
  const rec = await createRecord<TaskFields>(
    Tables.Tasks,
    fields as Partial<TaskFields>,
    {
      typecast: true,
    }
  )
  return rec.id
}

export async function updateTask(
  id: string,
  fields: Record<string, unknown>
): Promise<Task> {
  const rec = await updateRecord<TaskFields>(
    Tables.Tasks,
    id,
    fields as Partial<TaskFields>,
    {
      typecast: true,
    }
  )
  return toTask(rec)
}

export async function deleteTask(id: string): Promise<boolean> {
  return deleteRecord(Tables.Tasks, id)
}

// --- activity log -----------------------------------------------------------

interface TaskClaimFields {
  Name?: string
  Task?: string[]
  'Claimant name'?: string
  'Claimant email'?: string
  Type?: TaskEventType
  At?: string
  Note?: string
}

const EVENT_VERB: Record<TaskEventType, string> = {
  Claimed: 'claimed',
  Completed: 'completed',
  Released: 'released',
  'Auto-released': 'was auto-released from',
  Approved: 'approved',
}

export async function logTaskEvent(opts: {
  taskId: string
  taskTitle: string
  name: string
  email?: string
  type: TaskEventType
  note?: string
}): Promise<void> {
  await createRecord<TaskClaimFields>(
    Tables.TaskClaims,
    {
      Name: `${opts.name || opts.email} ${EVENT_VERB[opts.type]}: ${opts.taskTitle}`,
      Task: [opts.taskId],
      'Claimant name': opts.name,
      ...(opts.email ? { 'Claimant email': opts.email } : {}),
      Type: opts.type,
      At: new Date().toISOString(),
      ...(opts.note ? { Note: opts.note } : {}),
    },
    { typecast: true }
  )
}

export interface TaskEvent {
  name: string
  email: string
  type: TaskEventType
  at: string
  summary: string
}

export async function listRecentTaskEvents(
  hours: number
): Promise<TaskEvent[]> {
  const since = Date.now() - hours * 3600_000
  const records = await getRecords<TaskClaimFields>(Tables.TaskClaims, {
    sort: [{ field: 'At', direction: 'desc' }],
    maxRecords: 200,
  })
  const events: TaskEvent[] = []
  for (const rec of records) {
    const at = rec.fields.At ? Date.parse(rec.fields.At) : 0
    if (at < since) break
    events.push({
      name: rec.fields['Claimant name'] ?? '',
      email: rec.fields['Claimant email'] ?? '',
      type: rec.fields.Type ?? 'Claimed',
      at: rec.fields.At ?? '',
      summary: rec.fields.Name ?? '',
    })
  }
  return events
}

// --- attachments ------------------------------------------------------------

/**
 * Uploads an image to ImgBB and returns a hosted URL, matching how the rest of
 * the app writes Airtable attachment fields (upload to ImgBB, store the URL).
 * Returns null if IMGBB_API_KEY is unset or the upload fails.
 */
export async function uploadTaskImage(base64: string): Promise<string | null> {
  const key = env.IMGBB_API_KEY
  if (!key) return null
  try {
    const body = new URLSearchParams({ image: base64 })
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.data?.url ?? null
  } catch {
    return null
  }
}

export function airtableTaskUrl(taskId: string): string {
  return `https://airtable.com/${env.AIRTABLE_BASE_ID}/${Tables.Tasks}/${taskId}`
}
