'use server'
import { findRecords, Tables } from '@/app/lib/airtable'

interface PersonFields {
  Name?: string
}

export async function getAirtableData() {
  // New formula: anyone invited or to invite
  const formula = `OR(Status="Invited",Status="To Invite")`

  const records = await findRecords<PersonFields>(Tables.People, formula, {
    fields: ['Name'],
  })

  // Map responses to an array, filtering out any undefined names
  return records
    .map((record) => record.fields.Name)
    .filter((name): name is string => !!name)
}
