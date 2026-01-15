import Anthropic from '@anthropic-ai/sdk'
import {
  format,
  parse,
  addWeeks,
  addDays,
  nextFriday,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextSaturday,
  nextSunday,
  startOfDay,
  setHours,
  setMinutes,
  isBefore,
  addMonths,
} from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { escapeAirtableString } from './airtable-helpers'

const TIMEZONE = 'America/Los_Angeles'
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_FORM_BASE_URL = `https://airtable.com/${AIRTABLE_BASE_ID}/pagHlAqA2JFG7nNP2/form`

export interface EventProposal {
  name: string
  startDate: Date
  endDate?: Date
  description?: string
  url?: string
  hostDiscordUsername: string // Discord username (e.g., "rachel_shu")
  hostDiscordId: string // Discord user ID
  hostDisplayName: string // Display name for UI (e.g., "Rachel")
  visibility: 'Public' | 'Members' | 'Private'
  isRecurring: boolean
  recurrencePattern?: string
  occurrences?: Date[] // For recurring events, all the start dates
}

export interface ParsedEventRequest {
  proposals: EventProposal[]
  needsMoreInfo: boolean
  questions?: string[]
  useFormInstead: boolean
  formUrl?: string
  rawParsed: {
    eventName?: string
    inferredFromExisting?: boolean
    dates?: string[]
    times?: { start: string; end?: string }
    recurrence?: string
    visibility?: string
  }
}

