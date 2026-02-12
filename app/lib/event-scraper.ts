export interface ScrapedEventData {
  name?: string
  description?: string
  startDate?: string // ISO 8601
  endDate?: string // ISO 8601
  imageUrl?: string
  url?: string // canonical URL
  hostNames?: string[]
  source: 'luma' | 'partiful' | 'unknown'
}

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#x2F;': '/',
  '&#39;': "'",
  '&apos;': "'",
}

function decodeHtmlEntities(text: string): string {
  let decoded = text
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    decoded = decoded.replaceAll(entity, char)
  }
  // Handle numeric entities like &#123; and &#x7B;
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  )
  return decoded
}

function detectSource(url: string): ScrapedEventData['source'] {
  if (/lu\.ma|luma\.com/i.test(url)) return 'luma'
  if (/partiful\.com/i.test(url)) return 'partiful'
  return 'unknown'
}

function extractJsonLdEvent(html: string): Record<string, unknown> | null {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])

      // Direct Event object
      if (data['@type'] === 'Event' || data['@type'] === 'SocialEvent') {
        return data
      }

      // Nested in @graph array
      if (Array.isArray(data['@graph'])) {
        const event = data['@graph'].find(
          (item: Record<string, unknown>) =>
            item['@type'] === 'Event' || item['@type'] === 'SocialEvent'
        )
        if (event) return event
      }
    } catch {
      // Invalid JSON, try next block
    }
  }
  return null
}

function extractOgTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {}
  const metaRegex = /<meta\s+(?:property|name)=["'](og:[^"']+)["']\s+content=["']([^"']*)["']/gi
  // Also match the reversed order: content before property
  const metaRegexReversed = /<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["'](og:[^"']+)["']/gi

  let match
  while ((match = metaRegex.exec(html)) !== null) {
    tags[match[1]] = match[2]
  }
  while ((match = metaRegexReversed.exec(html)) !== null) {
    tags[match[2]] = match[1]
  }
  return tags
}

function extractNextDataEvent(html: string): Record<string, unknown> | null {
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null

  try {
    const data = JSON.parse(match[1])

    // Partiful: props.pageProps.event (has title)
    const partifulEvent = data?.props?.pageProps?.event
    if (partifulEvent && typeof partifulEvent === 'object' && partifulEvent.title) {
      return partifulEvent
    }

    // Luma: props.pageProps.initialData.data.event (has name)
    // description_mirror is a sibling of event in initialData.data
    const lumaData = data?.props?.pageProps?.initialData?.data
    const lumaEvent = lumaData?.event
    if (lumaEvent && typeof lumaEvent === 'object' && lumaEvent.name) {
      if (lumaData.description_mirror) {
        lumaEvent.description_mirror = lumaData.description_mirror
      }
      if (Array.isArray(lumaData.hosts)) {
        lumaEvent.hostNames = lumaData.hosts
          .map((h: Record<string, unknown>) => h.name)
          .filter(Boolean)
      }
      return lumaEvent
    }
  } catch {
    // Invalid JSON
  }
  return null
}

// Extract plain text from ProseMirror/TipTap doc structure (used by Luma's description_mirror)
function extractDocText(doc: unknown): string {
  if (typeof doc !== 'object' || doc === null) return ''
  const node = doc as Record<string, unknown>
  if (node.type === 'text' && typeof node.text === 'string') return node.text
  if (node.type === 'hard_break') return '\n'
  if (Array.isArray(node.content)) {
    return node.content.map(extractDocText).join('')
  }
  return ''
}

function resolveImageUrl(image: unknown): string | undefined {
  if (typeof image === 'string') return image
  if (Array.isArray(image) && image.length > 0) {
    return resolveImageUrl(image[0])
  }
  if (typeof image === 'object' && image !== null) {
    const obj = image as Record<string, unknown>
    return (obj.url || obj.contentUrl) as string | undefined
  }
  return undefined
}

export async function scrapeEventUrl(url: string): Promise<ScrapedEventData> {
  const source = detectSource(url)

  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MoxSF/1.0)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()

  // Try JSON-LD first (works for Luma and many other platforms)
  const jsonLd = extractJsonLdEvent(html)
  if (jsonLd) {
    return {
      name: decodeHtmlEntities((jsonLd.name as string) || ''),
      description: decodeHtmlEntities((jsonLd.description as string) || ''),
      startDate: jsonLd.startDate as string | undefined,
      endDate: jsonLd.endDate as string | undefined,
      imageUrl: resolveImageUrl(jsonLd.image),
      url: (jsonLd.url as string) || url,
      source,
    }
  }

  // Try __NEXT_DATA__ (works for Partiful and Luma)
  const nextData = extractNextDataEvent(html)
  if (nextData) {
    // Partiful uses: title, startDate, endDate, image.url, description/invitationMessage
    // Luma uses: name, start_at, end_at, cover_url, description_mirror
    const eventName = (nextData.title as string) || (nextData.name as string) || ''
    const eventStart = (nextData.startDate as string) || (nextData.start_at as string)
    const eventEnd = (nextData.endDate as string) || (nextData.end_at as string)
    const eventDescription =
      (typeof nextData.description === 'string' ? nextData.description : '') ||
      (nextData.invitationMessage as string) ||
      extractDocText(nextData.description_mirror) ||
      ''

    // Image: Partiful uses image.url, Luma uses cover_url
    const imageObj = nextData.image as Record<string, unknown> | undefined
    const imageUrl = imageObj?.url as string || (nextData.cover_url as string) || undefined

    const hostNames = Array.isArray(nextData.hostNames)
      ? (nextData.hostNames as string[])
      : undefined

    return {
      name: decodeHtmlEntities(eventName),
      description: decodeHtmlEntities(eventDescription),
      startDate: eventStart,
      endDate: eventEnd,
      imageUrl,
      url: (nextData.publicShortUrl as string) || url,
      hostNames,
      source,
    }
  }

  // Fallback to OG tags
  const og = extractOgTags(html)
  return {
    name: og['og:title'] ? decodeHtmlEntities(og['og:title']) : undefined,
    description: og['og:description'] ? decodeHtmlEntities(og['og:description']) : undefined,
    imageUrl: og['og:image'] ? decodeHtmlEntities(og['og:image']) : undefined,
    url: og['og:url'] || url,
    source,
  }
}

// Exported for testing
export {
  extractJsonLdEvent,
  extractNextDataEvent,
  extractOgTags,
  detectSource,
  decodeHtmlEntities,
  resolveImageUrl,
  extractDocText,
}
