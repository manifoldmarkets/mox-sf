import { Metadata } from 'next'
import { getPeople } from './people'
import PeopleContentWrapper from './PeopleContentWrapper'

export const metadata: Metadata = {
  title: 'People | Mox',
}

export async function PeopleContent() {
  const people = await getPeople()
  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name))

  // Separate people by tier
  const staff = sortedPeople.filter((person) => person.tier === 'Staff')
  const privateOffices = sortedPeople.filter((person) => person.tier === 'Private Office')
  const members = sortedPeople.filter((person) => person.tier !== 'Staff' && person.tier !== 'Private Office')

  return (
    <PeopleContentWrapper
      members={members}
      privateOffices={privateOffices}
      staff={staff}
    />
  )
}

export default async function PeoplePage() {
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
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white font-display mb-2">
            Humans of Mox
          </h2>
          <p className="text-gray-300 text-sm">The community that makes Mox special</p>
        </div>
        <PeopleContent />
      </div>

      {/*
      {otherPeople.length > 0 && (
        <div className="mb-8">
          {renderPeopleList(otherPeople)}
        </div>
      )}

      {seldonPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-display text-center font-semibold mb-4">
            Seldon Accelerator
          </h2>
          {renderPeopleList(seldonPeople)}
        </div>
      )}

      {pibbssPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-display text-center font-semibold mb-4">
            PIBBSS
          </h2>
          {renderPeopleList(pibbssPeople)}
        </div>
      )}

      {flfPeople.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-display text-center font-semibold mb-4">
            FLF Fellowship
          </h2>
          {renderPeopleList(flfPeople)}
        </div>
      )}
      */}
    </div>
  )
}
