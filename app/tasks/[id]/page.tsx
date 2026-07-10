import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTask, RELEASE_HOURS, storyForFloor } from '@/app/lib/tasks'
import { getClaimer } from '@/app/lib/tasks-auth'
import FloorMap from '../FloorMap'
import { ClaimButton, DonePanel } from '../TaskActions'
import { CHIP_BASE, FLOOR_CHIP, Prose, SKILL_CHIP, STATUS_BADGE } from '../ui'

export const dynamic = 'force-dynamic'

const SECTION_H =
  'font-sans text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5'

export default async function TaskDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [task, claimer] = await Promise.all([getTask(id), getClaimer()])
  if (!task || task.status === 'Archived') notFound()

  const isMine = !!claimer && task.claimantEmail === claimer.email
  const firstName = task.claimantName.split(' ')[0]
  const story = storyForFloor(task.floor)
  const hoursLeft = task.claimedAt
    ? Math.max(
        0,
        Math.round(
          RELEASE_HOURS - (Date.now() - Date.parse(task.claimedAt)) / 3600_000
        )
      )
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/tasks"
        className="text-sm text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 underline decoration-dotted underline-offset-2"
      >
        ← All tasks
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <article>
          {task.skills.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {task.skills.map((s) => (
                <Link
                  key={s}
                  href={`/tasks?tag=${encodeURIComponent(s)}`}
                  className={`${CHIP_BASE} ${SKILL_CHIP[s] ?? ''}`}
                >
                  {s}
                </Link>
              ))}
            </div>
          )}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {task.title}
          </h1>
          {task.summary && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-5">
              {task.summary}
            </p>
          )}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {task.effort && (
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                {task.effort}
              </span>
            )}
            {task.floor && (
              <Link
                href={`/tasks?tag=${encodeURIComponent(task.floor)}`}
                className={FLOOR_CHIP}
              >
                📍 {task.floor}
              </Link>
            )}
            {STATUS_BADGE[task.status] && (
              <span className={`${CHIP_BASE} ${STATUS_BADGE[task.status]}`}>
                {task.status === 'Claimed'
                  ? 'In progress'
                  : task.status === 'In review'
                    ? 'Wrapping up'
                    : task.status}
              </span>
            )}
          </div>

          {task.brief && (
            <section className="mb-7">
              <h2 className={SECTION_H}>The task</h2>
              <Prose
                text={task.brief}
                className="text-gray-700 dark:text-gray-300"
              />
            </section>
          )}

          {task.mapPoint && story && (
            <section className="mb-7">
              <h2 className={SECTION_H}>Where to find it</h2>
              <FloorMap story={story} pin={task.mapPoint} height={280} />
            </section>
          )}

          {task.doneCriteria && (
            <section className="mb-7">
              <h2 className={SECTION_H}>What done looks like</h2>
              <div className="bg-green-50 dark:bg-green-900/20 p-4">
                <Prose
                  text={task.doneCriteria}
                  className="text-green-900 dark:text-green-200"
                />
              </div>
            </section>
          )}

          {task.refPhotos.length > 0 && (
            <section className="mb-7">
              <h2 className={SECTION_H}>Photos</h2>
              <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3">
                {task.refPhotos.map((p) => (
                  <a
                    key={p.url}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbUrl}
                      alt={p.filename}
                      loading="lazy"
                      className="h-36 w-full border border-gray-200 dark:border-gray-600 object-cover"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {task.contextLinks.length > 0 && (
            <section className="mb-7">
              <h2 className={SECTION_H}>Useful links</h2>
              <ul className="flex flex-col gap-1.5">
                {task.contextLinks.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-amber-900 dark:text-amber-400 underline decoration-dotted underline-offset-2"
                    >
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 flex flex-col gap-3.5">
          {task.status === 'Open' &&
            (claimer ? (
              <>
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                  Take it on
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  Claiming means &ldquo;I&rsquo;m doing this today.&rdquo; It
                  goes back on the board after {RELEASE_HOURS}h if it
                  isn&rsquo;t finished — no hard feelings.
                </p>
                <ClaimButton taskId={task.id} />
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                  Take it on
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  Sign in with Google to claim this task. Claiming means
                  &ldquo;I&rsquo;m doing this today.&rdquo;
                </p>
                <Link
                  href={`/tasks/auth/google?redirect=/tasks/${task.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 bg-amber-900 hover:bg-amber-950 dark:bg-amber-700 dark:hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 transition-colors"
                >
                  Sign in with Google
                </Link>
              </>
            ))}

          {task.status === 'Claimed' && isMine && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                You&rsquo;re on it 💪
              </h2>
              {hoursLeft !== null && (
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  Auto-releases in about {hoursLeft}h. Finish and mark it done —
                  a photo closes it on the spot.
                </p>
              )}
              <DonePanel taskId={task.id} />
            </>
          )}

          {task.status === 'Claimed' && !isMine && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                {firstName || 'Someone'} is on it
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                If it isn&rsquo;t finished within {RELEASE_HOURS} hours it goes
                back on the board automatically — check back later.
              </p>
            </>
          )}

          {task.status === 'In review' && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                Almost done ✨
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                {isMine
                  ? 'Nice work! The Mox team will give it a quick look and close it out.'
                  : `${firstName || 'Someone'} finished this — the Mox team is giving it a quick look.`}
              </p>
            </>
          )}

          {task.status === 'Done' && (
            <>
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                Completed 🎉
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                {firstName ? `Done by ${firstName}. ` : ''}Thanks for making Mox
                better.
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
