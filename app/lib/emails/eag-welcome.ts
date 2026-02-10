import { env } from '../env'
import { readFileSync } from 'fs'
import { join } from 'path'
import { marked } from 'marked'

export async function sendEAGWelcomeEmail({
  to,
  name,
  doorCode,
}: {
  to: string
  name: string
  doorCode: string
}): Promise<boolean> {
  const resendApiKey = env.RESEND_API_KEY

  if (!resendApiKey) {
    console.error('[EAG Email] No Resend API key found')
    return false
  }

  try {
    // Read the markdown template
    const templatePath = join(process.cwd(), 'app/lib/emails/eag-welcome.md')
    let template = readFileSync(templatePath, 'utf-8')

    // Replace placeholders
    template = template.replace(/\{\{doorCode\}\}/g, doorCode)
    template = template.replace(/\{\{name\}\}/g, name)

    // Convert to HTML using marked
    const htmlBody = await marked(template)

    // Wrap in basic HTML structure with inline styles
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { margin-top: 24px; }
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    strong { background: #f0f0f0; padding: 8px 16px; font-size: 24px; font-family: monospace; display: inline-block; margin: 8px 0; }
    ul { padding-left: 20px; }
    li { margin: 4px 0; }
    a { color: #0066cc; }
  </style>
</head>
<body>
${htmlBody}
</body>
</html>`

    // Plain text fallback is just the markdown with placeholders filled in
    const text = template

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mox SF <portal@account.moxsf.com>',
        reply_to: 'team@moxsf.com',
        to: [to],
        subject: 'Your Mox EAG Day Pass',
        html,
        text,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('[EAG Email] Failed to send:', response.status, responseData)
      return false
    }

    console.log('[EAG Email] Sent successfully to', to, ':', responseData.id)
    return true
  } catch (error) {
    console.error('[EAG Email] Error sending:', error)
    return false
  }
}
