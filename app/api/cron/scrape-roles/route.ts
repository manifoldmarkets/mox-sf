import {
  createRecords,
  findRecords,
  updateRecord,
  Tables,
} from '@/app/lib/airtable'
import { extractJson, isClaudeConfigured } from '@/app/lib/claude'
import { diffRoles, htmlToText, type ScrapedRole } from '@/app/lib/roles'
import { ptDateString } from '@/app/lib/checkins'
import type { RoleFields } from '@/app/lib/careers'
import { env } from '@/app/lib/env'

/**
 * Weekly cron: fetch each org's Careers URL, extract current openings with
 * Claude, and sync them into the Roles table — new roles created as Open,
 * still-listed roles get Last verified bumped, vanished scraper-sourced
 * roles are marked Stale.
 *
 * Query params (for manual runs):
 *   ?org=recXXX  only scrape one org
 *   ?dry=1       extract + diff but don't write to Airtable
 */

export const maxDuration = 300

const ROLE_TAGS = [
  'AI Safety',
  'Research',
  'Engineering',
  'Policy',
  'Operations',
  'Comms',
  'Design',
  'Other',
]

const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          url: { type: ['string', 'null'] },
          location: { type: ['string', 'null'] },
          tags: { type: 'array', items: { type: 'string', enum: ROLE_TAGS } },
        },
        required: ['title', 'url', 'location', 'tags'],
        additionalProperties: false,
      },
    },
  },
  required: ['roles'],
  additionalProperties: false,
}

interface OrgFields {
  Name?: string
  'Careers URL'?: string
}

async function fetchCareersPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'MoxJobsBot/1.0 (+https://moxsf.com/jobs)' },
      signal: AbortSignal.timeout(20000),
      redirect: 'follow',
    })
    if (!res.ok) {
      console.error(`[Cron scrape-roles] ${url} returned ${res.status}`)
      return null
    }
    return await res.text()
  } catch (error) {
    console.error(`[Cron scrape-roles] Failed to fetch ${url}:`, error)
    return null
  }
}

async function extractRoles(
  orgName: string,
  pageUrl: string,
  pageText: string
): Promise<ScrapedRole[] | null> {
  const result = await extractJson<{ roles: ScrapedRole[] }>({
    system:
      'You extract job openings from careers-page text. Only include real, currently-open individual roles (not "general applications" or newsletter prompts). Resolve relative hrefs against the page URL; if a role has no link, use null.',
    prompt: `Careers page for ${orgName} (${pageUrl}). Extract the open roles.\n\nPage text (links appear as [href:...]):\n\n${pageText}`,
    schema: EXTRACTION_SCHEMA,
  })
  return result?.roles ?? null
}

export async function GET(request: Request) {
  const startTime = Date.now()

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    console.error('[Cron scrape-roles] Unauthorized request')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClaudeConfigured()) {
    console.warn('[Cron scrape-roles] ANTHROPIC_API_KEY not set; skipping')
    return Response.json({ success: true, skipped: 'no ANTHROPIC_API_KEY' })
  }

  const url = new URL(request.url)
  const dryRun = url.searchParams.get('dry') === '1'
  const onlyOrg = url.searchParams.get('org')

  try {
    let orgs = await findRecords<OrgFields>(Tables.Orgs, `{Careers URL}!=""`, {
      fields: ['Name', 'Careers URL'],
    })
    if (onlyOrg) {
      orgs = orgs.filter((org) => org.id === onlyOrg)
    }
    console.log(
      `[Cron scrape-roles] Scraping ${orgs.length} org careers pages...`
    )

    // One fetch for all tracked roles; filtered per org below (the Org field
    // returns linked record IDs via the API, but not in formulas).
    const allTracked = await findRecords<RoleFields>(Tables.Roles, '', {
      fields: ['Title', 'Status', 'Source', 'Org'],
    })

    const today = ptDateString(new Date())
    const results: Record<string, unknown>[] = []

    for (const org of orgs) {
      const orgName = org.fields.Name || org.id
      const careersUrl = org.fields['Careers URL']!

      const html = await fetchCareersPage(careersUrl)
      if (!html) {
        results.push({ org: orgName, error: 'fetch failed' })
        continue
      }

      const scraped = await extractRoles(orgName, careersUrl, htmlToText(html))
      if (!scraped) {
        results.push({ org: orgName, error: 'extraction failed' })
        continue
      }

      const tracked = allTracked.filter((record) =>
        record.fields.Org?.includes(org.id)
      )
      const diff = diffRoles(
        scraped,
        tracked.map((record) => ({
          id: record.id,
          title: record.fields.Title || '',
          status: record.fields.Status || '',
          source: record.fields.Source || '',
        }))
      )

      if (!dryRun) {
        if (diff.toCreate.length > 0) {
          await createRecords<RoleFields>(
            Tables.Roles,
            diff.toCreate.map((role) => ({
              Title: role.title,
              Org: [org.id],
              URL: role.url || careersUrl,
              Location: role.location || undefined,
              Tags: role.tags,
              Status: 'Open',
              Source: 'Careers page',
              Posted: today,
              'Last verified': today,
            })),
            { typecast: true }
          )
        }
        for (const role of diff.toVerify) {
          await updateRecord<RoleFields>(Tables.Roles, role.id, {
            'Last verified': today,
            // A role that reappeared after going stale is open again.
            ...(role.status === 'Stale' && role.source === 'Careers page'
              ? { Status: 'Open' }
              : {}),
          })
        }
        for (const role of diff.toMarkStale) {
          await updateRecord<RoleFields>(Tables.Roles, role.id, {
            Status: 'Stale',
          })
        }
      }

      results.push({
        org: orgName,
        scraped: scraped.length,
        created: diff.toCreate.map((r) => r.title),
        verified: diff.toVerify.length,
        markedStale: diff.toMarkStale.map((r) => r.title),
      })
    }

    const duration = Date.now() - startTime
    console.log(`[Cron scrape-roles] Done in ${duration}ms`)
    return Response.json({
      success: true,
      dryRun,
      results,
      durationMs: duration,
    })
  } catch (error) {
    console.error('[Cron scrape-roles] Error:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
