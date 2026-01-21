import { getRecords, findRecords, Tables } from '../lib/airtable'

export type Person = {
  id: string
  name: string
  tier: string | null
  org: string[]
  orgNames: string[]
  program: string[]
  status: string | null
  website: string
  photo: any[] | null
  showInDirectory: boolean
  workThing: string | null
  workThingUrl: string | null
  funThing: string | null
  funThingUrl: string | null
}

// Restrict down to fields we need.
// WARNING: if we fetch all fields, sensitive things like email may be exposed.
// Unfortunately, Airtable doesn't support per-field control on access keys.
const FIELDS = [
  'Name',
  'Tier',
  'Org',
  'Program',
  'Status',
  'Website',
  'Photo',
  'Show in directory',
  'Work thing',
  'Work thing URL',
  'Fun thing',
  'Fun thing URL',
]

interface OrgFields {
  Name?: string
  Status?: string
  Stealth?: boolean
}

interface PersonFields {
  Name?: string
  Tier?: string
  Org?: string[]
  Program?: string[]
  Status?: string
  Website?: string
  Photo?: any[]
  'Show in directory'?: boolean
  'Work thing'?: string
  'Work thing URL'?: string
  'Fun thing'?: string
  'Fun thing URL'?: string
}

async function getOrgNames(): Promise<Map<string, string>> {
  const orgMap = new Map<string, string>()

  try {
    const records = await findRecords<OrgFields>(Tables.Orgs, '{Status}!=""', {
      fields: ['Name', 'Stealth'],
    })

    for (const record of records) {
      if (record.id && record.fields.Name) {
        const isStealth = record.fields.Stealth === true
        const displayName = isStealth ? '<stealth>' : record.fields.Name
        orgMap.set(record.id, displayName)
      }
    }
  } catch (error) {
    console.error('Failed to fetch orgs, using empty map')
  }

  return orgMap
}

export async function getPeople(): Promise<Person[]> {
  // Fetch org names first
  const orgMap = await getOrgNames()

  const records = await findRecords<PersonFields>(
    Tables.People,
    'AND({Show in directory}=TRUE(), {Status}="Joined")',
    {
      fields: FIELDS,
      view: 'viw9V2tzcnqvRXcV3',
    }
  )

  // Parse the data into the Person type
  const people: Person[] = records.map((record) => {
    const orgIds = record.fields.Org || []
    const orgNames = orgIds.map((id: string) => orgMap.get(id) || id)

    return {
      id: record.id,
      name: record.fields.Name || '',
      tier: record.fields.Tier || null,
      org: orgIds,
      orgNames: orgNames,
      program: record.fields.Program || [],
      status: record.fields.Status || null,
      website: record.fields.Website || '',
      photo: record.fields.Photo || [],
      showInDirectory: true,
      workThing: record.fields['Work thing'] || null,
      workThingUrl: record.fields['Work thing URL'] || null,
      funThing: record.fields['Fun thing'] || null,
      funThingUrl: record.fields['Fun thing URL'] || null,
    }
  })

  return people
}

export function formatUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}
