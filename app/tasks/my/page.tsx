import Link from 'next/link'
import { listTasks, RELEASE_HOURS } from '@/app/lib/tasks'
import { getClaimer } from '@/app/lib/tasks-auth'
import { CHIP_BASE, STATUS_BADGE } from '../ui'

export const dynamic = 'force-dynamic'

const GHOST =
  'border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'

export default async function MyTasks() {
  const claimer = await getClaimer()

  if (!claimer) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1.5">
          My tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Sign in to see the tasks you&rsquo;ve claimed.
        </p>
        <Link
          href="/tasks/auth/google?redirect=/tasks/my"
          className="inline-flex items-center gap-2 bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          Sign in with Google
        </Link>
      </div>
    )
  }

  const tasks = await listTasks()
  const active = tasks.filter(
    (t) => t.status === 'Claimed' && t.claimantEmail === claimer.email
  )
  const past = tasks
    .filter(
      (t) =>
        (t.status === 'In review' || t.status === 'Done') &&
        t.claimantEmail === claimer.email
    )
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1.5">
        My tasks
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        {active.length > 0
          ? `You have ${active.length} task${active.length > 1 ? 's' : ''} in progress.`
          : 'Nothing in progress — grab something from the board!'}
      </p>

      <div className="flex flex-col gap-3">
        {active.map((t) => {
          const hoursLeft = t.claimedAt
            ? Math.max(
                0,
                Math.round(
                  RELEASE_HOURS -
                    (Date.now() - Date.parse(t.claimedAt)) / 3600_000
                )
              )
            : null
          return (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-4"
            >
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                  {t.title}
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  {hoursLeft !== null
                    ? `Auto-releases in about ${hoursLeft}h`
                    : 'In progress'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`${CHIP_BASE} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300`}
                >
                  In progress
                </span>
                <Link href={`/tasks/${t.id}`} className={GHOST}>
                  Open →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
            Your contributions
          </h2>
          <div className="flex flex-col gap-3">
            {past.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-4"
              >
                <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                  {t.title}
                </h3>
                <div className="flex items-center gap-3">
                  {t.status === 'In review' ? (
                    <span
                      className={`${CHIP_BASE} ${STATUS_BADGE['In review']}`}
                    >
                      Being reviewed
                    </span>
                  ) : (
                    <span className={`${CHIP_BASE} ${STATUS_BADGE.Done}`}>
                      Done 🎉
                    </span>
                  )}
                  <Link href={`/tasks/${t.id}`} className={GHOST}>
                    Open →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
