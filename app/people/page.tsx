import { Metadata } from 'next'
import { formatUrl, getPeople, Person } from './people'
import PeopleListClient from './PeopleListClient'

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
    <>
      {members.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-brand dark:text-brand-dark-mode font-playfair mb-4 text-center">
            General Membership
          </h3>
          <PeopleListClient people={members} />
        </div>
      )}

      {privateOffices.length > 0 && (() => {
        // Group private offices by organization
        const orgGroups = new Map<string, Person[]>()
        privateOffices.forEach((person) => {
          const orgName = person.orgNames && person.orgNames.length > 0 ? person.orgNames[0] : 'Independent'
          if (!orgGroups.has(orgName)) {
            orgGroups.set(orgName, [])
          }
          orgGroups.get(orgName)!.push(person)
        })

        return (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-brand dark:text-brand-dark-mode font-playfair mb-4 text-center">
              Private Offices
            </h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
              {Array.from(orgGroups.entries()).map(([orgName, people]) => (
                <div key={orgName} className="bg-background-subtle dark:bg-background-subtle-dark border-2 border-border-medium dark:border-border-medium-dark rounded-lg p-2 w-full sm:w-auto">
                  <h4 className="text-xs font-bold text-brand dark:text-brand-dark-mode uppercase font-sans tracking-wide text-center mb-2">
                    {orgName}
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {people.map((person) => {
                      const baseClasses = 'border-2 px-3 py-1 rounded-full bg-background-surface dark:bg-background-surface-dark border-border-medium dark:border-border-medium-dark'

                      if (person.website) {
                        return (
                          <a
                            key={person.id}
                            href={formatUrl(person.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${baseClasses} cursor-pointer transition-colors duration-200`}
                          >
                            <p className="font-semibold text-text-primary dark:text-text-primary-dark text-sm whitespace-nowrap">
                              {person.name}
                            </p>
                          </a>
                        )
                      } else {
                        return (
                          <div key={person.id} className={baseClasses}>
                            <p className="font-semibold text-text-primary dark:text-text-primary-dark text-sm whitespace-nowrap">
                              {person.name}
                            </p>
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {staff.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-brand dark:text-brand-dark-mode font-playfair mb-4 text-center">
            Staff
          </h3>
          <PeopleListClient people={staff} />
        </div>
      )}
    </>
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
    <div className="min-h-screen bg-background-page dark:bg-background-page-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-brand dark:text-brand-dark-mode font-playfair mb-2">
            Humans of Mox
          </h2>
          <p className="text-text-tertiary dark:text-text-tertiary-dark text-sm">The community that makes Mox special</p>
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
