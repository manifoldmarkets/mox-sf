import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock functions that will be shared
const mockFind = vi.fn()
const mockUpdate = vi.fn()
const mockCreate = vi.fn()
const mockEachPage = vi.fn()
const mockSelect = vi.fn((_options?: unknown) => ({
  eachPage: mockEachPage,
}))

// Mock airtable with a factory that returns our mocks - must be before any imports
vi.mock('airtable', () => {
  const mockTableFn = (_tableName: string) => ({
    select: (options: unknown) => {
      mockSelect(options)
      return { eachPage: mockEachPage }
    },
    find: mockFind,
    update: mockUpdate,
    create: mockCreate,
  })

  class MockAirtable {
    constructor(_options?: { apiKey?: string }) {
      // Accept options but ignore them in test
    }
    base(_baseId: string) {
      return mockTableFn
    }
  }

  return { default: MockAirtable, FieldSet: {}, Records: {} }
})

// Mock next/cache before importing the module
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
}))

// Import after mocking
import {
  getRecords,
  getRecord,
  updateRecord,
  createRecord,
  findRecords,
  findRecord,
  Tables,
} from './airtable'

describe('airtable client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecords', () => {
    it('fetches all records with pagination', async () => {
      const mockRecords = [
        { id: 'rec1', fields: { Name: 'Test 1' } },
        { id: 'rec2', fields: { Name: 'Test 2' } },
      ]

      mockEachPage.mockImplementation((callback) => {
        callback(mockRecords, () => {})
        return Promise.resolve()
      })

      const result = await getRecords(Tables.People)

      expect(mockSelect).toHaveBeenCalled()
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: 'rec1', fields: { Name: 'Test 1' } })
    })

    it('passes query options to select', async () => {
      mockEachPage.mockImplementation((callback) => {
        callback([], () => {})
        return Promise.resolve()
      })

      await getRecords(Tables.Events, {
        filterByFormula: '{Status} = "Active"',
        fields: ['Name', 'Date'],
        sort: [{ field: 'Date', direction: 'desc' }],
        maxRecords: 10,
        view: 'Grid view',
      })

      expect(mockSelect).toHaveBeenCalledWith({
        filterByFormula: '{Status} = "Active"',
        fields: ['Name', 'Date'],
        sort: [{ field: 'Date', direction: 'desc' }],
        maxRecords: 10,
        view: 'Grid view',
      })
    })
  })

  describe('getRecord', () => {
    it('fetches a single record by ID', async () => {
      const mockRecord = { id: 'rec123', fields: { Name: 'Test' } }
      mockFind.mockResolvedValue(mockRecord)

      const result = await getRecord(Tables.People, 'rec123')

      expect(mockFind).toHaveBeenCalledWith('rec123')
      expect(result).toEqual({ id: 'rec123', fields: { Name: 'Test' } })
    })

    it('returns null on error', async () => {
      mockFind.mockRejectedValue(new Error('Not found'))

      const result = await getRecord(Tables.People, 'invalid-id')

      expect(result).toBeNull()
    })
  })

  describe('updateRecord', () => {
    it('updates a record with given fields', async () => {
      const mockUpdated = { id: 'rec123', fields: { Name: 'Updated' } }
      mockUpdate.mockResolvedValue(mockUpdated)

      const result = await updateRecord(Tables.People, 'rec123', {
        Name: 'Updated',
      })

      expect(mockUpdate).toHaveBeenCalledWith('rec123', { Name: 'Updated' })
      expect(result).toEqual({ id: 'rec123', fields: { Name: 'Updated' } })
    })
  })

  describe('createRecord', () => {
    it('creates a new record', async () => {
      const mockCreated = { id: 'rec456', fields: { Name: 'New Record' } }
      mockCreate.mockResolvedValue(mockCreated)

      const result = await createRecord(Tables.People, { Name: 'New Record' })

      expect(mockCreate).toHaveBeenCalledWith({ Name: 'New Record' })
      expect(result).toEqual({ id: 'rec456', fields: { Name: 'New Record' } })
    })
  })

  describe('findRecords', () => {
    it('is a convenience wrapper for getRecords with filter', async () => {
      mockEachPage.mockImplementation((callback) => {
        callback(
          [{ id: 'rec1', fields: { Email: 'test@example.com' } }],
          () => {}
        )
        return Promise.resolve()
      })

      const result = await findRecords(
        Tables.People,
        '{Email} = "test@example.com"'
      )

      expect(mockSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          filterByFormula: '{Email} = "test@example.com"',
        })
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('findRecord', () => {
    it('returns the first matching record', async () => {
      mockEachPage.mockImplementation((callback) => {
        callback(
          [{ id: 'rec1', fields: { Email: 'test@example.com' } }],
          () => {}
        )
        return Promise.resolve()
      })

      const result = await findRecord(
        Tables.People,
        '{Email} = "test@example.com"'
      )

      expect(mockSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          filterByFormula: '{Email} = "test@example.com"',
          maxRecords: 1,
        })
      )
      expect(result).toEqual({
        id: 'rec1',
        fields: { Email: 'test@example.com' },
      })
    })

    it('returns null when no records match', async () => {
      mockEachPage.mockImplementation((callback) => {
        callback([], () => {})
        return Promise.resolve()
      })

      const result = await findRecord(
        Tables.People,
        '{Email} = "nonexistent@example.com"'
      )

      expect(result).toBeNull()
    })
  })
})

describe('Tables constant', () => {
  it('has correct table names', () => {
    expect(Tables.People).toBe('People')
    expect(Tables.Events).toBe('Events')
    expect(Tables.Orgs).toBe('Orgs')
    expect(Tables.DayPasses).toBe('Day Passes')
  })
})
