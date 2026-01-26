import { findRecords, Tables } from '../lib/airtable'

export type Person = {
  id: string
  name: string
  tier: string | null
  org: string[]
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

export type Org = {
  id: string
  name: string
  stealth: boolean
  rooms: string[]
}

export type Program = {
  id: string
  name: string
  rooms: string[]
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

export async function getPeople(): Promise<Person[]> {
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
    return {
      id: record.id,
      name: record.fields.Name || '',
      tier: record.fields.Tier || null,
      org: record.fields.Org || [],
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

// Helper functions for filtering and sorting people

export function hasPhoto(person: Person): boolean {
  return !!person.photo?.[0]?.thumbnails?.large
}

export function hasText(person: Person): boolean {
  return !!(person.workThing || person.funThing)
}

// Content level: 'full' = has photo/text, 'org' = has org only, 'minimal' = name only
export function getContentLevel(
  person: Person
): 'full' | 'org' | 'minimal' {
  const hasPhotoOrText = hasPhoto(person) || hasText(person)
  if (hasPhotoOrText) return 'full'
  if (person.org && person.org.length > 0) return 'org'
  return 'minimal'
}

export function filterPeople(
  people: Person[],
  filter?: string
): Person[] {
  if (filter === 'with-info') {
    return people.filter(hasText)
  } else if (filter === 'with-photo') {
    return people.filter(hasPhoto)
  } else if (filter === 'complete') {
    return people.filter((p) => hasText(p) && hasPhoto(p))
  }
  return people
}

export function sortPeopleByCompleteness(people: Person[]): Person[] {
  return [...people].sort((a, b) => {
    const aHasPhoto = hasPhoto(a)
    const bHasPhoto = hasPhoto(b)
    const aHasText = hasText(a)
    const bHasText = hasText(b)
    const aHasOrg = a.org && a.org.length > 0
    const bHasOrg = b.org && b.org.length > 0

    // Score: 3 = both photo+text, 2 = photo or text, 1 = org only, 0 = nothing
    const aScore =
      aHasPhoto && aHasText ? 3 : aHasPhoto || aHasText ? 2 : aHasOrg ? 1 : 0
    const bScore =
      bHasPhoto && bHasText ? 3 : bHasPhoto || bHasText ? 2 : bHasOrg ? 1 : 0

    if (aScore !== bScore) return bScore - aScore // Higher score first
    return a.name.localeCompare(b.name) // Then alphabetically
  })
}

// Fetch all orgs with their room numbers
interface OrgFields {
  Name?: string
  Stealth?: boolean
  'Room #'?: string[]
}

export async function getOrgs(): Promise<Map<string, Org>> {
  const records = await findRecords<OrgFields>(Tables.Orgs, '', {
    fields: ['Name', 'Stealth', 'Room #'],
  })

  const orgsMap = new Map<string, Org>()
  for (const record of records) {
    orgsMap.set(record.id, {
      id: record.id,
      name: record.fields.Name || '',
      stealth: record.fields.Stealth || false,
      rooms: record.fields['Room #'] || [],
    })
  }
  return orgsMap
}

// Fetch all programs with their room numbers
interface ProgramFields {
  Name?: string
  'Room #'?: string[]
}

export async function getPrograms(): Promise<Map<string, Program>> {
  const records = await findRecords<ProgramFields>(Tables.Programs, '', {
    fields: ['Name', 'Room #'],
  })

  const programsMap = new Map<string, Program>()
  for (const record of records) {
    programsMap.set(record.id, {
      id: record.id,
      name: record.fields.Name || '',
      rooms: record.fields['Room #'] || [],
    })
  }
  return programsMap
}

