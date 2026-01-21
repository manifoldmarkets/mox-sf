import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/session'
import DiscordMappingTool from './DiscordMappingTool'
import BulkRoleSync from './BulkRoleSync'
import Link from 'next/link'

export const metadata = {
  title: 'Discord Mapping | Admin | Mox',
}

export default async function DiscordMappingPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }

  if (!session.isStaff) {
    redirect('/portal')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/portal"
            className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
          >
            ← Back to Portal
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Discord Username Mapping
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bulk associate Discord usernames with people in Airtable
          </p>

          <DiscordMappingTool />

          <BulkRoleSync />
        </div>
      </div>
    </div>
  )
}
