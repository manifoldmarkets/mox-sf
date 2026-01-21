import { describe, it, expect } from 'vitest'
import {
  escapeAirtableString,
  isValidEmail,
  isValidToken,
} from './airtable-helpers'

describe('escapeAirtableString', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeAirtableString(null as any)).toBe('')
    expect(escapeAirtableString(undefined as any)).toBe('')
  })

  it('returns empty string for non-string input', () => {
    expect(escapeAirtableString(123 as any)).toBe('')
  })

  it('returns input unchanged if no special characters', () => {
    expect(escapeAirtableString('hello world')).toBe('hello world')
  })

  it('escapes backslashes', () => {
    expect(escapeAirtableString('path\\to\\file')).toBe('path\\\\to\\\\file')
  })

  it('escapes single quotes', () => {
    expect(escapeAirtableString("it's working")).toBe("it\\'s working")
  })

  it('escapes double quotes', () => {
    expect(escapeAirtableString('say "hello"')).toBe('say \\"hello\\"')
  })

  it('escapes newlines', () => {
    expect(escapeAirtableString('line1\nline2')).toBe('line1\\nline2')
  })

  it('escapes carriage returns', () => {
    expect(escapeAirtableString('line1\rline2')).toBe('line1\\rline2')
  })

  it('escapes tabs', () => {
    expect(escapeAirtableString('col1\tcol2')).toBe('col1\\tcol2')
  })

  it('escapes multiple special characters', () => {
    expect(escapeAirtableString('it\'s a "test"\nwith\\path')).toBe(
      "it\\'s a \\\"test\\\"\\nwith\\\\path"
    )
  })
})

describe('isValidEmail', () => {
  it('returns false for null/undefined', () => {
    expect(isValidEmail(null as any)).toBe(false)
    expect(isValidEmail(undefined as any)).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isValidEmail(123 as any)).toBe(false)
  })

  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('user.name@example.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('returns false for invalid email', () => {
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('missing@domain')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
  })

  it('returns false for email exceeding max length', () => {
    const longEmail = 'a'.repeat(250) + '@b.com'
    expect(isValidEmail(longEmail)).toBe(false)
  })
})

describe('isValidToken', () => {
  it('returns false for null/undefined', () => {
    expect(isValidToken(null as any)).toBe(false)
    expect(isValidToken(undefined as any)).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(isValidToken(123 as any)).toBe(false)
  })

  it('returns true for valid 64-char hex token', () => {
    const validToken = 'a'.repeat(64)
    expect(isValidToken(validToken)).toBe(true)
  })

  it('returns true for mixed case hex token', () => {
    const validToken = 'aAbBcCdDeEfF0123456789'.padEnd(64, '0')
    expect(isValidToken(validToken)).toBe(true)
  })

  it('returns false for wrong length', () => {
    expect(isValidToken('a'.repeat(63))).toBe(false)
    expect(isValidToken('a'.repeat(65))).toBe(false)
  })

  it('returns false for non-hex characters', () => {
    const invalidToken = 'g'.repeat(64)
    expect(isValidToken(invalidToken)).toBe(false)
  })

  it('respects custom expected length', () => {
    expect(isValidToken('abcd1234', 8)).toBe(true)
    expect(isValidToken('abcd1234', 10)).toBe(false)
  })
})
