import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://api.airtable.com/v0/appNJwWpcxwIbW89F/Projects?view=Grid%20view',
      {
        headers: {
          Authorization: `Bearer ${process.env.AI4E_API_KEY}`,
        },
        cache: 'no-store',
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
