import { env } from './env'

interface EmailOptions {
  to: string | string[]
  subject: string
  text: string
  from?: string
}

const DEFAULT_FROM = 'Member Portal <portal@account.moxsf.com>'

/**
 * Send an email using Resend API
 */
export async function sendEmail({
  to,
  subject,
  text,
  from = DEFAULT_FROM,
}: EmailOptions): Promise<boolean> {
  const resendApiKey = env.RESEND_API_KEY

  if (!resendApiKey) {
    console.error('[Email] No Resend API key found')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('[Email] Failed to send:', response.status, responseData)
      return false
    }

    console.log('[Email] Sent successfully:', responseData.id)
    return true
  } catch (error) {
    console.error('[Email] Error sending:', error)
    return false
  }
}
