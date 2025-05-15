import { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'People | Mox',
}

type Person = {
  id: string
  name: string
  website: string
  interests: string[]
  aiBio: string | null
}

async function getPeople(): Promise<Person[]> {
  // Restrict down to fields we need.
  // WARNING: if we fetch all fields, sensitive things like email may be exposed.
  // Unfortunately, Airtable doesn't support per-field control on access keys.
  const FIELDS = ['Name', 'Website', 'Interests', 'AI bio']
  // Hit Airtable directly from server component, rather than proxying through API route
  const res = await fetch(
    'https://api.airtable.com/v0/appkHZ2UvU6SouT5y/People?maxRecords=100&view=viw9V2tzcnqvRXcV3&' +
      FIELDS.map((field) => `fields%5B%5D=${encodeURIComponent(field)}`).join(
        '&'
      ),
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      next: { revalidate: 60 },
    }
  )

  if (!res.ok) throw new Error('Failed to fetch people')
  const data = await res.json()

  // Parse the data into the Person type
  const people = data.records.map((record: any) => ({
    id: record.id,
    name: record.fields.Name,
    website: record.fields.Website,
    interests: record.fields.Interests,
    aiBio: record.fields['AI bio'].value || null,
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

function formatUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export default async function PeoplePage() {
  const people = await getPeople()

  // Sort people by name
  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Humans at Mox</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
        {sortedPeople.map((person) => (
          <div key={person.id}>
            {person.website ? (
              <a
                href={formatUrl(person.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-900 hover:text-amber-900 flex items-center gap-2 group hover:underline"
              >
                <span>{person.name}</span>
              </a>
            ) : (
              <span>{person.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
