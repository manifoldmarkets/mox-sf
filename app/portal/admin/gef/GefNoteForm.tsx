'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  fellows: { id: string; name: string }[]
}

export default function GefNoteForm({ fellows }: Props) {
  const router = useRouter()
  const [personId, setPersonId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!personId || !notes.trim()) {
      setError('Pick a fellow and write a note.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/portal/api/admin/gef-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, notes: notes.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save note')
      }
      setNotes('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 560,
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <select
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          style={{ padding: 6, flex: 1 }}
        >
          <option value="">Select a fellow…</option>
          {fellows.map((fellow) => (
            <option key={fellow.id} value={fellow.id}>
              {fellow.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="How are they doing? What are they working on? Next steps?"
        rows={3}
        style={{ padding: 6 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Add note'}
        </button>
        {error && <span style={{ color: '#c92a2a' }}>{error}</span>}
      </div>
    </form>
  )
}
