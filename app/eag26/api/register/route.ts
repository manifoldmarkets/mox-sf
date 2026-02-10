import { NextRequest, NextResponse } from 'next/server'
import { createRecord, updateRecord, findRecord, Tables } from '@/app/lib/airtable'
import { escapeAirtableString } from '@/app/lib/airtable-helpers'
import { env } from '@/app/lib/env'
import { sendEAGWelcomeEmail } from '@/app/lib/emails/eag-welcome'
import { sendChannelMessage, DISCORD_CHANNELS } from '@/app/lib/discord'

interface EAGRegistrationRequest {
  name: string
  email: string
  website: string
  isEAGAttendee: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: EAGRegistrationRequest = await request.json()

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!body.website || !body.website.trim()) {
      return NextResponse.json(
        { error: 'Website or LinkedIn URL is required' },
        { status: 400 }
      )
    }

    if (!body.isEAGAttendee) {
      return NextResponse.json(
        { error: 'You must confirm you are an EAG attendee or guest' },
        { status: 400 }
      )
    }

    const name = body.name.trim()
    const email = body.email.trim().toLowerCase()
    const website = body.website.trim()
    const doorCode = env.EAG_GUEST_CODE

    // Check if person already exists by email
    const existingPerson = await findRecord<{ Tags?: string[] }>(
      Tables.People,
      `{Email}="${escapeAirtableString(email)}"`
    )

    if (existingPerson) {
      // Update existing person with EAG 2026 tag (merge with existing tags)
      const existingTags = existingPerson.fields.Tags || []
      const newTags = existingTags.includes('EAG 2026')
        ? existingTags
        : [...existingTags, 'EAG 2026']

      await updateRecord(Tables.People, existingPerson.id, {
        Name: name,
        Website: website,
        Tags: newTags,
      })
    } else {
      // Create new person with EAG 2026 tag
      await createRecord(Tables.People, {
        Name: name,
        Email: email,
        Website: website,
        Tags: ['EAG 2026'],
      })
    }

    // Send welcome email with door code
    await sendEAGWelcomeEmail({
      to: email,
      name,
      doorCode,
    })

    // Notify team on Discord
    await sendChannelMessage(
      DISCORD_CHANNELS.NOTIFICATIONS,
      `🎫 **EAG Day Pass Registration**\n` +
      `**Name:** ${name}\n` +
      `**Email:** ${email}\n` +
      `**Website:** ${website}`
    )

    // Return the door code
    return NextResponse.json({
      success: true,
      doorCode,
    })
  } catch (error) {
    console.error('EAG registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register. Please try again.' },
      { status: 500 }
    )
  }
}
