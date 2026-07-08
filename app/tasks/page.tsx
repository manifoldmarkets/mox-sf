import Link from 'next/link'
import { listTasks, type Task } from '@/app/lib/tasks'
import TaskCard from './TaskCard'

export const dynamic = 'force-dynamic'

const SECTION_TITLE =
  'font-sans text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4'

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: 'Google sign-in isn’t configured yet.',
  google_denied: 'Sign-in was cancelled.',
  google_token: 'Google sign-in failed — please try again.',
  google_user: 'Couldn’t read your Google profile — please try again.',
  invalid_state: 'Sign-in expired — please try again.',
  no_email: 'Your Google account didn’t share an email.',
  server: 'Something went wrong signing in — please try again.',
}

export default async function TasksBoard({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; error?: string }>
}) {
  const { tag, error } = await searchParams

  let tasks: Task[] = []
  let unavailable = false
  try {
    tasks = await listTasks()
  } catch (err) {
    console.error('[tasks] board fetch failed:', err)
    unavailable = true
  }

  const matchesTag = (t: Task) =>
    !!tag && (t.skills.includes(tag) || t.floor === tag)
  let open = tasks.filter((t) => t.status === 'Open')
  if (tag)
    open = [...open.filter(matchesTag), ...open.filter((t) => !matchesTag(t))]
  const inProgress = tasks.filter(
    (t) => t.status === 'Claimed' || t.status === 'In review'
  )
  const twoWeeksAgo = Date.now() - 14 * 24 * 3600_000
  const recentlyDone = tasks
    .filter(
      (t) =>
        t.status === 'Done' &&
        t.completedAt &&
        Date.parse(t.completedAt) > twoWeeksAgo
    )
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, 8)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {error && ERROR_MESSAGES[error] && (
        <p className="mb-6 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
          {ERROR_MESSAGES[error]}
        </p>
      )}

      <section className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Help make Mox better.
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Small, well-scoped tasks — most take an hour or two. Claim one, do it
          today, and it&rsquo;s yours.{' '}
          {!unavailable && (
            <span className="font-semibold text-amber-900 dark:text-amber-400">
              {open.length} open right now.
            </span>
          )}
        </p>
      </section>

      <section className="mb-12">
        <h2 className={SECTION_TITLE}>Open tasks</h2>
        {tag && (
          <p className="-mt-2 mb-4 font-sans text-sm text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-bold text-amber-900 dark:text-amber-400">
              {tag}
            </span>{' '}
            tasks first ·{' '}
            <Link href="/tasks" className="underline underline-offset-2">
              clear
            </Link>
          </p>
        )}
        {unavailable ? (
          <div className="border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center text-gray-500 dark:text-gray-400">
            The board is warming up — check back in a little while.
          </div>
        ) : open.length > 0 ? (
          <div className="grid gap-4 items-start sm:grid-cols-2 xl:grid-cols-3">
            {open.map((t) => (
              <TaskCard key={t.id} task={t} activeTag={tag} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center text-gray-500 dark:text-gray-400">
            Nothing open right now — everything&rsquo;s claimed or done. Check
            back soon!
          </div>
        )}
      </section>

      {inProgress.length > 0 && (
        <section className="mb-12">
          <h2 className={SECTION_TITLE}>In progress</h2>
          <div className="grid gap-4 items-start sm:grid-cols-2 xl:grid-cols-3">
            {inProgress.map((t) => (
              <TaskCard key={t.id} task={t} activeTag={tag} />
            ))}
          </div>
        </section>
      )}

      {recentlyDone.length > 0 && (
        <section className="mb-12">
          <h2 className={SECTION_TITLE}>Recently completed 🎉</h2>
          <div className="flex flex-col gap-2">
            {recentlyDone.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[110px_1fr] gap-3 text-sm items-baseline"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {t.claimantName.split(' ')[0] || 'Someone'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {t.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