// Parse natural language event request using Claude
export async function parseEventRequest(
  request: string,
  hostDiscordUsername: string,
  hostDiscordId: string,
  hostDisplayName: string,
  existingEventNames: string[]
): Promise<ParsedEventRequest> {
  const anthropic = new Anthropic({
    apiKey: process.env.MOX_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  })

  const now = new Date()
  const nowPT = toZonedTime(now, TIMEZONE)
  const currentDateStr = formatInTimeZone(now, TIMEZONE, 'EEEE, MMMM d, yyyy')
  const currentTimeStr = formatInTimeZone(now, TIMEZONE, 'h:mm a')

  const existingEventsContext =
    existingEventNames.length > 0
      ? `\nExisting event names in the system (user may be referring to one of these):\n${existingEventNames.slice(0, 50).join('\n')}`
      : ''

  const systemPrompt = `You are parsing event requests for a community space calendar. Extract structured event information from natural language.

Current date/time: ${currentDateStr} at ${currentTimeStr} PT (Pacific Time)
All times should be interpreted as Pacific Time unless explicitly stated otherwise.
${existingEventsContext}

Return a JSON object with these fields:
{
  "eventName": "string - the name of the event. If they reference 'my X event' and it matches an existing event, use that name",
  "inferredFromExisting": "boolean - true if the event name was matched to an existing event",
  "startDate": "string - ISO date YYYY-MM-DD",
  "startTime": "string - 24h format HH:MM",
  "endTime": "string or null - 24h format HH:MM, if not specified assume 2 hours after start",
  "recurrence": "string or null - one of: 'weekly', 'biweekly', 'monthly', or null for one-time",
  "recurrenceDay": "string or null - day of week for recurring events",
  "recurrenceEndDate": "string or null - ISO date, max 3 months from now",
  "visibility": "string - 'Public', 'Members', or 'Private'. Default to 'Public' if not specified",
  "url": "string or null - if they mention a link",
  "description": "string or null - if they provide a description",
  "needsMoreInfo": "boolean - true if critical info is missing (like event name for new events)",
  "questions": ["array of questions to ask if needsMoreInfo is true"],
  "tooComplicated": "boolean - true if the request is too complex to parse reliably"
}

Guidelines:
- "next Friday" means the upcoming Friday (not today if today is Friday)
- "every Friday" means weekly recurring on Fridays, starting from the next Friday
- "my cafe event" or "my yoga class" - try to match to existing events
- If no end time given, assume 2 hours after start
- Cap recurring events at 3 months maximum
- If the request is vague about a NEW event name, set needsMoreInfo: true
- If the request involves complex scheduling or edits, set tooComplicated: true`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Parse this event request: "${request}"`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let parsed
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content.text]
    parsed = JSON.parse(jsonMatch[1] || content.text)
  } catch {
    console.error('Failed to parse Claude response:', content.text)
    return {
      proposals: [],
      needsMoreInfo: true,
      questions: ["I couldn't understand that request. Could you rephrase it?"],
      useFormInstead: false,
      rawParsed: {},
    }
  }

  // If too complicated, return form link
  if (parsed.tooComplicated) {
    const formUrl = generatePrefillUrl({
      name: parsed.eventName,
      discordUsername: hostDiscordUsername,
      visibility: parsed.visibility,
    })
    return {
      proposals: [],
      needsMoreInfo: false,
      useFormInstead: true,
      formUrl,
      rawParsed: parsed,
    }
  }

  // If needs more info
  if (parsed.needsMoreInfo) {
    return {
      proposals: [],
      needsMoreInfo: true,
      questions: parsed.questions || ['Could you provide more details about the event?'],
      useFormInstead: false,
      rawParsed: parsed,
    }
  }

  // Build proposals
  const proposals: EventProposal[] = []

  // Parse the start date and time
  const startDateStr = parsed.startDate
  const startTimeStr = parsed.startTime || '19:00' // Default 7pm

  let baseStartDate: Date
  try {
    const [hours, minutes] = startTimeStr.split(':').map(Number)
    baseStartDate = parse(startDateStr, 'yyyy-MM-dd', new Date())
    baseStartDate = setHours(baseStartDate, hours)
    baseStartDate = setMinutes(baseStartDate, minutes)
  } catch {
    return {
      proposals: [],
      needsMoreInfo: true,
      questions: ['I had trouble understanding the date/time. Could you clarify?'],
      useFormInstead: false,
      rawParsed: parsed,
    }
  }

  // Calculate end time
  let baseEndDate: Date | undefined
  if (parsed.endTime) {
    const [endHours, endMinutes] = parsed.endTime.split(':').map(Number)
    baseEndDate = new Date(baseStartDate)
    baseEndDate = setHours(baseEndDate, endHours)
    baseEndDate = setMinutes(baseEndDate, endMinutes)
  } else {
    // Default 2 hours
    baseEndDate = new Date(baseStartDate.getTime() + 2 * 60 * 60 * 1000)
  }

  // Handle recurring events
  if (parsed.recurrence) {
    const occurrences: Date[] = []
    const maxDate = addMonths(new Date(), 3) // Cap at 3 months
    let currentDate = new Date(baseStartDate)

    // Find the first occurrence
    if (parsed.recurrenceDay) {
      currentDate = getNextDayOfWeek(currentDate, parsed.recurrenceDay)
      // Preserve the time
      currentDate = setHours(currentDate, baseStartDate.getHours())
      currentDate = setMinutes(currentDate, baseStartDate.getMinutes())
    }

    // Generate all occurrences
    while (isBefore(currentDate, maxDate) && occurrences.length < 13) {
      occurrences.push(new Date(currentDate))

      switch (parsed.recurrence) {
        case 'weekly':
          currentDate = addWeeks(currentDate, 1)
          break
        case 'biweekly':
          currentDate = addWeeks(currentDate, 2)
          break
        case 'monthly':
          currentDate = addMonths(currentDate, 1)
          break
        default:
          currentDate = addWeeks(currentDate, 1)
      }
    }

    // Calculate duration for end dates
    const duration = baseEndDate
      ? baseEndDate.getTime() - baseStartDate.getTime()
      : 2 * 60 * 60 * 1000

    // Create proposal for recurring event
    proposals.push({
      name: parsed.eventName || 'Untitled Event',
      startDate: occurrences[0],
      endDate: new Date(occurrences[0].getTime() + duration),
      description: parsed.description,
      url: parsed.url,
      hostDiscordUsername,
      hostDiscordId,
      hostDisplayName,
      visibility: parsed.visibility || 'Public',
      isRecurring: true,
      recurrencePattern: `${parsed.recurrence} on ${parsed.recurrenceDay || format(baseStartDate, 'EEEE')}s`,
      occurrences: occurrences.map((d) => new Date(d)),
    })
  } else {
    // Single event
    proposals.push({
      name: parsed.eventName || 'Untitled Event',
      startDate: baseStartDate,
      endDate: baseEndDate,
      description: parsed.description,
      url: parsed.url,
      hostDiscordUsername,
      hostDiscordId,
      hostDisplayName,
      visibility: parsed.visibility || 'Public',
      isRecurring: false,
    })
  }

  return {
    proposals,
    needsMoreInfo: false,
    useFormInstead: false,
    rawParsed: {
      eventName: parsed.eventName,
      inferredFromExisting: parsed.inferredFromExisting,
      dates: proposals[0]?.occurrences?.map((d) => format(d, 'yyyy-MM-dd')) || [
        format(baseStartDate, 'yyyy-MM-dd'),
      ],
      times: { start: startTimeStr, end: parsed.endTime },
      recurrence: parsed.recurrence,
      visibility: parsed.visibility,
    },
  }
}

function getNextDayOfWeek(date: Date, dayName: string): Date {
  const dayMap: { [key: string]: (d: Date) => Date } = {
    monday: nextMonday,
    tuesday: nextTuesday,
    wednesday: nextWednesday,
    thursday: nextThursday,
    friday: nextFriday,
    saturday: nextSaturday,
    sunday: nextSunday,
  }

  const fn = dayMap[dayName.toLowerCase()]
  if (fn) {
    return fn(date)
  }

  // Default to next week same day
  return addDays(date, 7)
}

// Format a proposal for Discord display
export function formatProposalMessage(proposal: EventProposal): string {
  const lines: string[] = []

  lines.push(`**Proposal:** ${proposal.name}`)

  if (proposal.isRecurring && proposal.occurrences) {
    const firstDate = formatInTimeZone(proposal.occurrences[0], TIMEZONE, 'EEEE, MMMM d')
    const lastDate = formatInTimeZone(
      proposal.occurrences[proposal.occurrences.length - 1],
      TIMEZONE,
      'MMMM d'
    )
    const startTime = formatInTimeZone(proposal.startDate, TIMEZONE, 'h:mm a')
    const endTime = proposal.endDate
      ? formatInTimeZone(proposal.endDate, TIMEZONE, 'h:mm a')
      : null

    lines.push(
      `${proposal.recurrencePattern} (${proposal.occurrences.length} events: ${firstDate} - ${lastDate})`
    )
    lines.push(`Time: ${startTime}${endTime ? ` - ${endTime}` : ''} PT`)
  } else {
    const dateStr = formatInTimeZone(proposal.startDate, TIMEZONE, 'EEEE, MMMM d')
    const startTime = formatInTimeZone(proposal.startDate, TIMEZONE, 'h:mm a')
    const endTime = proposal.endDate
      ? formatInTimeZone(proposal.endDate, TIMEZONE, 'h:mm a')
      : null

    lines.push(`${dateStr} at ${startTime}${endTime ? ` - ${endTime}` : ''} PT`)
  }

  lines.push(`Hosted by: ${proposal.hostDisplayName} (@${proposal.hostDiscordUsername})`)
  lines.push(`Visibility: ${proposal.visibility}`)
  lines.push(`Status: Idea`)

  if (proposal.url) {
    lines.push(`Link: ${proposal.url}`)
  }

  if (proposal.description) {
    lines.push(`Description: ${proposal.description}`)
  }

  return lines.join('\n')
}

// Find a person by Discord Username, or create one if not found
async function findOrCreatePersonByDiscordUsername(
  discordUsername: string
): Promise<{ personId: string; isNew: boolean }> {
  // First, try to find existing person by Discord Username
  const escapedUsername = escapeAirtableString(discordUsername)
  const formula = `{Discord Username} = '${escapedUsername}'`

  try {
    const searchResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/People?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    )

    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      if (searchData.records && searchData.records.length > 0) {
        // Found existing person
        return { personId: searchData.records[0].id, isNew: false }
      }
    }
  } catch (error) {
    console.error('Error searching for person:', error)
  }

  // Person not found, create a new one with Discord Username
  try {
    const createResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/People`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                'Discord Username': discordUsername,
                // Leave Name empty - admin can merge/update later
              },
            },
          ],
        }),
      }
    )

    if (!createResponse.ok) {
      const error = await createResponse.text()
      console.error('Failed to create person:', error)
      throw new Error('Failed to create person record')
    }

    const createData = await createResponse.json()
    return { personId: createData.records[0].id, isNew: true }
  } catch (error) {
    console.error('Error creating person:', error)
    throw error
  }
}

