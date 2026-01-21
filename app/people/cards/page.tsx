import Image from 'next/image'
import Link from 'next/link'
import { formatUrl, getPeople, Person } from '../people'

function Card({ person }: { person: Person }) {
  const { url, width, height } = person.photo?.[0]?.thumbnails?.large ?? {
    url: null,
    width: 300,
    height: 300,
  }

  // Get initials from name (first letter of first and last name)
  const initials = person.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row w-full sm:w-[360px] lg:w-[400px] h-auto sm:h-36">
      {/* Photo on the left */}
      <div className="w-full sm:w-32 md:w-36 h-36 flex-shrink-0">
        {url ? (
          <Image
            src={url}
            alt={person.name}
            width={width}
            height={height}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary-100 dark:bg-gray-700 text-4xl font-bold text-secondary-600 dark:text-gray-300">
            {initials}
          </div>
        )}
      </div>

      {/* Info on the right */}
      <div className="p-4 flex flex-col justify-center">
        <p className="text-lg">
          {person.website ? (
            <Link
              className="font-bold dark:text-white underline decoration-black/40 dark:decoration-white/60 hover:decoration-current"
              href={formatUrl(person.website)}
              target="_blank"
            >
              {person.name}
            </Link>
          ) : (
            <span className="font-bold dark:text-white">{person.name}</span>
          )}
          {(person.workThing || person.funThing) && (
            <>
              <span className="text-gray-500 dark:text-gray-400">{' '}is into{' '}</span>
              {person.workThing && (
                person.workThingUrl ? (
                  <Link href={formatUrl(person.workThingUrl)} target="_blank" className="font-bold text-teal-600 dark:text-teal-400 underline decoration-teal-600/40 dark:decoration-teal-400/40 hover:decoration-current">
                    {person.workThing}
                  </Link>
                ) : (
                  <span className="font-bold text-teal-600 dark:text-teal-400">{person.workThing}</span>
                )
              )}
              {person.workThing && person.funThing && <span className="text-gray-500 dark:text-gray-400">{' '}and{' '}</span>}
              {person.funThing && (
                person.funThingUrl ? (
                  <Link href={formatUrl(person.funThingUrl)} target="_blank" className="font-bold text-orange-600 dark:text-orange-400 underline decoration-orange-600/40 dark:decoration-orange-400/40 hover:decoration-current">
                    {person.funThing}
                  </Link>
                ) : (
                  <span className="font-bold text-orange-600 dark:text-orange-400">{person.funThing}</span>
                )
              )}
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const people = await getPeople()
  const params = await searchParams
  const filter = params.filter

  let filteredPeople = people
  if (filter === 'with-info') {
    filteredPeople = people.filter((p) => p.workThing || p.funThing)
  } else if (filter === 'with-photo') {
    filteredPeople = people.filter((p) => p.photo?.[0]?.thumbnails?.large)
  } else if (filter === 'complete') {
    filteredPeople = people.filter(
      (p) => (p.workThing || p.funThing) && p.photo?.[0]?.thumbnails?.large
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 py-8 px-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      {filteredPeople.map((person) => (
        <Card key={person.id} person={person} />
      ))}
    </div>
  )
}
