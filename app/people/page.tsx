import { Metadata } from 'next'
import { formatUrl, getPeople, Person } from './people'
import PeopleListClient from './PeopleListClient'

export const metadata: Metadata = {
  title: 'People | Mox',
}

export default async function PeoplePage() {
  const people = await getPeople()

  // Sort people by name
  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))

  /*
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
  */

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center font-playfair">
        Humans at Mox
      </h1>

      <PeopleListClient people={sortedPeople} />

      <div className="mt-6 text-center">
        <a
          href="https://billing.stripe.com/p/login/5kAbIOdVF0Oa1vq6oo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-amber-800 hover:text-amber-900 underline decoration-dotted underline-offset-2"
        >
          Manage your membership
        </a>
      </div>

      {/*
      {otherPeople.length > 0 && (
        <div className="mb-8">
          {renderPeopleList(otherPeople)}
        </div>
      )}

      {seldonPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-playfair text-center font-semibold mb-4">
            Seldon Accelerator
          </h2>
          {renderPeopleList(seldonPeople)}
        </div>
      )}

      {pibbssPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-playfair text-center font-semibold mb-4">
            PIBBSS
          </h2>
          {renderPeopleList(pibbssPeople)}
        </div>
      )}

      {flfPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-playfair text-center font-semibold mb-4">
            FLF Fellowship
          </h2>
          {renderPeopleList(flfPeople)}
        </div>
      )}
      */}
    </div>
  )
}
