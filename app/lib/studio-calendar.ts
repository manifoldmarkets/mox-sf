import { sealData, unsealData } from 'iron-session'
import { env } from './env'

export const STUDIO_CALENDAR_ID =
  'c_acc9eff7dc86650092fc61257917d3ae04511f0268ac5c6744008fecc8347476@group.calendar.google.com'
export const STUDIO_OWNER_EMAIL = 'carolina@moxsf.com'
export const STUDIO_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const TABLE = 'Studio Calendar Connection'
type Connection = { email: string; refreshToken: string }
type RecordRow = { id: string; fields: { Credential?: string } }

function storageUrl() {
  return `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE)}`
}

function storageHeaders() {
  return {
    Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function connectionRow(): Promise<RecordRow | undefined> {
  const response = await fetch(
    `${storageUrl()}?filterByFormula=${encodeURIComponent("{Name}='studio'")}&maxRecords=2`,
    {
      headers: storageHeaders(),
      cache: 'no-store',
    }
  )
  if (!response.ok)
    throw new Error(
      'Calendar credential storage is unavailable. Create the Studio Calendar Connection table with Name and Credential text fields in the Mox Airtable base.'
    )
  const { records } = (await response.json()) as { records: RecordRow[] }
  if (records.length > 1)
    throw new Error(
      'Duplicate studio connections; ask an administrator to resolve them.'
    )
  return records[0]
}

// Checked before consent, so setup failures never strand a Google credential.
export async function checkStudioStorage() {
  try {
    await connectionRow()
    return
  } catch (originalError) {
    // Only the owner's authenticated, same-origin setup POST calls this.
    // Never create or alter schema from member booking requests.
    const url = `https://api.airtable.com/v0/meta/bases/${env.AIRTABLE_BASE_ID}/tables`
    const schema = await fetch(url, {
      headers: storageHeaders(),
      cache: 'no-store',
    })
    if (!schema.ok) throw originalError
    const { tables } = (await schema.json()) as { tables: { name: string }[] }
    if (tables.some((table) => table.name === TABLE)) throw originalError
    const created = await fetch(url, {
      method: 'POST',
      headers: storageHeaders(),
      body: JSON.stringify({
        name: TABLE,
        fields: [
          { name: 'Name', type: 'singleLineText' },
          { name: 'Credential', type: 'multilineText' },
        ],
      }),
    })
    if (!created.ok) throw originalError
    await connectionRow()
  }
}

export async function saveStudioConnection(connection: Connection) {
  if (connection.email !== STUDIO_OWNER_EMAIL || !connection.refreshToken)
    throw new Error('Invalid calendar owner')
  const row = await connectionRow()
  const Credential = await sealData(connection, {
    password: env.SESSION_SECRET,
    ttl: 0,
  })
  const response = await fetch(
    row ? `${storageUrl()}/${row.id}` : storageUrl(),
    {
      method: row ? 'PATCH' : 'POST',
      headers: storageHeaders(),
      body: JSON.stringify({ fields: { Name: 'studio', Credential } }),
    }
  )
  if (!response.ok) throw new Error('Could not save the calendar connection')
}

export async function getStudioAccessToken() {
  const row = await connectionRow()
  if (!row?.fields.Credential)
    throw new Error('Studio calendar is not connected')
  const connection = await unsealData<Connection>(row.fields.Credential, {
    password: env.SESSION_SECRET,
    ttl: 0,
  })
  if (connection.email !== STUDIO_OWNER_EMAIL || !connection.refreshToken)
    throw new Error('Reconnect the studio calendar')
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.TASKS_GOOGLE_CLIENT_ID,
      client_secret: env.TASKS_GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: connection.refreshToken,
    }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Reconnect the studio calendar')
  const token = (await response.json()) as { access_token?: string }
  if (!token.access_token)
    throw new Error('Could not connect to Google Calendar')
  return token.access_token
}
