'use server'
import { findRecords, getRecord, Tables } from '@/app/lib/airtable'

interface PersonFields {
  Name?: string
  Status?: string
}

export interface InviteEntry {
  name: string
  recordId: string
}

export async function getAirtableData(): Promise<InviteEntry[]> {
  try {
    // New formula: anyone invited or to invite
    const formula = `OR(Status="Invited",Status="To Invite",Status="Cancelled")`

    const records = await findRecords<PersonFields>(Tables.People, formula, {
      fields: ['Name'],
    })

    return records
      .filter((record) => !!record.fields.Name)
      .map((record) => ({
        name: record.fields.Name!,
        recordId: record.id,
      }))
  } catch (e) {
    console.error('Failed to fetch invite list:', e)
    return []
  }
}

/** Look up a person by Airtable record ID and return their info if they're invited. */
export async function getInviteByRecordId(
  recordId: string
): Promise<InviteEntry | null> {
  try {
    const record = await getRecord<PersonFields>(Tables.People, recordId)
    if (!record || !record.fields.Name) return null
    const status = record.fields.Status
    if (status !== 'Invited' && status !== 'To Invite' && status !== 'Cancelled')
      return null
    return { name: record.fields.Name, recordId: record.id }
  } catch (e) {
    console.error('Failed to fetch invite by record ID:', e)
    return null
  }
}
