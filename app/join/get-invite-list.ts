'use server'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
export async function getAirtableData() {
  const formula =
    `AND(` +
    `OR(Priority="Amazing",Priority="Great",Priority="Probably great"),` +
    `OR(Status="Invited",Status="Toured",Status="Applied",Status="To Invite"))`
  const encodedFormula = encodeURIComponent(formula)

  const response = await fetch(
    `https://api.airtable.com/v0/appkHZ2UvU6SouT5y/People?fields%5B%5D=Name&filterByFormula=${encodedFormula}`,
    {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    }
  )
  const data = await response.json()
  /* response:
    {
    id: 'recrWaRcKcfPdztyO',
    createdTime: '2025-02-20T01:18:55.000Z',
    fields: { Name: 'Stephen Cognetta' }
  }, ... */
  // Map responses to an array
  return data.records.map((record: any) => record.fields.Name)
}
