import { findRecords, Tables, escapeAirtableString } from '@/app/lib/airtable'

interface DayPassFields {
  Name?: string
  'Pass Type'?: string
  Status?: string
  'Date Activated'?: string
  'Date Purchased'?: string
  User?: string[]
  Email?: string[]
  'Issued By'?: string[]
}

export interface DayPass {
  id: string
  paymentId: string
  passType: string
  status: 'Unused' | 'Activated' | 'Expired' | string
  dateActivated: string | null
  datePurchased: string | null
  issuedById: string | null
}

export async function fetchUserDayPasses(email: string): Promise<DayPass[]> {
  if (!email) return []
  // `Email` is a lookup field from the linked User record; ARRAYJOIN flattens
  // it to a comma-separated string we can match against.
  const formula = `LOWER(ARRAYJOIN({Email})) = '${escapeAirtableString(email.toLowerCase())}'`
  const records = await findRecords<DayPassFields>(Tables.DayPasses, formula, {
    sort: [{ field: 'Date Purchased', direction: 'desc' }],
  })

  return records.map((record) => ({
    id: record.id,
    paymentId: record.fields.Name || '',
    passType: record.fields['Pass Type'] || 'Day Pass',
    status: record.fields.Status || 'Unused',
    dateActivated: record.fields['Date Activated'] || null,
    datePurchased: record.fields['Date Purchased'] || null,
    issuedById: record.fields['Issued By']?.[0] || null,
  }))
}

export function computeExpiresAt(pass: DayPass): string | null {
  if (!pass.dateActivated) return null
  const activated = new Date(pass.dateActivated)
  if (pass.passType === 'Week Pass') {
    activated.setDate(activated.getDate() + 6)
  }
  return activated.toISOString().split('T')[0]
}

export function isExpired(pass: DayPass): boolean {
  if (pass.status === 'Expired') return true
  const expiresAt = computeExpiresAt(pass)
  if (!expiresAt) return false
  const expiryDate = new Date(expiresAt + 'T23:00:00')
  return expiryDate < new Date()
}
