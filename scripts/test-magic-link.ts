// Quick verifier for the magic-link flow.
// Usage:
//   bun scripts/test-magic-link.ts <email>
//
// Looks up the People record by email, mints a magic link pointing at the
// local dev server, and prints the URL. Click it; you should land logged in
// on the portal. The token is single-use and expires in 24h.

import { findRecord, Tables, escapeAirtableString } from '../app/lib/airtable'
import { createMagicLink } from '../app/lib/magic-link'

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('usage: bun scripts/test-magic-link.ts <email>')
    process.exit(1)
  }

  const record = await findRecord<{ Email?: string; Name?: string }>(
    Tables.People,
    `{Email}='${escapeAirtableString(email.toLowerCase())}'`
  )

  if (!record) {
    console.error(`no People record found for ${email}`)
    process.exit(1)
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const link = await createMagicLink(record.id, baseUrl)

  console.log(`person: ${record.fields.Name || '(no name)'} <${record.fields.Email}>`)
  console.log(`record: ${record.id}`)
  console.log(`link:   ${link}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
