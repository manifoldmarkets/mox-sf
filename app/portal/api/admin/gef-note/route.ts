import { getSession, isCurrentlyStaff } from '@/app/lib/session'
import { createRecord, getRecord, Tables } from '@/app/lib/airtable'

/**
 * Staff-only: log a 1:1 check-in note for a GEF fellow.
 * Creates a record in the pre-existing "Check-ins" Airtable table (the staff
 * conversation tracker; its Name and Created fields are computed by Airtable).
 */

interface PersonFields {
  Name?: string
}

interface FellowNoteFields {
  People?: string[]
  Notes?: string
  'Logged by'?: string
}

const MAX_NOTE_LENGTH = 10000

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session.isLoggedIn || !session.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!(await isCurrentlyStaff(session.userId))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const personId = typeof body?.personId === 'string' ? body.personId : ''
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : ''

    if (!personId || !notes) {
      return Response.json(
        { error: 'personId and notes are required' },
        { status: 400 }
      )
    }
    if (notes.length > MAX_NOTE_LENGTH) {
      return Response.json({ error: 'Note is too long' }, { status: 400 })
    }

    const person = await getRecord<PersonFields>(Tables.People, personId)
    if (!person) {
      return Response.json({ error: 'Person not found' }, { status: 404 })
    }

    const record = await createRecord<FellowNoteFields>(
      Tables.CheckIns,
      {
        People: [personId],
        Notes: notes,
        'Logged by': session.name || session.email || 'Staff',
      },
      { typecast: true }
    )

    return Response.json({ success: true, id: record.id })
  } catch (error) {
    console.error('[GEF note] Error creating note:', error)
    return Response.json({ error: 'Failed to save note' }, { status: 500 })
  }
}
