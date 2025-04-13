import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://api.airtable.com/v0/appkHZ2UvU6SouT5y/Events?maxRecords=100&view=Tentative%20upcoming',
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
