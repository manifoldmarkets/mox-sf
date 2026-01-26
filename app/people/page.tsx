import { Metadata } from 'next'
import Link from 'next/link'
import {
  formatUrl,
  getPeople,
  getOrgs,
  getPrograms,
  Person,
  filterPeople,
  sortPeopleByCompleteness,
} from './people'
import DirectoryClient from './DirectoryClient'
import './directory.css'

export const metadata: Metadata = {
  title: 'People | Mox',
}

// Export PeopleContent for use in homepage - uses directory layout
export async function PeopleContent() {
  // Fetch all data in parallel
  const [people, orgsMap, programsMap] = await Promise.all([
    getPeople(),
    getOrgs(),
    getPrograms(),
  ])

  const filteredPeople = people

  // Separate people by tier
  const staff = sortPeopleByCompleteness(
    filteredPeople.filter((person) => person.tier === 'Staff')
  )
  const privateOffices = sortPeopleByCompleteness(
    filteredPeople.filter((person) => person.tier === 'Private Office')
  )
  const members = sortPeopleByCompleteness(
    filteredPeople.filter(
      (person) => person.tier !== 'Staff' && person.tier !== 'Private Office'
    )
  )

  // Group private offices by organization (excluding stealth orgs)
  const officesByOrg = new Map<
    string,
    { name: string; rooms: string[]; people: Person[] }
  >()
  privateOffices.forEach((person) => {
    const orgId =
      person.org && person.org.length > 0 ? person.org[0] : 'independent'

    // Skip stealth orgs (check from orgs map)
    const org = orgsMap.get(orgId)
    if (org?.stealth) return

    const orgName = org?.name || 'Independent'
    const orgRooms = org?.rooms || []

    if (!officesByOrg.has(orgId)) {
      officesByOrg.set(orgId, { name: orgName, rooms: orgRooms, people: [] })
    }
    officesByOrg.get(orgId)!.people.push(person)
  })

  // Sort orgs by number of people (descending), then alphabetically
  const sortedOrgs = Array.from(officesByOrg.entries()).sort(([, a], [, b]) => {
    if (b.people.length !== a.people.length) {
      return b.people.length - a.people.length
    }
    return a.name.localeCompare(b.name)
  })

  // Group members by program (for those who have programs)
  const programGroups = new Map<
    string,
    { name: string; rooms: string[]; people: Person[] }
  >()
  const membersWithoutProgram: Person[] = []

  members.forEach((person) => {
    if (person.program && person.program.length > 0) {
      const programId = person.program[0]
      const program = programsMap.get(programId)
      const programName = program?.name || 'Program'
      const programRooms = program?.rooms || []

      if (!programGroups.has(programId)) {
        programGroups.set(programId, {
          name: programName,
          rooms: programRooms,
          people: [],
        })
      }
      programGroups.get(programId)!.people.push(person)
    } else {
      membersWithoutProgram.push(person)
    }
  })

  // Sort programs by number of people (descending)
  const sortedPrograms = Array.from(programGroups.entries()).sort(
    ([, a], [, b]) => {
      if (b.people.length !== a.people.length) {
        return b.people.length - a.people.length
      }
      return a.name.localeCompare(b.name)
    }
  )

  // Convert maps to plain objects for client component
  const orgsLookup: Record<string, { name: string }> = {}
  orgsMap.forEach((org, id) => {
    orgsLookup[id] = { name: org.name }
  })

  const programsLookup: Record<string, { name: string }> = {}
  programsMap.forEach((program, id) => {
    programsLookup[id] = { name: program.name }
  })

  // Build sections data for client component
  const sections = [
    {
      type: 'person-section' as const,
      title: 'Staff',
      people: staff,
      affiliationType: 'org' as const,
    },
    {
      type: 'grouped-section' as const,
      title: 'Programs',
      groups: sortedPrograms.map(([programId, { name, rooms, people }]) => ({
        id: programId,
        name,
        rooms,
        people,
      })),
    },
    {
      type: 'grouped-section' as const,
      title: 'Offices',
      groups: sortedOrgs.map(([orgId, { name, rooms, people }]) => ({
        id: orgId,
        name,
        rooms,
        people,
      })),
    },
    {
      type: 'person-section' as const,
      title: 'Members',
      people: membersWithoutProgram,
      affiliationType: 'both' as const,
    },
  ]

  return (
    <div className="directory homepage-directory">
      <DirectoryClient
        sections={sections}
        orgsLookup={orgsLookup}
        programsLookup={programsLookup}
        memberCount={people.length}
        isHomepage
      />
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

function PersonSection({
  title,
  people,
  getAffiliation,
}: {
  title: string
  people: Person[]
  getAffiliation?: (person: Person) => string | undefined
}) {
  if (people.length === 0) return null

  return (
    <div className="directory-section">
      <h2 className="section-title">{title}</h2>
      <div className="directory-list">
        {people.map((person) => (
          <PersonEntry
            key={person.id}
            person={person}
            affiliation={getAffiliation?.(person)}
          />
        ))}
      </div>
    </div>
  )
}

function SubSection({
  name,
  rooms,
  people,
}: {
  name: string
  rooms?: string[]
  people: Person[]
}) {
  if (people.length === 0) return null

  const roomText = rooms && rooms.length > 0 ? rooms.join(', ') : null

  return (
    <div className="directory-section program-section">
      <div className="program-header">
        <h3 className="program-title">{name}</h3>
        {roomText && <span className="program-room">Room(s) {roomText}</span>}
      </div>
      <div className="directory-list">
        {people.map((person) => (
          <PersonEntry key={person.id} person={person} />
        ))}
      </div>
    </div>
  )
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  // Fetch all data in parallel
  const [people, orgsMap, programsMap] = await Promise.all([
    getPeople(),
    getOrgs(),
    getPrograms(),
  ])

  const params = await searchParams
  const filter = params.filter

  const filteredPeople = filterPeople(people, filter)

  // Separate people by tier
  const staff = sortPeopleByCompleteness(
    filteredPeople.filter((person) => person.tier === 'Staff')
  )
  const privateOffices = sortPeopleByCompleteness(
    filteredPeople.filter((person) => person.tier === 'Private Office')
  )
  const members = sortPeopleByCompleteness(
    filteredPeople.filter(
      (person) => person.tier !== 'Staff' && person.tier !== 'Private Office'
    )
  )

  // Group private offices by organization (excluding stealth orgs)
  const officesByOrg = new Map<
    string,
    { name: string; rooms: string[]; people: Person[] }
  >()
  privateOffices.forEach((person) => {
    const orgId =
      person.org && person.org.length > 0 ? person.org[0] : 'independent'

    // Skip stealth orgs (check from orgs map)
    const org = orgsMap.get(orgId)
    if (org?.stealth) return

    const orgName = org?.name || 'Independent'
    const orgRooms = org?.rooms || []

    if (!officesByOrg.has(orgId)) {
      officesByOrg.set(orgId, { name: orgName, rooms: orgRooms, people: [] })
    }
    officesByOrg.get(orgId)!.people.push(person)
  })

  // Sort orgs by number of people (descending), then alphabetically
  const sortedOrgs = Array.from(officesByOrg.entries()).sort(([, a], [, b]) => {
    if (b.people.length !== a.people.length) {
      return b.people.length - a.people.length
    }
    return a.name.localeCompare(b.name)
  })

  // Group members by program (for those who have programs)
  const programGroups = new Map<
    string,
    { name: string; rooms: string[]; people: Person[] }
  >()
  const membersWithoutProgram: Person[] = []

  members.forEach((person) => {
    if (person.program && person.program.length > 0) {
      const programId = person.program[0]
      const program = programsMap.get(programId)
      const programName = program?.name || 'Program'
      const programRooms = program?.rooms || []

      if (!programGroups.has(programId)) {
        programGroups.set(programId, {
          name: programName,
          rooms: programRooms,
          people: [],
        })
      }
      programGroups.get(programId)!.people.push(person)
    } else {
      membersWithoutProgram.push(person)
    }
  })

  // Sort programs by number of people (descending)
  const sortedPrograms = Array.from(programGroups.entries()).sort(
    ([, a], [, b]) => {
      if (b.people.length !== a.people.length) {
        return b.people.length - a.people.length
      }
      return a.name.localeCompare(b.name)
    }
  )

  // Convert maps to plain objects for client component
  const orgsLookup: Record<string, { name: string }> = {}
  orgsMap.forEach((org, id) => {
    orgsLookup[id] = { name: org.name }
  })

  const programsLookup: Record<string, { name: string }> = {}
  programsMap.forEach((program, id) => {
    programsLookup[id] = { name: program.name }
  })

  // Build sections data for client component
  const sections = [
    {
      type: 'person-section' as const,
      title: 'Staff',
      people: staff,
      affiliationType: 'org' as const,
    },
    {
      type: 'grouped-section' as const,
      title: 'Programs',
      groups: sortedPrograms.map(([programId, { name, rooms, people }]) => ({
        id: programId,
        name,
        rooms,
        people,
      })),
    },
    {
      type: 'grouped-section' as const,
      title: 'Offices',
      groups: sortedOrgs.map(([orgId, { name, rooms, people }]) => ({
        id: orgId,
        name,
        rooms,
        people,
      })),
    },
    {
      type: 'person-section' as const,
      title: 'Members',
      people: membersWithoutProgram,
      affiliationType: 'both' as const,
    },
  ]

  return (
    <div className="directory">
      <Link href="/" className="back-link">
        &larr; back to home
      </Link>

      <DirectoryClient
        sections={sections}
        orgsLookup={orgsLookup}
        programsLookup={programsLookup}
        memberCount={filteredPeople.length}
        filter={filter}
      />

      <hr />

      <p className="muted">
        <Link href="/portal/login">edit your info</Link>
      </p>
    </div>
  )
}
