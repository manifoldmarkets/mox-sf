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
      'https://api.airtable.com/v0/appkHZ2UvU6SouT5y/People?view=viw9V2tzcnqvRXcV3&' +
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
  const people = allRecords.map((record: any) => ({
    id: record.id,
    name: record.fields.Name,
    website: record.fields.Website,
    interests: record.fields.Interests,
    aiBio: record.fields['AI bio'].value || null,
    orgIds: record.fields.Org,
    programIds: record.fields.Program,
    photo: record.fields.Photo || [],
  }))

  // Exclude certain things from the display:
  const HIDDEN_NAMES = ['Non-member']
  const HIDDEN_IDS = ['reco3E5mPisBLozIZ']

  const filteredPeople = people.filter(
    (person) =>
      !HIDDEN_NAMES.includes(person.name) && !HIDDEN_IDS.includes(person.id)
  )

  return filteredPeople
}

export function formatUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export async function searchPerplexity(query: string): Promise<string> {
  console.log('api key', process.env.PERPLEXITY_API_KEY)

  // Set up the API endpoint and headers
  const url = 'https://api.perplexity.ai/chat/completions'
  const headers = {
    Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json',
  }

  // Define the request payload
  const payload = {
    model: 'sonar-pro',
    messages: [
      {
        role: 'user',
        content: query,
      },
    ],
  }

  // Make the API call
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  const content = data.choices[0].message.content

  // Print the AI's response
  console.log(content) // replace with console.log(data.choices[0].message.content) for just the content

  return content
}
