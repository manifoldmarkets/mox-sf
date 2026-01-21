import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/session'
import { findRecords, Tables } from '@/app/lib/airtable'

// Normalize string by removing accents/diacritics
function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

interface PersonFields {
  Name?: string
  Email?: string
}

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session.isLoggedIn || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ members: [] })
  }

  try {
    // Split query into words and search for any of them
    const words = query
      .trim()
      .split(/\s+/)
      .filter((w) => w.length >= 2)

    if (words.length === 0) {
      return NextResponse.json({ members: [] })
    }

    // Build OR conditions for each word in the query
    const searchConditions = words
      .map((word) => {
        const escapedWord = word.replace(/"/g, '\\"')
        return `OR(
        SEARCH(LOWER("${escapedWord}"), LOWER({Name})),
        SEARCH(LOWER("${escapedWord}"), LOWER({Email}))
      )`
      })
      .join(',')

    const formula = `AND(
      {Tier} != 'Staff',
      {Email} != '',
      OR(${searchConditions})
    )`

    const records = await findRecords<PersonFields>(Tables.People, formula, {
      fields: ['Name', 'Email'],
      sort: [{ field: 'Name', direction: 'asc' }],
    })

    // Now filter with normalized string matching and rank by relevance
    const normalizedQuery = normalizeString(query.toLowerCase())

    const members = records
      .map((record) => {
        const name = record.fields.Name || ''
        const email = record.fields.Email || ''
        const normalizedName = normalizeString(name.toLowerCase())
        const normalizedEmail = normalizeString(email.toLowerCase())

        // Calculate relevance score (higher is better)
        let score = 0

        // Exact match (case-insensitive, accent-insensitive) - highest priority
        if (normalizedName === normalizedQuery) {
          score += 1000
        }
        // Starts with query - high priority
        else if (normalizedName.startsWith(normalizedQuery)) {
          score += 500
        }
        // Contains query as whole word - medium priority
        else if (
          normalizedName.includes(` ${normalizedQuery}`) ||
          normalizedName.includes(`${normalizedQuery} `)
        ) {
          score += 250
        }
        // Contains query anywhere - lower priority
        else if (normalizedName.includes(normalizedQuery)) {
          score += 100
        }

        // Email matches (lower priority than name)
        if (normalizedEmail.startsWith(normalizedQuery)) {
          score += 50
        } else if (normalizedEmail.includes(normalizedQuery)) {
          score += 25
        }

        // Bonus: earlier position of match
        const nameIndex = normalizedName.indexOf(normalizedQuery)
        if (nameIndex !== -1) {
          score += Math.max(0, 50 - nameIndex)
        }

        return {
          id: record.id,
          name,
          email,
          score,
        }
      })
      .filter((member) => member.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(({ id, name, email }) => ({ id, name, email }))

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error searching members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
