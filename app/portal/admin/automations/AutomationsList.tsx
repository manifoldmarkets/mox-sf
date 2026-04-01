'use client'

import { useState } from 'react'
import type { AutomationManifestEntry } from '@/app/lib/automations-manifest'

const TYPE_LABELS: Record<AutomationManifestEntry['type'], string> = {
  cron: 'cron',
  webhook: 'webhook',
  integration: 'integration',
  'portal-action': 'portal',
  'event-action': 'event',
}

function describeCron(schedule: string): string {
  // Translate common cron patterns to human-readable
  if (schedule === '* * * * *') return 'every minute'
  if (schedule === '*/5 * * * *') return 'every 5 min'
  if (schedule === '*/10 * * * *') return 'every 10 min'
  if (schedule === '0 * * * *') return 'every hour'
  if (schedule === '0 0 * * *') return 'daily at midnight'

  // "0 17 * * 1" -> "Mondays at 17:00 UTC"
  const parts = schedule.split(' ')
  if (parts.length === 5) {
    const [min, hour, , , dow] = parts
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    if (dow !== '*' && hour !== '*') {
      const dayName = days[parseInt(dow)] || dow
      return `${dayName} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} UTC`
    }
    if (hour !== '*' && min !== '*') {
      return `daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} UTC`
    }
  }
  return schedule
}

export default function AutomationsList({
  automations,
}: {
  automations: AutomationManifestEntry[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const types = ['all', ...new Set(automations.map((a) => a.type))]

  const filtered =
    filter === 'all' ? automations : automations.filter((a) => a.type === filter)

  return (
    <div>
      {/* Filter buttons */}
      <div style={{ marginBottom: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={t === filter ? 'primary small' : 'small'}
          >
            {t === 'all' ? 'all' : TYPE_LABELS[t as AutomationManifestEntry['type']] || t}
            {' '}
            ({t === 'all' ? automations.length : automations.filter((a) => a.type === t).length})
          </button>
        ))}
      </div>

      {/* Automation list */}
      {filtered.map((a) => {
        const isExpanded = expandedId === a.id
        return (
          <div
            key={a.id}
            style={{
              border: '1px solid var(--border-color)',
              marginBottom: 8,
              background: 'var(--bg-primary)',
            }}
          >
            {/* Summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : a.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                {isExpanded ? '[-]' : '[+]'}
              </span>

              <span style={{ flex: 1 }}>
                <strong>{a.id}</strong>
                <span className="muted" style={{ marginLeft: 10 }}>
                  {a.summary}
                </span>
              </span>

              <span className="badge" style={{ flexShrink: 0 }}>
                {TYPE_LABELS[a.type]}
              </span>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div
                style={{
                  padding: '0 12px 12px',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <table style={{ margin: '10px 0' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', width: 120 }}>type</td>
                      <td>{a.type}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>method</td>
                      <td>{a.httpMethod}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>route</td>
                      <td><code>{a.routePath}</code></td>
                    </tr>
                    {a.cronSchedule && (
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>schedule</td>
                        <td>
                          {describeCron(a.cronSchedule)}{' '}
                          <span className="muted">({a.cronSchedule})</span>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>source</td>
                      <td><code>{a.filePath}</code></td>
                    </tr>
                  </tbody>
                </table>

                <p className="muted" style={{ fontSize: '0.9em' }}>
                  {a.summary}
                </p>
              </div>
            )}
          </div>
        )
      })}

      {filtered.length === 0 && (
        <p className="muted">no automations match this filter.</p>
      )}
    </div>
  )
}
