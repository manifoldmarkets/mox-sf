import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/app/lib/session'
import { isValidToken, escapeAirtableString } from '@/app/lib/airtable-helpers'
import { findRecord, updateRecord, Tables } from '@/app/lib/airtable'

interface PersonFields {
  Email?: string
  Name?: string
  Tier?: string
  magic_link_token?: string
  token_expires?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      new URL('/portal/login?error=invalid', request.url)
    )
  }

  // Validate token format (should be 64-char hex string from randomBytes(32))
  if (!isValidToken(token, 64)) {
    return NextResponse.redirect(
      new URL('/portal/login?error=invalid', request.url)
    )
  }

  try {
    // Verify token and get user
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.redirect(
        new URL('/portal/login?error=expired', request.url)
      )
    }

    // Create session
    await createSession(user.id, user.email, user.name, user.isStaff)

    // Clear the token from Airtable (one-time use)
    await clearToken(user.id)

    // Redirect to portal
    return NextResponse.redirect(new URL('/portal', request.url))
  } catch (error) {
    console.error('Error verifying token:', error)
    return NextResponse.redirect(
      new URL('/portal/login?error=server', request.url)
    )
  }
}

async function verifyToken(token: string) {
  // Use escapeAirtableString to prevent formula injection
  const escapedToken = escapeAirtableString(token)
  const formula = `{magic_link_token} = '${escapedToken}'`

  const record = await findRecord<PersonFields>(Tables.People, formula)

  if (!record) {
    return null
  }

  const expiresAt = new Date(record.fields.token_expires || '')

  // Check if token is expired
  if (expiresAt < new Date()) {
    return null
  }

  // Debug: Log what we're getting from Airtable
  console.log('User login - Tier from Airtable:', record.fields.Tier)
  console.log('User login - isStaff will be:', record.fields.Tier === 'Staff')

  return {
    id: record.id,
    email: record.fields.Email,
    name: record.fields.Name,
    isStaff: record.fields.Tier === 'Staff',
  }
}

async function clearToken(recordId: string) {
  await updateRecord<PersonFields>(Tables.People, recordId, {
    magic_link_token: '',
    token_expires: undefined,
  })
}
