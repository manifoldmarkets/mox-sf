import { NextRequest, NextResponse } from 'next/server'
import { createRecord, updateRecord, findRecord, Tables } from '@/app/lib/airtable'
import { escapeAirtableString, isValidEmail } from '@/app/lib/airtable-helpers'

const FESTIVAL_TAG = 'Festival Days 2026'

interface SignupRequest {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()

    if (!body.email || !body.email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if person already exists by email
    const existingPerson = await findRecord<{ Tags?: string[] }>(
      Tables.People,
      `{Email}="${escapeAirtableString(email)}"`
    )

    if (existingPerson) {
      // Merge the Festival Days tag into their existing tags
      const existingTags = existingPerson.fields.Tags || []
      if (!existingTags.includes(FESTIVAL_TAG)) {
        await updateRecord(Tables.People, existingPerson.id, {
          Tags: [...existingTags, FESTIVAL_TAG],
        })
      }
    } else {
      await createRecord(Tables.People, {
        Email: email,
        Tags: [FESTIVAL_TAG],
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Festival Days signup error:', error)
    return NextResponse.json(
      { error: 'Failed to sign up. Please try again.' },
      { status: 500 }
    )
  }
}
