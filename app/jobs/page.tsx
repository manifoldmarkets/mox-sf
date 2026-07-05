import Link from 'next/link'
import { getOpenRoles, type OpenRole } from '@/app/lib/careers'
import { getOrgs } from '@/app/people/people'

export const metadata = {
  title: 'Jobs | Mox',
  description:
    'Open roles at organizations in and around Mox — AI safety, research, and startups in San Francisco.',
}

export const revalidate = 300

interface RoleGroup {
  name: string
  roles: OpenRole[]
}

function groupRoles(
  roles: OpenRole[],
  orgNames: Map<string, string>
): RoleGroup[] {
  const groups = new Map<string, RoleGroup>()
  for (const role of roles) {
    const name =
      (role.orgId && orgNames.get(role.orgId)) || role.company || 'Other'
    if (!groups.has(name)) {
      groups.set(name, { name, roles: [] })
    }
    groups.get(name)!.roles.push(role)
  }

  return [...groups.values()].sort((a, b) => {
    // Mox's own openings first, then by number of roles, then alphabetically.
    if (a.name === 'Mox') return -1
    if (b.name === 'Mox') return 1
    if (a.roles.length !== b.roles.length)
      return b.roles.length - a.roles.length
    return a.name.localeCompare(b.name)
  })
}

export default async function JobsPage() {
  let groups: RoleGroup[] = []
  let loadError = false
  try {
    const [roles, orgsMap] = await Promise.all([
      getOpenRoles({ revalidate: 300 }),
      getOrgs(),
    ])
    const orgNames = new Map<string, string>()
    orgsMap.forEach((org, id) => {
      if (!org.stealth) orgNames.set(id, org.name)
    })
    groups = groupRoles(
      // Roles at stealth orgs stay off the public board entirely.
      roles.filter((role) => !role.orgId || orgNames.has(role.orgId)),
      orgNames
    )
  } catch (error) {
    console.error('[Jobs] Failed to load roles:', error)
    loadError = true
  }

  const totalRoles = groups.reduce((sum, group) => sum + group.roles.length, 0)

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-amber-800 hover:text-amber-600 underline decoration-dotted underline-offset-2"
      >
        &larr; moxsf.com
      </Link>

      <h1 className="text-4xl font-bold mt-6 mb-2">Jobs around Mox</h1>
      <p className="text-slate-600 mb-10">
        Open roles at organizations in the Mox community — heavy on AI safety,
        research, and early-stage startups in San Francisco.
        {totalRoles > 0 &&
          ` ${totalRoles} open role${totalRoles === 1 ? '' : 's'}.`}
      </p>

      {loadError ? (
        <p className="text-slate-600">
          Couldn&apos;t load roles right now — try again in a minute.
        </p>
      ) : groups.length === 0 ? (
        <p className="text-slate-600">
          No open roles listed yet — check back soon.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.name} className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">{group.name}</h2>
            <ul className="space-y-3">
              {group.roles.map((role) => (
                <li key={role.id} className="border-b border-slate-200 pb-3">
                  {role.url ? (
                    <a
                      href={role.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-amber-800 hover:text-amber-600 underline decoration-dotted underline-offset-2"
                    >
                      {role.title}
                    </a>
                  ) : (
                    <span className="font-medium">{role.title}</span>
                  )}
                  <div className="text-sm text-slate-500 mt-1">
                    {[role.location, ...role.tags].filter(Boolean).join(' · ')}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <p className="text-sm text-slate-500 mt-12">
        Hiring at a Mox org and missing from this list? Ping{' '}
        <a
          href="mailto:team@moxsf.com"
          className="text-amber-800 hover:text-amber-600 underline decoration-dotted underline-offset-2"
        >
          team@moxsf.com
        </a>
        .
      </p>
    </main>
  )
}
