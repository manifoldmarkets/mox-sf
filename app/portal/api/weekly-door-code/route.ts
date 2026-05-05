import { getSession } from '@/app/lib/session'
import { env } from '@/app/lib/env'

let cachedToken: string | null = null
let tokenExpiresAt: number = 0
const TOKEN_TTL_MS = 25 * 60 * 1000

let cachedCode: string | null = null
let codeExpiresAt: number = 0
const CODE_TTL_MS = 5 * 60 * 1000

async function getVerkadaToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  try {
    const tokenRes = await fetch('https://api.verkada.com/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': env.VERKADA_MEMBER_KEY,
      },
    })

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text()
      console.error(
        '[Weekly Door Code] Failed to get Verkada token:',
        tokenRes.status,
        errorText
      )
      return null
    }

    const { token } = await tokenRes.json()
    cachedToken = token
    tokenExpiresAt = Date.now() + TOKEN_TTL_MS
    return token
  } catch (error) {
    console.error('[Weekly Door Code] Error getting token:', error)
    return null
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!env.VERKADA_WEEKLY_ACCESS_USER_ID) {
      return Response.json({ code: null })
    }

    if (cachedCode && Date.now() < codeExpiresAt) {
      return Response.json({ code: cachedCode })
    }

    const token = await getVerkadaToken()
    if (!token) {
      return Response.json({ code: null })
    }

    const userRes = await fetch(
      `https://api.verkada.com/access/v1/access_users/user?user_id=${encodeURIComponent(env.VERKADA_WEEKLY_ACCESS_USER_ID)}`,
      {
        headers: {
          accept: 'application/json',
          'x-verkada-auth': token,
        },
      }
    )

    if (!userRes.ok) {
      const errorText = await userRes.text()
      console.error(
        '[Weekly Door Code] Failed to fetch weekly access user:',
        userRes.status,
        errorText
      )
      return Response.json({ code: null })
    }

    const userData = await userRes.json()
    const code = userData.entry_code || null

    if (code) {
      cachedCode = code
      codeExpiresAt = Date.now() + CODE_TTL_MS
    }

    return Response.json({ code })
  } catch (error) {
    console.error('[Weekly Door Code] Error:', error)
    return Response.json({ code: null })
  }
}
