import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRecords,
  getRecord,
  updateRecord,
  createRecord,
  findRecords,
  findRecord,
  Tables,
} from './airtable'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('airtable client', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('getRecords', () => {
    it('fetches all records with pagination', async () => {
      const mockRecords = [
        { id: 'rec1', fields: { Name: 'Test 1' } },
        { id: 'rec2', fields: { Name: 'Test 2' } },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: mockRecords }),
      })

      const result = await getRecords(Tables.People)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/People'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      )
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: 'rec1', fields: { Name: 'Test 1' } })
    })

    it('handles pagination with offset', async () => {
      // First page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            records: [{ id: 'rec1', fields: { Name: 'Test 1' } }],
            offset: 'next_page_token',
          }),
      })
      // Second page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            records: [{ id: 'rec2', fields: { Name: 'Test 2' } }],
          }),
      })

      const result = await getRecords(Tables.People)

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(2)
    })

    it('passes query options to URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: [] }),
      })

      await getRecords(Tables.Events, {
        filterByFormula: '{Status} = "Active"',
        fields: ['Name', 'Date'],
        sort: [{ field: 'Date', direction: 'desc' }],
        maxRecords: 10,
        view: 'Grid view',
      })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('filterByFormula=')
      expect(calledUrl).toContain('maxRecords=10')
      expect(calledUrl).toContain('view=')
      expect(calledUrl).toContain('fields%5B%5D=')
      expect(calledUrl).toContain('sort%5B0%5D%5Bfield%5D=')
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Invalid API key' }),
      })

      await expect(getRecords(Tables.People)).rejects.toThrow('Airtable API error')
    })
  })

  describe('getRecord', () => {
    it('fetches a single record by ID', async () => {
      const mockRecord = { id: 'rec123', fields: { Name: 'Test' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecord),
      })

      const result = await getRecord(Tables.People, 'rec123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/People/rec123'),
        expect.anything()
      )
      expect(result).toEqual({ id: 'rec123', fields: { Name: 'Test' } })
    })

    it('returns null on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      })

      const result = await getRecord(Tables.People, 'invalid-id')

      expect(result).toBeNull()
    })

    it('returns null on other errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      })

      const result = await getRecord(Tables.People, 'rec123')

      expect(result).toBeNull()
    })
  })

  describe('updateRecord', () => {
    it('updates a record with given fields', async () => {
      const mockUpdated = { id: 'rec123', fields: { Name: 'Updated' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdated),
      })

      const result = await updateRecord(Tables.People, 'rec123', {
        Name: 'Updated',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/People/rec123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ fields: { Name: 'Updated' } }),
        })
      )
      expect(result).toEqual({ id: 'rec123', fields: { Name: 'Updated' } })
    })

    it('throws on update error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({ error: 'Invalid field' }),
      })

      await expect(
        updateRecord(Tables.People, 'rec123', { Invalid: 'field' })
      ).rejects.toThrow('Airtable update error')
    })
  })

  describe('createRecord', () => {
    it('creates a new record', async () => {
      const mockCreated = { id: 'rec456', fields: { Name: 'New Record' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreated),
      })

      const result = await createRecord(Tables.People, { Name: 'New Record' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/People'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ fields: { Name: 'New Record' } }),
        })
      )
      expect(result).toEqual({ id: 'rec456', fields: { Name: 'New Record' } })
    })

    it('throws on create error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({ error: 'Invalid field' }),
      })

      await expect(
        createRecord(Tables.People, { Invalid: 'field' })
      ).rejects.toThrow('Airtable create error')
    })
  })

  describe('findRecords', () => {
    it('is a convenience wrapper for getRecords with filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            records: [{ id: 'rec1', fields: { Email: 'test@example.com' } }],
          }),
      })

      const result = await findRecords(
        Tables.People,
        '{Email} = "test@example.com"'
      )

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('filterByFormula=')
      expect(result).toHaveLength(1)
    })
  })

  describe('findRecord', () => {
    it('returns the first matching record', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            records: [{ id: 'rec1', fields: { Email: 'test@example.com' } }],
          }),
      })

      const result = await findRecord(
        Tables.People,
        '{Email} = "test@example.com"'
      )

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('maxRecords=1')
      expect(result).toEqual({
        id: 'rec1',
        fields: { Email: 'test@example.com' },
      })
    })

    it('returns null when no records match', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ records: [] }),
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
