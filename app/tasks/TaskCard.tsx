import Link from 'next/link'
import type { Task } from '@/app/lib/tasks'
import { CHIP_BASE, FLOOR_CHIP, SKILL_CHIP } from './ui'

export default function TaskCard({
  task,
  activeTag,
}: {
  task: Task
  activeTag?: string
}) {
  const claimed = task.status !== 'Open'
  const firstName = task.claimantName.split(' ')[0]
  const tagHref = (t: string) =>
    activeTag === t ? '/tasks' : `/tasks?tag=${encodeURIComponent(t)}`

  return (
    <article
      className={`relative flex flex-col gap-2.5 border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors ${
        claimed ? 'opacity-75' : ''
      }`}
    >
      {/* Stretched link makes the whole card clickable; chips sit above it. */}
      <Link
        href={`/tasks/${task.id}`}
        className="absolute inset-0"
        aria-label={task.title}
      />

      <div className="flex items-center justify-between gap-2">
        {task.effort && (
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
            {task.effort}
          </span>
        )}
        {task.status === 'Claimed' && (
          <span
            className={`${CHIP_BASE} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300`}
          >
            In progress
          </span>
        )}
        {task.status === 'In review' && (
          <span
            className={`${CHIP_BASE} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`}
          >
            Wrapping up
          </span>
        )}
      </div>

      <h3 className="font-display text-xl font-bold leading-tight text-gray-900 dark:text-white">
        {task.title}
      </h3>
      {task.summary && (
        <p className="flex-1 text-sm text-gray-600 dark:text-gray-300">
          {task.summary}
        </p>
      )}

      {(task.floor || task.skills.length > 0) && (
        <div className="relative z-10 flex flex-wrap gap-1.5">
          {task.floor && (
            <Link href={tagHref(task.floor)} className={FLOOR_CHIP}>
              📍 {task.floor}
            </Link>
          )}
          {task.skills.map((s) => (
            <Link
              key={s}
              href={tagHref(s)}
              className={`${CHIP_BASE} ${SKILL_CHIP[s] ?? ''}`}
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      {claimed && firstName && (
        <p className="text-[13px] font-medium text-amber-800 dark:text-amber-400">
          Claimed by {firstName}
        </p>
      )}
    </article>
  )
}
