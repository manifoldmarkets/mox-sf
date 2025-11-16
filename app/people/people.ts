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
]
// Hit Airtable directly from server component, rather than proxying through API route

const PAGES_TO_FETCH = 3 // Number of pages to fetch (100 records per page)

export async function getPeople(): Promise<Person[]> {
  let allRecords: any[] = []
  let offset: string | undefined

  // Fetch pages serially using the offset from previous response
  for (let i = 0; i < PAGES_TO_FETCH; i++) {
    const offsetParam = offset ? `&offset=${offset}` : ''
    // Filter by visibility and status on the backend
    // Only fetch records where Show in directory is true AND Status is 'Joined'
    const filterFormula = encodeURIComponent('AND({Show in directory}=TRUE(), {Status}="Joined")')
    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People?view=viw9V2tzcnqvRXcV3&` +
        `filterByFormula=${filterFormula}&` +
        FIELDS.map((field) => `fields%5B%5D=${encodeURIComponent(field)}`).join(
          '&'
        ) +
        offsetParam,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) throw new Error('Failed to fetch people')
    const data = await res.json()

    allRecords = [...allRecords, ...data.records]

    // Get offset for next page, or break if no more pages
    offset = data.offset
    if (!offset) break
  }

  // Parse the data into the Person type
  // Note: All records already have Show in directory=true due to backend filtering
  const people: Person[] = allRecords.map((record: any) => {
    return {
      id: record.id,
      name: record.fields.Name || '',
      tier: record.fields.Tier || null,
      org: record.fields.Org || [],
      program: record.fields.Program || [],
      status: record.fields.Status || null,
      website: record.fields.Website || '',
      photo: record.fields.Photo || [],
      showInDirectory: true, // Always true since we filter on the backend
    };
  })

  return people
}

export function formatUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}