// Create events in Airtable
export async function createEventsInAirtable(
  proposal: EventProposal
): Promise<{ success: boolean; recordIds: string[]; error?: string; createdNewPerson?: boolean }> {
  // First, find or create the host person record
  let personId: string
  let createdNewPerson = false

  try {
    const personResult = await findOrCreatePersonByDiscordUsername(proposal.hostDiscordUsername)
    personId = personResult.personId
    createdNewPerson = personResult.isNew
  } catch (error) {
    console.error('Error finding/creating person:', error)
    return {
      success: false,
      recordIds: [],
      error: 'Failed to find or create host person record',
    }
  }

  const dates = proposal.isRecurring && proposal.occurrences ? proposal.occurrences : [proposal.startDate]

  // Calculate duration for end dates
  const duration =
    proposal.endDate && proposal.startDate
      ? proposal.endDate.getTime() - proposal.startDate.getTime()
      : 2 * 60 * 60 * 1000

  const records = dates.map((startDate) => ({
    fields: {
      Name: proposal.name,
      'Start Date': startDate.toISOString(),
      'End Date': new Date(startDate.getTime() + duration).toISOString(),
      'Event Description': proposal.description || '',
      URL: proposal.url || '',
      'Hosted by': [personId], // Link to People table via record ID
      Status: 'Idea', // Always create as "Idea" (capitalized to match Airtable select option)
      Type: proposal.visibility === 'Private' ? 'private' : undefined,
    },
  }))

  const recordIds: string[] = []

  // Airtable API allows max 10 records per request
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10)

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records: batch }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('Airtable API error:', error)
        return {
          success: false,
          recordIds,
          error: 'Failed to create events in Airtable',
          createdNewPerson,
        }
      }

      const data = await response.json()
      recordIds.push(...data.records.map((r: { id: string }) => r.id))
    } catch (error) {
      console.error('Error creating events:', error)
      return {
        success: false,
        recordIds,
        error: 'Failed to create events in Airtable',
        createdNewPerson,
      }
    }
  }

  return { success: true, recordIds, createdNewPerson }
}

