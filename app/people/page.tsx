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
import DataErrorBanner from '../components/DataErrorBanner'
import './people.css'

export const metadata: Metadata = {
  title: 'People | Mox',
}

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  let dataError = false
  let people: Awaited<ReturnType<typeof getPeople>> = []
  let orgsMap: Awaited<ReturnType<typeof getOrgs>> = new Map()
  let programsMap: Awaited<ReturnType<typeof getPrograms>> = new Map()

  try {
    ;[people, orgsMap, programsMap] = await Promise.all([
      getPeople(), getOrgs(), getPrograms(),
    ])
  } catch (e) {
    console.error('Failed to fetch people data:', e)
    dataError = true
  }

  const params = await searchParams
  const filteredPeople = filterPeople(people, params.filter)
  const { sections, orgsLookup, programsLookup } = buildDirectoryData(filteredPeople, orgsMap, programsMap)

  return (
    <div className="directory-wrapper">
      {dataError && <DataErrorBanner />}
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
    </div>
  )
}
