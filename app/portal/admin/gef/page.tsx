import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession, isCurrentlyStaff } from '@/app/lib/session'
import { findRecords, Tables } from '@/app/lib/airtable'
import { addDays } from '@/app/lib/checkins'
import {
  GEF_ABSENCE_FLAG_DAYS,
  GEF_WINDOW_DAYS,
  getGefAttendanceReport,
  type GefAttendanceReport,
} from '@/app/lib/gef'
import GefNoteForm from './GefNoteForm'

export const metadata = {
  title: 'GEF Fellows | Admin | Mox',
}

export const dynamic = 'force-dynamic'

// 1:1 conversation notes live in the pre-existing "Check-ins" table
// (staff conversation tracker), NOT the Attendance table.
interface FellowNoteFields {
  People?: string[]
  Notes?: string
  Created?: string
  'Logged by'?: string
}

interface FellowNote {
  id: string
  personId: string | null
  date: string
  notes: string
  loggedBy: string
}

async function getRecentNotes(fellowIds: Set<string>): Promise<FellowNote[]> {
  const records = await findRecords<FellowNoteFields>(Tables.CheckIns, '', {
    fields: ['People', 'Notes', 'Created', 'Logged by'],
    sort: [{ field: 'Created', direction: 'desc' }],
    maxRecords: 200,
  })
  return records
    .filter((record) => record.fields.People?.some((id) => fellowIds.has(id)))
    .slice(0, 25)
    .map((record) => ({
      id: record.id,
      personId: record.fields.People?.[0] || null,
      date: record.fields.Created?.slice(0, 10) || '',
      notes: record.fields.Notes || '',
      loggedBy: record.fields['Logged by'] || '',
    }))
}

function formatLastSeen(
  lastSeen: string | null,
  daysSinceSeen: number | null
): string {
  if (!lastSeen || daysSinceSeen === null) return 'never'
  if (daysSinceSeen === 0) return 'today'
  if (daysSinceSeen === 1) return 'yesterday'
  return `${daysSinceSeen}d ago`
}

function DotGrid({
  presentDates,
  today,
}: {
  presentDates: Set<string>
  today: string
}) {
  const days: { date: string; present: boolean }[] = []
  for (let i = GEF_WINDOW_DAYS - 1; i >= 0; i--) {
    const date = addDays(today, -i)
    days.push({ date, present: presentDates.has(date) })
  }
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-hidden>
      {days.map(({ date, present }) => (
        <span
          key={date}
          title={`${date}${present ? ' — present' : ''}`}
          style={{
            width: 7,
            height: 14,
            borderRadius: 2,
            background: present ? '#2f9e44' : '#e9ecef',
          }}
        />
      ))}
    </div>
  )
}

export default async function GefAdminPage() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/portal/login')
  }
  if (!(await isCurrentlyStaff(session.userId))) {
    redirect('/portal')
  }

  let report: GefAttendanceReport | null = null
  let notes: FellowNote[] = []
  let setupError: string | null = null
  try {
    report = await getGefAttendanceReport()
    notes = await getRecentNotes(new Set(report.fellows.map((f) => f.id)))
  } catch (error) {
    console.error('[GEF admin] Failed to load data:', error)
    setupError = error instanceof Error ? error.message : 'Unknown error'
  }

  return (
    <div>
      <Link href="/portal" className="back-link">
        &larr; back to portal
      </Link>

      <h1>GEF fellows</h1>

      {setupError ? (
        <div style={{ background: '#fff3f0', padding: 16, borderRadius: 8 }}>
          <p style={{ marginTop: 0 }}>
            <strong>Couldn&apos;t load attendance data.</strong> This page needs
            the Airtable tables <code>Attendance</code> and{' '}
            <code>Check-ins</code> (see{' '}
            <code>docs/workflows/gef-checkin-tracking.md</code>).
          </p>
          <p className="muted" style={{ marginBottom: 0 }}>
            {setupError}
          </p>
        </div>
      ) : report && report.fellows.length === 0 ? (
        <p className="muted">
          No fellows found. Fellows are People linked to a Program whose name
          contains &ldquo;GEF&rdquo; or &ldquo;Global Expert&rdquo;.
        </p>
      ) : report ? (
        <>
          <p className="muted" style={{ marginBottom: 20 }}>
            attendance from door check-ins, last {GEF_WINDOW_DAYS} days. fellows
            not seen in {GEF_ABSENCE_FLAG_DAYS}+ days are flagged.
          </p>

          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr
                style={{ textAlign: 'left', borderBottom: '1px solid #dee2e6' }}
              >
                <th style={{ padding: '6px 12px 6px 0' }}>Fellow</th>
                <th style={{ padding: '6px 12px 6px 0' }}>Last seen</th>
                <th style={{ padding: '6px 12px 6px 0' }}>This week</th>
                <th style={{ padding: '6px 12px 6px 0' }}>4 weeks</th>
                <th style={{ padding: '6px 0' }}>
                  Last {GEF_WINDOW_DAYS} days
                </th>
              </tr>
            </thead>
            <tbody>
              {report.fellows.map((fellow) => {
                const summary = report!.summaries.get(fellow.id)!
                const flagged =
                  summary.daysSinceSeen === null ||
                  summary.daysSinceSeen >= GEF_ABSENCE_FLAG_DAYS
                return (
                  <tr
                    key={fellow.id}
                    style={{
                      borderBottom: '1px solid #f1f3f5',
                      background: flagged ? '#fff3f0' : undefined,
                    }}
                  >
                    <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>
                      {flagged ? '⚠️ ' : ''}
                      {fellow.name}
                      {fellow.programNames.length > 0 && (
                        <span className="muted" style={{ fontWeight: 400 }}>
                          {' '}
                          · {fellow.programNames.join(', ')}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px 8px 0' }}>
                      {formatLastSeen(summary.lastSeen, summary.daysSinceSeen)}
                    </td>
                    <td
                      style={{ padding: '8px 12px 8px 0', textAlign: 'center' }}
                    >
                      {summary.daysThisWeek}
                    </td>
                    <td
                      style={{ padding: '8px 12px 8px 0', textAlign: 'center' }}
                    >
                      {summary.daysLast4Weeks}
                    </td>
                    <td style={{ padding: '8px 0' }}>
                      <DotGrid
                        presentDates={new Set(summary.dates)}
                        today={report!.today}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <h2 style={{ marginTop: 40 }}>1:1 check-in notes</h2>
          <GefNoteForm
            fellows={report.fellows.map((f) => ({ id: f.id, name: f.name }))}
          />

          {notes.length === 0 ? (
            <p className="muted">No notes yet.</p>
          ) : (
            <div style={{ marginTop: 16 }}>
              {notes.map((note) => {
                const fellow = report!.fellows.find(
                  (f) => f.id === note.personId
                )
                return (
                  <div
                    key={note.id}
                    style={{
                      borderLeft: '3px solid #dee2e6',
                      padding: '4px 12px',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <strong>{fellow?.name || 'Unknown fellow'}</strong>{' '}
                      <span className="muted">
                        · {note.date}
                        {note.loggedBy ? ` · logged by ${note.loggedBy}` : ''}
                      </span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{note.notes}</div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
