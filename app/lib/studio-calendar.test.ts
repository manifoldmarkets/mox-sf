import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sealData } from 'iron-session'
import {
  checkStudioStorage,
  getStudioAccessToken,
  saveStudioConnection,
  STUDIO_OWNER_EMAIL,
} from './studio-calendar'

vi.mock('./env', () => ({
  env: {
    AIRTABLE_API_KEY: 'test-key',
    AIRTABLE_BASE_ID: 'test-base',
    SESSION_SECRET: 'test-session-secret-at-least-32-characters',
    TASKS_GOOGLE_CLIENT_ID: 'test-client',
    TASKS_GOOGLE_CLIENT_SECRET: 'test-secret',
  },
}))
const fetchMock = vi.fn()
beforeEach(() => vi.stubGlobal('fetch', fetchMock.mockReset()))
afterEach(() => vi.unstubAllGlobals())
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

describe('studio Google account credentials', () => {
  it('prepares missing credential storage before consent', async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 404))
      .mockResolvedValueOnce(json({ tables: [] }))
      .mockResolvedValueOnce(json({ id: 'table' }))
      .mockResolvedValueOnce(json({ records: [] }))
    await checkStudioStorage()
    const request = fetchMock.mock.calls[2][1]
    expect(request.method).toBe('POST')
    expect(JSON.parse(request.body).name).toBe('Studio Calendar Connection')
  })
  it('never overwrites an existing table when storage is misconfigured', async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 422))
      .mockResolvedValueOnce(
        json({ tables: [{ name: 'Studio Calendar Connection' }] })
      )
    await expect(checkStudioStorage()).rejects.toThrow('storage is unavailable')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
  it('does not use Google when no account is connected', async () => {
    fetchMock.mockResolvedValueOnce(json({ records: [] }))
    await expect(getStudioAccessToken()).rejects.toThrow('not connected')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('encrypts the refresh token before saving it', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ records: [] }))
      .mockResolvedValueOnce(json({ id: 'rec1' }))
    await saveStudioConnection({
      email: STUDIO_OWNER_EMAIL,
      refreshToken: 'private-refresh',
    })
    const savedBody = fetchMock.mock.calls[1][1].body
    expect(savedBody).not.toContain('private-refresh')
    expect(JSON.parse(savedBody).fields.Credential).toBeTruthy()
  })
  it('rejects a different Google account before storing anything', async () => {
    await expect(
      saveStudioConnection({
        email: 'another@example.com',
        refreshToken: 'token',
      })
    ).rejects.toThrow('Invalid calendar owner')
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('refreshes access using the encrypted owner credential', async () => {
    const Credential = await sealData(
      { email: STUDIO_OWNER_EMAIL, refreshToken: 'private-refresh' },
      {
        password: 'test-session-secret-at-least-32-characters',
        ttl: 0,
      }
    )
    fetchMock
      .mockResolvedValueOnce(
        json({ records: [{ id: 'rec1', fields: { Credential } }] })
      )
      .mockResolvedValueOnce(json({ access_token: 'access' }))
    await expect(getStudioAccessToken()).resolves.toBe('access')
    expect(fetchMock.mock.calls[1][1].body.get('grant_type')).toBe(
      'refresh_token'
    )
  })
  it('fails closed for corrupt stored credentials', async () => {
    fetchMock.mockResolvedValueOnce(
      json({ records: [{ id: 'rec1', fields: { Credential: 'corrupt' } }] })
    )
    await expect(getStudioAccessToken()).rejects.toThrow('Reconnect')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('fails closed on duplicate credentials', async () => {
    fetchMock.mockResolvedValueOnce(
      json({ records: [{ id: '1' }, { id: '2' }] })
    )
    await expect(getStudioAccessToken()).rejects.toThrow('Duplicate')
  })
})
