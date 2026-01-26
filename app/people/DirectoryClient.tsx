'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Person, formatUrl } from './people'

type DirectoryClientProps = {
  sections: {
    type: 'person-section' | 'grouped-section'
    title: string
    people?: Person[]
    groups?: {
      id: string
      name: string
      rooms?: string[]
      people: Person[]
    }[]
    affiliationType?: 'org' | 'both'
  }[]
  orgsLookup: Record<string, { name: string }>
  programsLookup: Record<string, { name: string }>
  memberCount: number
  filter?: string
  isHomepage?: boolean
}

export default function DirectoryClient({
  sections,
  orgsLookup,
  programsLookup,
  memberCount,
  filter,
  isHomepage,
}: DirectoryClientProps) {
  const [collapsed, setCollapsed] = useState(false)

  const getAffiliation = (
    person: Person,
    affiliationType?: 'org' | 'both'
  ): string | undefined => {
    if (!affiliationType) return undefined

    const orgNames = person.org
      .map((id) => orgsLookup[id]?.name)
      .filter(Boolean)

    if (affiliationType === 'org') {
      return orgNames.length > 0 ? orgNames.join(' · ') : undefined
    }

    // 'both' - include programs too
    const programNames = person.program
      .map((id) => programsLookup[id]?.name)
      .filter(Boolean)
    const all = [...orgNames, ...programNames]
    return all.length > 0 ? all.join(' · ') : undefined
  }

  const toggleButton = (
    <button onClick={() => setCollapsed(!collapsed)}>
      {collapsed ? 'show details' : 'collapse details'}
    </button>
  )

  return (
    <>
      {/* Title row with toggle */}
      <div className="directory-title-row">
        <h1>Humans of Mox</h1>
        <div className="directory-toggle">
          {toggleButton}
        </div>
      </div>
      {!isHomepage && (
        <p className="muted">
          {memberCount} members
          {filter && ` matching "${filter}"`}
        </p>
      )}

      {sections.map((section, idx) => {
        if (section.type === 'person-section' && section.people) {
          if (section.people.length === 0) return null
          const isFirstSection = idx === 0
          return (
            <div key={idx} className="directory-section">
              <h2 className="section-title">{section.title}</h2>
              {collapsed ? (
                <CollapsedList people={section.people} />
              ) : (
                <div className="directory-list">
                  {section.people.map((person) => (
                    <PersonEntry
                      key={person.id}
                      person={person}
                      affiliation={getAffiliation(person, section.affiliationType)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        }

        if (section.type === 'grouped-section' && section.groups) {
          if (section.groups.length === 0) return null
          return (
            <div key={idx} className="directory-section">
              <h2 className="section-title">{section.title}</h2>
              {section.groups.map((group) => {
                if (group.people.length === 0) return null
                const roomText =
                  group.rooms && group.rooms.length > 0
                    ? group.rooms.join(', ')
                    : null

                return (
                  <div
                    key={group.id}
                    className="directory-section program-section"
                  >
                    <div className="program-header">
                      <h3 className="program-title">{group.name}</h3>
                      {roomText && (
                        <span className="program-room">Room(s) {roomText}</span>
                      )}
                    </div>
                    {collapsed ? (
                      <CollapsedList people={group.people} />
                    ) : (
                      <div className="directory-list">
                        {group.people.map((person) => (
                          <PersonEntry key={person.id} person={person} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }

        return null
      })}
    </>
  )
}

function CollapsedList({ people }: { people: Person[] }) {
  return (
    <div className="collapsed-list">
      {people.map((person) => {
        if (person.website) {
          return (
            <Link
              key={person.id}
              href={formatUrl(person.website)}
              target="_blank"
              className="collapsed-name"
            >
              {person.name}
            </Link>
          )
        }
        return (
          <span key={person.id} className="collapsed-name">
            {person.name}
          </span>
        )
      })}
    </div>
  )
}

function PersonEntry({
  person,
  affiliation,
}: {
  person: Person
  affiliation?: string
}) {
  const { url } = person.photo?.[0]?.thumbnails?.large ?? { url: null }
  const hasContent = url || person.workThing || person.funThing

  // Get initials from name
  const initials = person.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')

  return (
    <div className={`person-entry ${!hasContent ? 'person-entry-compact' : ''}`}>
      <div className="person-photo">
        {url ? (
          <img
            src={url}
            alt={person.name}
            width={90}
            height={90}
            className="photo-img"
            loading="lazy"
          />
        ) : (
          <div className="photo-placeholder">{initials}</div>
        )}
      </div>
      <div className="person-info">
        {affiliation && (
          <div className="person-affiliation">{affiliation}</div>
        )}
        <div className="person-main">
          <span className="person-name">
            {person.website ? (
              <Link href={formatUrl(person.website)} target="_blank">
                {person.name}
              </Link>
            ) : (
              person.name
            )}
          </span>
          {(person.workThing || person.funThing) && (
            <>
              <span className="into-text"> is into </span>
              {person.workThing && (
                <>
                  {person.workThingUrl ? (
                    <Link
                      href={formatUrl(person.workThingUrl)}
                      target="_blank"
                      className="interest work"
                    >
                      {person.workThing}
                    </Link>
                  ) : (
                    <span className="interest work">{person.workThing}</span>
                  )}
                </>
              )}
              {person.workThing && person.funThing && (
                <span className="and-text"> and </span>
              )}
              {person.funThing && (
                <>
                  {person.funThingUrl ? (
                    <Link
                      href={formatUrl(person.funThingUrl)}
                      target="_blank"
                      className="interest fun"
                    >
                      {person.funThing}
                    </Link>
                  ) : (
                    <span className="interest fun">{person.funThing}</span>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
