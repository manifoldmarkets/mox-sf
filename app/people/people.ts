export type Person = {
  id: string
  name: string
  website: string
  interests: string[]
  orgIds: string[]
  programIds: string[]
  aiBio: string | null
  photo: any[] | null
}

// Restrict down to fields we need.
// WARNING: if we fetch all fields, sensitive things like email may be exposed.
// Unfortunately, Airtable doesn't support per-field control on access keys.
const FIELDS = [
  'Name',
  'Website',
  'Interests',
  'AI bio',
  'Org',
  'Program',
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
    const res = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People?view=viw9V2tzcnqvRXcV3&` +
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
  const people = allRecords.map((record: any) => {
    // Airtable checkboxes: true when checked, undefined when unchecked
    // Default to true (show in directory) unless explicitly false
    const showInDirectory = record.fields['Show in directory'];

    return {
      id: record.id,
      name: record.fields.Name,
      website: record.fields.Website,
      interests: record.fields.Interests,
      aiBio: record.fields['AI bio'].value || null,
      orgIds: record.fields.Org,
      programIds: record.fields.Program,
      photo: record.fields.Photo || [],
      showInDirectory: showInDirectory === false ? false : true,
    };
  })

  // Filter to only show people who opted into directory visibility
  const filteredPeople = people.filter((person) => person.showInDirectory)

  return filteredPeople
}

export function formatUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}