// Fetch existing event names from Airtable
export async function getExistingEventNames(): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Events?fields%5B%5D=Name&maxRecords=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const names = new Set<string>()
    data.records?.forEach((record: { fields: { Name?: string } }) => {
      if (record.fields.Name) {
        names.add(record.fields.Name)
      }
    })

    return Array.from(names)
  } catch (error) {
    console.error('Error fetching event names:', error)
    return []
  }
}

// Generate a prefilled Airtable form URL
export function generatePrefillUrl(params: {
  name?: string
  discordUsername?: string
  startDate?: Date
  endDate?: Date
  description?: string
  url?: string
  visibility?: string
}): string {
  const prefill: Record<string, string> = {}

  if (params.name) {
    prefill['prefill_Name'] = params.name
  }
  // Note: Can't prefill linked record fields via URL, so we skip host
  if (params.startDate) {
    prefill['prefill_Start Date'] = params.startDate.toISOString()
  }
  if (params.endDate) {
    prefill['prefill_End Date'] = params.endDate.toISOString()
  }
  if (params.description) {
    prefill['prefill_Event Description'] = params.description
  }
  if (params.url) {
    prefill['prefill_URL'] = params.url
  }

  const queryString = Object.entries(prefill)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

  return queryString ? `${AIRTABLE_FORM_BASE_URL}?${queryString}` : AIRTABLE_FORM_BASE_URL
}

// Format confirmation message after creating events
export function formatConfirmationMessage(
  proposal: EventProposal,
  recordIds: string[],
  createdNewPerson?: boolean
): string {
  const lines: string[] = []

  if (proposal.isRecurring && proposal.occurrences) {
    lines.push(`**Created ${recordIds.length} events for "${proposal.name}"**`)
    lines.push('')
    lines.push(`First event: ${formatInTimeZone(proposal.occurrences[0], TIMEZONE, 'EEEE, MMMM d')}`)
    lines.push(
      `Last event: ${formatInTimeZone(proposal.occurrences[proposal.occurrences.length - 1], TIMEZONE, 'EEEE, MMMM d')}`
    )
  } else {
    lines.push(`**Created "${proposal.name}"**`)
    lines.push('')
    lines.push(`Date: ${formatInTimeZone(proposal.startDate, TIMEZONE, 'EEEE, MMMM d, yyyy')}`)
    lines.push(
      `Time: ${formatInTimeZone(proposal.startDate, TIMEZONE, 'h:mm a')}${proposal.endDate ? ` - ${formatInTimeZone(proposal.endDate, TIMEZONE, 'h:mm a')}` : ''} PT`
    )
  }

  lines.push('')
  lines.push('Status: **Idea** (pending confirmation)')

  if (createdNewPerson) {
    lines.push('')
    lines.push(`_Note: Created a new profile for @${proposal.hostDiscordUsername} - an admin may merge this with your existing profile._`)
  }

  lines.push('')
  lines.push('To edit details or change status, visit: https://moxsf.com/portal')

  return lines.join('\n')
}
