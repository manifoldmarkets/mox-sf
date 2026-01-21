import Image from 'next/image'
import Link from 'next/link'
import {
  formatUrl,
  getPeople,
  Person,
  hasText,
  filterPeople,
  sortPeopleByCompleteness,
} from '../people'

function PolaroidCard({ person }: { person: Person }) {
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

  // Random slight rotation for polaroid effect
  const rotation = Math.floor(Math.random() * 7) - 3 // -3 to 3 degrees
  // Random tape rotation
  const tapeRotation = Math.floor(Math.random() * 7) - 3 // -3 to 3 degrees

  // Cards without much text get less space below
  const hasLittleText = !hasText(person)

  return (
    <div
      className="bg-white p-3 pb-4 shadow-lg hover:shadow-2xl transition-shadow duration-300 w-56"
      style={{
        transform: `rotate(${rotation}deg)`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 40px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Photo area */}
      <div className="w-full aspect-square bg-gray-100 relative">
        {/* Photo container with overflow hidden */}
        <div className="absolute inset-0 overflow-hidden">
          {url ? (
            <Image
              src={url}
              alt={person.name}
              width={width}
              height={height}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-4xl font-bold text-gray-400">
              {initials}
            </div>
          )}
        </div>

        {/* Paper tape with name - positioned at bottom of photo, outside overflow hidden */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-1/2 z-10 px-1">
          <div
            className="px-3 py-1 max-w-full"
            style={{
              transform: `rotate(${tapeRotation}deg)`,
              background: 'linear-gradient(180deg, rgba(255,255,240,0.95) 0%, rgba(255,253,235,0.9) 100%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
            }}
          >
            <p
              className="text-xl text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis font-bold"
              style={{ fontFamily: 'var(--font-handwriting)' }}
            >
              {person.website ? (
                <Link
                  href={formatUrl(person.website)}
                  target="_blank"
                  className="underline decoration-black/40 hover:decoration-current transition-colors"
                >
                  {person.name}
                </Link>
              ) : (
                person.name
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Caption area with "is into X and Y" - smaller when no text */}
      <div className={`px-1 text-center ${hasLittleText ? 'mt-3' : 'mt-5 min-h-[1.5rem]'}`}>
        {(person.workThing || person.funThing) && (
          <p
            className="text-base text-gray-700 leading-tight font-sans"
          >
            <span className="text-gray-400">is into </span>
            {person.workThing && (
              person.workThingUrl ? (
                <Link
                  href={formatUrl(person.workThingUrl)}
                  target="_blank"
                  className="font-bold text-teal-600 underline decoration-teal-600/40 hover:decoration-current"
                >
                  {person.workThing}
                </Link>
              ) : (
                <span className="font-bold text-teal-600">{person.workThing}</span>
              )
            )}
            {person.workThing && person.funThing && <span className="text-gray-400"> and </span>}
            {person.funThing && (
              person.funThingUrl ? (
                <Link
                  href={formatUrl(person.funThingUrl)}
                  target="_blank"
                  className="font-bold text-orange-600 underline decoration-orange-600/40 hover:decoration-current"
                >
                  {person.funThing}
                </Link>
              ) : (
                <span className="font-bold text-orange-600">{person.funThing}</span>
              )
            )}
          </p>
        )}
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

  const filteredPeople = sortPeopleByCompleteness(filterPeople(people, filter))

  return (
    <div className="py-12 px-6 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 relative">
      <Link
        href="/portal/login"
        className="fixed top-4 right-4 text-md px-3 pt-2 pb-1 bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-full shadow-md hover:shadow-lg transition-all z-10 font-sans font-bold"
      >
        edit your info!
      </Link>
      <div className="flex flex-wrap justify-center items-center gap-6">
        {filteredPeople.map((person) => (
          <PolaroidCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  )
}
