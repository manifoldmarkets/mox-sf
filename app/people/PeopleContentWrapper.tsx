'use client'
import { useState } from 'react'
import { Person } from './people'
import PeopleListClient from './PeopleListClient'

export default function PeopleContentWrapper({
  members,
  privateOffices,
  staff,
}: {
  members: Person[]
  privateOffices: Person[]
  staff: Person[]
}) {
  const [showFaces, setShowFaces] = useState(false)

  // Group private offices by organization ID (not name, so stealth companies stay separate)
  const orgGroups = new Map<string, { name: string; people: Person[] }>()
  privateOffices.forEach((person) => {
    const orgId = person.org && person.org.length > 0 ? person.org[0] : 'Independent'
    const orgName = person.orgNames && person.orgNames.length > 0 ? person.orgNames[0] : 'Independent'
    if (!orgGroups.has(orgId)) {
      orgGroups.set(orgId, { name: orgName, people: [] })
    }
    orgGroups.get(orgId)!.people.push(person)
  })

  return (
    <>
      {/* Global toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowFaces(!showFaces)}
          className="flex items-center gap-3 cursor-pointer text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
          role="switch"
          aria-checked={showFaces}
        >
          <span className="text-sm font-semibold">Show faces</span>
          <div className={`relative inline-flex h-6 w-11 items-center transition-colors ${showFaces ? 'bg-secondary-600 dark:bg-secondary-700' : 'bg-secondary-300 dark:bg-primary-700'}`}>
            <span className={`inline-block h-4 w-4 transform bg-white transition-transform ${showFaces ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </button>
      </div>

      {members.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-brand dark:text-white font-display mb-4 text-center">
            Members
          </h3>
          <PeopleListClient people={members} showFaces={showFaces} />
        </div>
      )}

      {privateOffices.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-brand dark:text-white font-display mb-4 text-center">
            Private Offices
          </h3>
          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {Array.from(orgGroups.entries())
              .sort(([, a], [, b]) => {
                // Sort stealth orgs to the bottom
                const aStealth = a.name === '<stealth>'
                const bStealth = b.name === '<stealth>'
                if (aStealth && !bStealth) return 1
                if (!aStealth && bStealth) return -1
                // Otherwise sort alphabetically
                return a.name.localeCompare(b.name)
              })
              .map(([orgId, { name, people }]) => (
                <div key={orgId} className="bg-background-surface dark:bg-primary-950 border-2 border-secondary-600 dark:border-primary-700 p-4">
                  <h4 className="text-sm font-bold text-brand dark:text-brand-dark-mode uppercase font-sans tracking-wide text-center mb-3">
                    {name}
                  </h4>
                  <PeopleListClient people={people} showFaces={showFaces} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {staff.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-brand dark:text-white font-display mb-4 text-center">
            Staff
          </h3>
          <PeopleListClient people={staff} showFaces={showFaces} />
        </div>
      )}
    </>
  )
}
