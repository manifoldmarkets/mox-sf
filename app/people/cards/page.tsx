import Image from 'next/image'
import Link from 'next/link'
import { formatUrl, getPeople, Person } from '../people'

function Card({ person }: { person: Person }) {
  const { url, width, height } = person.photo[0]?.thumbnails.large ?? {
    url: null,
    width: 300,
    height: 300,
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row w-full sm:w-[400px] lg:w-[450px] h-auto sm:h-40">
      {/* Photo on the left */}
      <div className="w-full sm:w-32 md:w-40 h-40 flex-shrink-0">
        {url ? (
          <Image
            src={url}
            alt={person.name}
            width={width}
            height={height}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary-100 dark:bg-amber-900 text-6xl font-bold text-secondary-600 dark:text-amber-700">
            {person.name.split(' ').map(n => n.charAt(0)).join('')}
          </div>
        )}
      </div>

      {/* Info on the right */}
      <div className="p-4 flex flex-col justify-center">
        <h3 className="font-bold text-lg mb-2">
          {person.website ? (
            <Link
              className="hover:underline inline-flex items-center gap-1"
              href={formatUrl(person.website)}
              target="_blank"
            >
              {person.name}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          ) : (
            <span>{person.name}</span>
          )}
        </h3>

        {/* Work and Fun things */}
        {(person.workThing || person.funThing) && (
          <p className="text-gray-700 text-sm leading-relaxed font-sans">
            Into{' '}
            {person.workThing && (
              person.workThingUrl ? (
                <Link
                  href={formatUrl(person.workThingUrl)}
                  target="_blank"
                  className="inline-flex items-center gap-1 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded-lg font-bold text-blue-900 text-sm align-middle cursor-pointer transition-colors"
                >
                  {person.workThing}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-block bg-blue-100 px-2 py-0.5 rounded-lg font-bold text-blue-900 text-sm align-middle">
                  {person.workThing}
                </span>
              )
            )}
            {person.workThing && person.funThing && ' and '}
            {person.funThing && (
              person.funThingUrl ? (
                <Link
                  href={formatUrl(person.funThingUrl)}
                  target="_blank"
                  className="inline-flex items-center gap-1 bg-yellow-100 hover:bg-yellow-200 px-2 py-0.5 rounded-lg font-bold text-yellow-900 text-sm align-middle cursor-pointer transition-colors"
                >
                  {person.funThing}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-block bg-yellow-100 px-2 py-0.5 rounded-lg font-bold text-yellow-900 text-sm align-middle">
                  {person.funThing}
                </span>
              )
            )}
          </p>
        )}
      </div>
    </div>
  )
}

export default async function CardsPage() {
  const people = await getPeople()

  // Create a gallery of cards, one for each person
  return (
    <div className="flex flex-wrap justify-center gap-4 my-4 md:my-8 px-4">
      {people.map((person) => (
        <Card key={person.id} person={person} />
      ))}
    </div>
  )
}
