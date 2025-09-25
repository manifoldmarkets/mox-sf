import { Metadata } from 'next'
import { formatUrl, getPeople, Person } from './people'

export const metadata: Metadata = {
  title: 'People | Mox',
}

export default async function PeoplePage() {
  const people = await getPeople()

  // Sort people by name
  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))

  // Separate people into categories
  const SELDON_PROGRAM_ID = 'recw9GcgF3DwVsxO1'
  const PIBBSS_PROGRAM_ID = 'recbTATvXcYoaZNaf'
  const FLF_PROGRAM_ID = 'recfHeJ6J35XTpFY0'

  const PROGRAMS = [SELDON_PROGRAM_ID, PIBBSS_PROGRAM_ID, FLF_PROGRAM_ID]
  const seldonPeople = sortedPeople.filter((person) =>
    person.programIds?.includes(SELDON_PROGRAM_ID)
  )
  const pibbssPeople = sortedPeople.filter((person) =>
    person.programIds?.includes(PIBBSS_PROGRAM_ID)
  )
  const flfPeople = sortedPeople.filter((person) =>
    person.programIds?.includes(FLF_PROGRAM_ID)
  )
  const otherPeople = sortedPeople.filter(
    (person) =>
      !PROGRAMS.some((programId) => person.programIds?.includes(programId))
  )

  const renderPeopleList = (people: Person[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
      {people.map((person) => (
        <div key={person.id}>
          {person.website ? (
            <a
              href={formatUrl(person.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-900 hover:text-amber-900 flex items-center gap-2 group hover:underline"
            >
              <span className="truncate whitespace-nowrap overflow-hidden block max-w-xs">
                {person.name}
              </span>
            </a>
          ) : (
            <span className="truncate whitespace-nowrap overflow-hidden block max-w-xs">
              {person.name}
            </span>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center">
        Humans at Mox
      </h1>

      {otherPeople.length > 0 && (
        <div className="mb-8">
          {/* <h2 className="text-2xl font-semibold mb-4">Other Members</h2> */}
          {renderPeopleList(otherPeople)}
        </div>
      )}

      {seldonPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-center mb-4">
            Seldon Accelerator
          </h2>
          {renderPeopleList(seldonPeople)}
        </div>
      )}

      {pibbssPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-center mb-4">
            PIBBSS
          </h2>
          {renderPeopleList(pibbssPeople)}
        </div>
      )}

      {flfPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-center mb-4">
            FLF Fellowship
          </h2>
          {renderPeopleList(flfPeople)}
        </div>
      )}
    </div>
  )
}
