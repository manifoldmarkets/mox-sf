import Airtable, { FieldSet, Records } from 'airtable'
import { unstable_cache } from 'next/cache'

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

/**
 * Cache options for Airtable queries
 * - revalidate: number of seconds to cache, or false to skip caching entirely
 * - tags: cache tags for invalidation
 */
export interface CacheOptions {
  revalidate?: number | false
  tags?: string[]
}

export async function getRecords<T = Record<string, unknown>>(
  table: TableName,
  options: QueryOptions = {},
  cacheOptions: CacheOptions = { revalidate: 60 }
): Promise<AirtableRecord<T>[]> {
  const fetchRecords = async (): Promise<AirtableRecord<T>[]> => {
    const query = getBase()(table).select({
      ...(options.filterByFormula && { filterByFormula: options.filterByFormula }),
      ...(options.fields && { fields: options.fields }),
      ...(options.sort && { sort: options.sort }),
      ...(options.maxRecords && { maxRecords: options.maxRecords }),
      ...(options.view && { view: options.view }),
    })

    const records: AirtableRecord<T>[] = []

    await query.eachPage((pageRecords: Records<FieldSet>, fetchNextPage: () => void) => {
      for (const record of pageRecords) {
        records.push({
          id: record.id,
          fields: record.fields as T,
        })
      }
      fetchNextPage()
    })

    return records
  }

  // If revalidate is false, skip caching entirely
  if (cacheOptions.revalidate === false) {
    return fetchRecords()
  }

  const cacheKey = ['airtable', table, JSON.stringify(options)]

  // Use unstable_cache to cache the results
  const cachedFetch = unstable_cache(fetchRecords, cacheKey, {
    revalidate: cacheOptions.revalidate ?? 60,
    tags: cacheOptions.tags,
  })

  return cachedFetch()
}

/**
 * Fetches a single record by ID.
 *
 * @param table - Table name
 * @param recordId - Airtable record ID
 * @param cacheOptions - Cache configuration
 * @returns The record or null if not found
 */
export async function getRecord<T = Record<string, unknown>>(
  table: TableName,
  recordId: string,
  cacheOptions: CacheOptions = { revalidate: 60 }
): Promise<AirtableRecord<T> | null> {
  const fetchRecord = async (): Promise<AirtableRecord<T> | null> => {
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

  // If revalidate is false, skip caching entirely
  if (cacheOptions.revalidate === false) {
    return fetchRecord()
  }

  const cacheKey = ['airtable', table, recordId]

  const cachedFetch = unstable_cache(fetchRecord, cacheKey, {
    revalidate: cacheOptions.revalidate ?? 60,
    tags: cacheOptions.tags,
  })

  return cachedFetch()
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
  const record = await getBase()(table).update(recordId, fields as Partial<FieldSet>)
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
 * @param cacheOptions - Cache configuration
 * @returns Array of matching records
 */
export async function findRecords<T = Record<string, unknown>>(
  table: TableName,
  filterByFormula: string,
  options: Omit<QueryOptions, 'filterByFormula'> = {},
  cacheOptions: CacheOptions = { revalidate: 60 }
): Promise<AirtableRecord<T>[]> {
  return getRecords<T>(table, { ...options, filterByFormula }, cacheOptions)
}

/**
 * Finds a single record matching a filter formula.
 *
 * @param table - Table name
 * @param filterByFormula - Airtable formula
 * @param options - Additional query options
 * @param cacheOptions - Cache configuration
 * @returns The first matching record or null
 */
export async function findRecord<T = Record<string, unknown>>(
  table: TableName,
  filterByFormula: string,
  options: Omit<QueryOptions, 'filterByFormula'> = {},
  cacheOptions: CacheOptions = { revalidate: 60 }
): Promise<AirtableRecord<T> | null> {
  const records = await findRecords<T>(
    table,
    filterByFormula,
    { ...options, maxRecords: 1 },
    cacheOptions
  )
  return records[0] || null
}

// Re-export the escape helper for use in formulas
export { escapeAirtableString } from './airtable-helpers'
