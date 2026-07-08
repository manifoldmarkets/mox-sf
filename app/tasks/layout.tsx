import type { Metadata } from 'next'
import Link from 'next/link'
import { getClaimer, isOrganizer } from '@/app/lib/tasks-auth'
import AddTask from './AddTask'

export const metadata: Metadata = {
  title: 'Mox ᴛᴀꜱᴋꜱ',
  description:
    'Small, well-scoped tasks that make Mox better. Claim one, do it today, and it’s yours.',
}

export default async function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [claimer, organizer] = await Promise.all([getClaimer(), isOrganizer()])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-gray-50/85 dark:bg-gray-900/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/tasks"
            className="inline-flex items-start font-display text-xl font-bold text-gray-900 dark:text-white"
          >
            Mox
            <sup className="ml-px text-[0.62em] font-semibold text-amber-900 dark:text-amber-400">
              ᴛᴀꜱᴋꜱ
            </sup>
          </Link>
          <nav className="flex items-center gap-3 font-sans text-sm">
            {organizer && <AddTask />}
            {claimer ? (
              <>
                <Link
                  href="/tasks/my"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  My tasks
                </Link>
                <form action="/tasks/auth/signout" method="post">
                  <button
                    type="submit"
                    className="border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/tasks/auth/google?redirect=/tasks"
                className="border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-10 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 sm:px-6 lg:px-8 text-sm text-gray-500 dark:text-gray-400">
          <span>
            A community board by{' '}
            <a
              href="https://moxsf.com"
              className="text-amber-900 dark:text-amber-400"
            >
              Mox
            </a>{' '}
            · San Francisco
          </span>
          <span>Claim a task, do it today, make the space better.</span>
        </div>
      </footer>
    </div>
  )
}
