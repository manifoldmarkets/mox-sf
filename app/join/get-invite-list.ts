'use server'
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
export async function getAirtableData() {
  // const formula =
  //   `AND(` +
  //   `OR(Priority="Amazing",Priority="Great",Priority="Probably great"),` +
  //   `OR(Status="Invited",Status="Toured",Status="Applied",Status="To Invite"))`

  // New formula: anyone invited or to invite
  const formula = `OR(Status="Invited",Status="To Invite")`
  const encodedFormula = encodeURIComponent(formula)

  let allRecords: any[] = []
  let offset: string | undefined

  // Fetch all pages of results
  // Airtable returns max 100 records per request, so we need to paginate
  while (true) {
    const offsetParam = offset ? `&offset=${offset}` : ''
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People?fields%5B%5D=Name&filterByFormula=${encodedFormula}${offsetParam}`,
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

    allRecords = allRecords.concat(data.records)

    // If there's an offset, there are more records to fetch
    if (data.offset) {
      offset = data.offset
    } else {
      // No more pages
      break
    }
  }

  // Map responses to an array
  return allRecords.map((record: any) => record.fields.Name)
}
