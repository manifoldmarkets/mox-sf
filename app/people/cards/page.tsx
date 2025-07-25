import Image from 'next/image'
import Link from 'next/link'
import { formatUrl, getPeople, Person } from '../page'

function Card({ person }: { person: Person }) {
  const { url, width, height } = person.photo[0]?.thumbnails.large ?? {
    // url: 'https://placehold.co/300x300',
    width: 300,
    height: 300,
  }

  return (
    <div className="bg-white w-24 h-24 md:w-48 md:h-48 [perspective:600px] group">
      <div className="relative w-full h-full transition-transform duration-200 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Image
            src={url}
            alt={person.name}
            width={width}
            height={height}
            className="w-24 h-24 md:w-48 md:h-48 object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <h3 className="font-bold text-center px-2">
            <Link
              className="hover:underline"
              href={formatUrl(person.website)}
              target="_blank"
            >
              {person.name}
            </Link>
          </h3>
        </div>
      </div>
    </div>
  )
}

export default async function CardsPage() {
  const people = await getPeople()

  // Create a gallery of cards, one for each person
  return (
    <div className="flex flex-wrap justify-center my-4 md:my-8">
      {people
        .filter((person) => person.photo[0]?.thumbnails.large)
        .map((person) => (
          <Card key={person.id} person={person} />
        ))}
    </div>
  )
}
