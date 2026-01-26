import { Metadata } from 'next'
import Link from 'next/link'
import {
  getPeople,
  getOrgs,
  getPrograms,
  filterPeople,
  buildDirectoryData,
} from './people'
import DirectoryClient from './DirectoryClient'
import './people.css'

export const metadata: Metadata = {
  title: 'People | Mox',
}

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const [people, orgsMap, programsMap, params] = await Promise.all([
    getPeople(), getOrgs(), getPrograms(), searchParams
  ])
  const filteredPeople = filterPeople(people, params.filter)
  const { sections, orgsLookup, programsLookup } = buildDirectoryData(filteredPeople, orgsMap, programsMap)

  return (
    <div className="directory">
      <Link href="/" className="back-link">&larr; back to home</Link>
      <DirectoryClient
        sections={sections}
        orgsLookup={orgsLookup}
        programsLookup={programsLookup}
        memberCount={filteredPeople.length}
        filter={params.filter}
      />
      <hr />
      <p className="muted"><Link href="/portal/login">edit your info</Link></p>
    </div>
  )
}
