import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/app/lib/airtable', () => ({
  createRecord: vi.fn().mockResolvedValue({ id: 'test-record' }),
  Tables: { GefApplications: 'GEF Applications' },
}))
vi.mock('@/app/lib/airtable-helpers', () => ({
  isValidEmail: (email: string) => email.includes('@'),
}))
vi.mock('@/app/lib/email', async () => import('../../../lib/email'))

import { POST } from './route'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it.each([
  ['2026-10-16T12:00:00-07:00', true],
  ['2026-11-01T23:59:59.999-08:00', true],
  ['2026-11-02T00:00:00-08:00', false],
  ['2026-12-01T12:00:00-08:00', false],
])('sends the correct recipients at %s', async (now, includeCc) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(now))
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 'test-email' }),
  })
  vi.stubGlobal('fetch', fetchMock)
  const response = await POST(
    new Request('https://moxsf.com/gef/api/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Applicant',
        email: 'applicant@example.com',
        country: 'UK',
        focus: 'Research',
        background: 'Researcher',
        proud: 'My work',
        intentions: 'Collaborate',
      }),
    })
  )
  expect(response.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledOnce()
  const payload = JSON.parse(fetchMock.mock.calls[0][1].body)
  expect(payload.to).toEqual(['robin@moxsf.com', 'team@moxsf.com'])
  expect(payload.reply_to).toBe('applicant@example.com')
  expect(payload.subject).toBe('GEF interest: Test Applicant')
  if (includeCc) expect(payload.cc).toEqual(['carolina@moxsf.com'])
  else expect(payload).not.toHaveProperty('cc')
})
