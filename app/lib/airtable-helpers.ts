/**
 * Safely escapes a string for use in Airtable formulas to prevent injection attacks.
 *
 * Airtable formulas support many operators and functions that could be exploited
 * if user input is inserted directly. This function escapes all special characters.
 *
 * @param value - The value to escape
 * @returns Escaped string safe for use in formulas
 */
export function escapeAirtableString(value: string): string {
  if (!value || typeof value !== 'string') {
    return ''
  }

  // Escape backslashes first (must be done before escaping other characters)
  let escaped = value.replace(/\\/g, '\\\\')

  // Escape single quotes (used to delimit strings in formulas)
  escaped = escaped.replace(/'/g, "\\'")

  // Escape double quotes
  escaped = escaped.replace(/"/g, '\\"')

  // Escape newlines and other control characters
  escaped = escaped.replace(/\n/g, '\\n')
  escaped = escaped.replace(/\r/g, '\\r')
  escaped = escaped.replace(/\t/g, '\\t')

  return escaped
}

/**
 * Validates an email address format.
 *
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254 // RFC 5321
}

/**
 * Validates a token format (hexadecimal string).
 *
 * @param token - Token to validate
 * @param expectedLength - Expected length of hex string (default 64 for 32 bytes)
 * @returns true if valid token format
 */
export function isValidToken(
  token: string,
  expectedLength: number = 64
): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  // Token should be hex string of expected length
  const hexRegex = new RegExp(`^[a-f0-9]{${expectedLength}}$`, 'i')
  return hexRegex.test(token)
}
