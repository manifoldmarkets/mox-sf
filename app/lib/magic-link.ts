import crypto from 'crypto'
import { updateRecord, Tables } from './airtable'

interface PersonTokenFields {
  magic_link_token?: string
  token_expires?: string
}

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

/**
 * Mints a fresh magic-link token, persists it on the Person record, and
 * returns the absolute portal-verify URL the user should click.
 *
 * Caller is responsible for picking the right baseUrl (env vs. request-derived
 * in dev). The token expires in 24 hours.
 */
export async function createMagicLink(
  personRecordId: string,
  baseUrl: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

  await updateRecord<PersonTokenFields>(Tables.People, personRecordId, {
    magic_link_token: token,
    token_expires: expiresAt.toISOString(),
  })

  return `${baseUrl}/portal/verify?token=${token}`
}
