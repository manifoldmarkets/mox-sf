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
  const [showFaces, setShowFaces] = useState(true)

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
        <label className="flex items-center gap-2 cursor-pointer text-text-secondary dark:text-text-secondary-dark">
          <input
            type="checkbox"
            checked={showFaces}
            onChange={(e) => setShowFaces(e.target.checked)}
            className="w-4 h-4 rounded border-secondary-600 dark:border-primary-700 text-secondary-600 focus:ring-secondary-500 cursor-pointer"
          />
          <span className="text-sm font-semibold">Show faces</span>
        </label>
      </div>

      {members.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-brand dark:text-white font-playfair mb-4 text-center">
            General Membership
          </h3>
          <PeopleListClient people={members} showFaces={showFaces} />
        </div>
      )}

      {privateOffices.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-brand dark:text-white font-playfair mb-4 text-center">
            Private Offices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div key={orgId} className="bg-background-surface dark:bg-primary-950 border-2 border-secondary-600 dark:border-primary-700 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-brand dark:text-brand-dark-mode uppercase font-sans tracking-wide text-center mb-3">
                    {name}
                  </h4>
                  <PeopleListClient people={people} showFaces={showFaces} />
                </div>
              ))}
          </div>
        </div>
      )}

      {staff.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-brand dark:text-white font-playfair mb-4 text-center">
            Staff
          </h3>
          <PeopleListClient people={staff} showFaces={showFaces} />
        </div>
      )}
    </>
  )
}
