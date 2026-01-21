import { NextResponse } from 'next/server'
import { env } from '@/app/lib/env'

export async function GET() {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${env.AI4E_AIRTABLE_BASE_ID}/Projects?view=Grid%20view`,
      {
        headers: {
          Authorization: `Bearer ${env.AI4E_API_KEY}`,
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      throw new Error('Failed to fetch projects')
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
