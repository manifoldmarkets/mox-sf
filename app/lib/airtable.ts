import Airtable, { FieldSet, Records } from 'airtable'

// Lazily initialize Airtable base to allow for testing with mocks
let _base: ReturnType<Airtable['base']> | null = null

function getBase() {
  if (!_base) {
    _base = new Airtable({
      apiKey: process.env.AIRTABLE_WRITE_KEY,
    }).base(process.env.AIRTABLE_BASE_ID!)
  }
  return _base
}

// Table names as constants to avoid typos
export const Tables = {
  People: 'People',
  Events: 'Events',
  Orgs: 'Orgs',
  DayPasses: 'Day Passes',
} as const

export type TableName = (typeof Tables)[keyof typeof Tables]

// Generic type for Airtable records - use Record<string, unknown> for flexibility
export interface AirtableRecord<T = Record<string, unknown>> {
  id: string
  fields: T
}

/**
 * Query options for select operations
 */
export interface QueryOptions {
  filterByFormula?: string
  fields?: string[]
  sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>
  maxRecords?: number
  view?: string
}

export async function getRecords<T = Record<string, unknown>>(
  table: TableName,
  options: QueryOptions = {}
): Promise<AirtableRecord<T>[]> {
  const query = getBase()(table).select({
    ...(options.filterByFormula && {
      filterByFormula: options.filterByFormula,
    }),
    ...(options.fields && { fields: options.fields }),
    ...(options.sort && { sort: options.sort }),
    ...(options.maxRecords && { maxRecords: options.maxRecords }),
    ...(options.view && { view: options.view }),
  })

  const records: AirtableRecord<T>[] = []

  await query.eachPage(
    (pageRecords: Records<FieldSet>, fetchNextPage: () => void) => {
      for (const record of pageRecords) {
        records.push({
          id: record.id,
          fields: record.fields as T,
        })
      }
      fetchNextPage()
    }
  )

  return records
}

/**
 * Fetches a single record by ID.
 *
 * @param table - Table name
 * @param recordId - Airtable record ID
 * @returns The record or null if not found
 */
export async function getRecord<T = Record<string, unknown>>(
  table: TableName,
  recordId: string
): Promise<AirtableRecord<T> | null> {
  try {
    const record = await getBase()(table).find(recordId)
    return {
      id: record.id,
      fields: record.fields as T,
    }
  } catch (error) {
    console.error(`Error fetching record ${recordId} from ${table}:`, error)
    return null
  }
}

/**
 * Updates a record. This operation is NOT cached.
 *
 * @param table - Table name
 * @param recordId - Airtable record ID
 * @param fields - Fields to update
 * @returns The updated record
 */
export async function updateRecord<T = Record<string, unknown>>(
  table: TableName,
  recordId: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  const record = await getBase()(table).update(
    recordId,
    fields as Partial<FieldSet>
  )
  return {
    id: record.id,
    fields: record.fields as T,
  }
}

/**
 * Creates a new record. This operation is NOT cached.
 *
 * @param table - Table name
 * @param fields - Fields for the new record
 * @returns The created record
 */
export async function createRecord<T = Record<string, unknown>>(
  table: TableName,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  const record = await getBase()(table).create(fields as Partial<FieldSet>)
  return {
    id: record.id,
    fields: record.fields as T,
  }
}

/**
 * Finds records matching a filter formula.
 * Convenience wrapper around getRecords for simple queries.
 *
 * @param table - Table name
 * @param filterByFormula - Airtable formula
 * @param options - Additional query options
 * @returns Array of matching records
 */
export async function findRecords<T = Record<string, unknown>>(
  table: TableName,
  filterByFormula: string,
  options: Omit<QueryOptions, 'filterByFormula'> = {}
): Promise<AirtableRecord<T>[]> {
  return getRecords<T>(table, { ...options, filterByFormula })
}

/**
 * Finds a single record matching a filter formula.
 *
 * @param table - Table name
 * @param filterByFormula - Airtable formula
 * @param options - Additional query options
 * @returns The first matching record or null
 */
export async function findRecord<T = Record<string, unknown>>(
  table: TableName,
  filterByFormula: string,
  options: Omit<QueryOptions, 'filterByFormula'> = {}
): Promise<AirtableRecord<T> | null> {
  const records = await findRecords<T>(table, filterByFormula, {
    ...options,
    maxRecords: 1,
  })
  return records[0] || null
}

// Re-export the escape helper for use in formulas
export { escapeAirtableString } from './airtable-helpers'
