import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('API Key:', process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing')
    
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
      const errorText = await res.text()
      console.error('Airtable API Error:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText
      })
      throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    console.log('Airtable Response:', JSON.stringify(data, null, 2))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in events API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
