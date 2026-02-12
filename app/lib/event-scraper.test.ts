import { describe, it, expect } from 'vitest'
import {
  extractJsonLdEvent,
  extractNextDataEvent,
  extractOgTags,
  detectSource,
  decodeHtmlEntities,
  resolveImageUrl,
  extractDocText,
} from './event-scraper'

describe('detectSource', () => {
  it('detects luma from lu.ma URL', () => {
    expect(detectSource('https://lu.ma/my-event')).toBe('luma')
  })

  it('detects luma from luma.com URL', () => {
    expect(detectSource('https://luma.com/my-event')).toBe('luma')
  })

  it('detects partiful', () => {
    expect(detectSource('https://partiful.com/e/abc123')).toBe('partiful')
  })

  it('returns unknown for other URLs', () => {
    expect(detectSource('https://eventbrite.com/e/123')).toBe('unknown')
  })
})

describe('decodeHtmlEntities', () => {
  it('decodes &#x27; to apostrophe', () => {
    expect(decodeHtmlEntities("we&#x27;ll")).toBe("we'll")
  })

  it('decodes &amp; to ampersand', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry')
  })

  it('decodes &quot; to double quote', () => {
    expect(decodeHtmlEntities('say &quot;hello&quot;')).toBe('say "hello"')
  })

  it('decodes numeric entities', () => {
    expect(decodeHtmlEntities('&#39;hello&#39;')).toBe("'hello'")
  })

  it('decodes hex entities', () => {
    expect(decodeHtmlEntities('&#x41;&#x42;&#x43;')).toBe('ABC')
  })

  it('handles text with no entities', () => {
    expect(decodeHtmlEntities('plain text')).toBe('plain text')
  })

  it('handles multiple different entities', () => {
    expect(decodeHtmlEntities("it&#x27;s a &quot;great&quot; day &amp; night")).toBe(
      'it\'s a "great" day & night'
    )
  })
})

describe('extractJsonLdEvent', () => {
  it('extracts direct Event object', () => {
    const html = `
      <html><head>
      <script type="application/ld+json">
      {"@type":"Event","name":"AI Safety Meetup","startDate":"2026-03-15T18:00:00-07:00","endDate":"2026-03-15T21:00:00-07:00","description":"Join us for a discussion","image":"https://images.lumacdn.com/poster.jpg","location":{"@type":"Place","name":"Mox SF","address":{"@type":"PostalAddress","streetAddress":"1680 Mission St","addressLocality":"San Francisco","addressRegion":"CA"}}}
      </script>
      </head><body></body></html>
    `
    const result = extractJsonLdEvent(html)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('AI Safety Meetup')
    expect(result!.startDate).toBe('2026-03-15T18:00:00-07:00')
    expect(result!.endDate).toBe('2026-03-15T21:00:00-07:00')
    expect(result!.description).toBe('Join us for a discussion')
    expect(result!.image).toBe('https://images.lumacdn.com/poster.jpg')
  })

  it('extracts Event from @graph array', () => {
    const html = `
      <html><head>
      <script type="application/ld+json">
      {"@context":"https://schema.org","@graph":[{"@type":"WebPage","name":"Page"},{"@type":"Event","name":"Graph Event","startDate":"2026-04-01T10:00:00Z"}]}
      </script>
      </head><body></body></html>
    `
    const result = extractJsonLdEvent(html)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Graph Event')
  })

  it('extracts SocialEvent type', () => {
    const html = `
      <html><head>
      <script type="application/ld+json">
      {"@type":"SocialEvent","name":"Birthday Party","startDate":"2026-05-01T19:00:00Z"}
      </script>
      </head><body></body></html>
    `
    const result = extractJsonLdEvent(html)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Birthday Party')
  })

  it('returns null when no JSON-LD present', () => {
    const html = '<html><head></head><body>No structured data</body></html>'
    expect(extractJsonLdEvent(html)).toBeNull()
  })

  it('returns null when JSON-LD has no Event type', () => {
    const html = `
      <html><head>
      <script type="application/ld+json">
      {"@type":"Organization","name":"Mox SF"}
      </script>
      </head><body></body></html>
    `
    expect(extractJsonLdEvent(html)).toBeNull()
  })

  it('handles invalid JSON gracefully', () => {
    const html = `
      <html><head>
      <script type="application/ld+json">
      {invalid json here}
      </script>
      <script type="application/ld+json">
      {"@type":"Event","name":"Valid Event","startDate":"2026-01-01T00:00:00Z"}
      </script>
      </head><body></body></html>
    `
    const result = extractJsonLdEvent(html)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Valid Event')
  })
})

describe('extractNextDataEvent', () => {
  it('extracts Partiful event from __NEXT_DATA__', () => {
    const html = `
      <html><head></head><body>
      <script id="__NEXT_DATA__" type="application/json">
      {"props":{"pageProps":{"event":{"title":"Apartment Dinner","startDate":"2026-02-13T02:00:00.000Z","timezone":"America/Los_Angeles","invitationMessage":"Come have dinner","locationInfo":{"displayAddressLines":["150 Van Ness Ave","San Francisco, CA"],"type":"IN_PERSON"},"image":{"url":"https://partiful.imgix.net/poster.jpg"}}}}}
      </script>
      </body></html>
    `
    const result = extractNextDataEvent(html)
    expect(result).not.toBeNull()
    expect(result!.title).toBe('Apartment Dinner')
    expect(result!.startDate).toBe('2026-02-13T02:00:00.000Z')
    expect(result!.invitationMessage).toBe('Come have dinner')
  })

  it('returns null when no __NEXT_DATA__ present', () => {
    const html = '<html><head></head><body>No data</body></html>'
    expect(extractNextDataEvent(html)).toBeNull()
  })

  it('returns null when event has no title', () => {
    const html = `
      <html><body>
      <script id="__NEXT_DATA__" type="application/json">
      {"props":{"pageProps":{"event":{"id":"abc123"}}}}
      </script>
      </body></html>
    `
    expect(extractNextDataEvent(html)).toBeNull()
  })

  it('returns null when no event in pageProps', () => {
    const html = `
      <html><body>
      <script id="__NEXT_DATA__" type="application/json">
      {"props":{"pageProps":{"user":{"name":"John"}}}}
      </script>
      </body></html>
    `
    expect(extractNextDataEvent(html)).toBeNull()
  })

  it('extracts Luma event from __NEXT_DATA__', () => {
    const html = `
      <html><head></head><body>
      <script id="__NEXT_DATA__" type="application/json">
      {"props":{"pageProps":{"initialData":{"data":{"event":{"name":"Study Hall","start_at":"2026-02-24T02:00:00.000Z","end_at":"2026-02-24T03:00:00.000Z","timezone":"America/Los_Angeles","cover_url":"https://images.lumacdn.com/cover.webp"}}}}}}
      </script>
      </body></html>
    `
    const result = extractNextDataEvent(html)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Study Hall')
    expect(result!.start_at).toBe('2026-02-24T02:00:00.000Z')
    expect(result!.end_at).toBe('2026-02-24T03:00:00.000Z')
    expect(result!.cover_url).toBe('https://images.lumacdn.com/cover.webp')
  })
})

describe('extractOgTags', () => {
  it('extracts standard OG tags', () => {
    const html = `
      <html><head>
      <meta property="og:title" content="My Event">
      <meta property="og:description" content="A great event">
      <meta property="og:image" content="https://example.com/image.jpg">
      <meta property="og:url" content="https://example.com/event">
      </head><body></body></html>
    `
    const tags = extractOgTags(html)
    expect(tags['og:title']).toBe('My Event')
    expect(tags['og:description']).toBe('A great event')
    expect(tags['og:image']).toBe('https://example.com/image.jpg')
    expect(tags['og:url']).toBe('https://example.com/event')
  })

  it('handles reversed attribute order (content before property)', () => {
    const html = `
      <html><head>
      <meta content="Reversed Event" property="og:title">
      </head><body></body></html>
    `
    const tags = extractOgTags(html)
    expect(tags['og:title']).toBe('Reversed Event')
  })

  it('returns empty object when no OG tags', () => {
    const html = '<html><head><title>No OG</title></head><body></body></html>'
    const tags = extractOgTags(html)
    expect(Object.keys(tags)).toHaveLength(0)
  })
})

describe('resolveImageUrl', () => {
  it('returns string directly', () => {
    expect(resolveImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg')
  })

  it('extracts url from object', () => {
    expect(resolveImageUrl({ url: 'https://example.com/img.jpg' })).toBe(
      'https://example.com/img.jpg'
    )
  })

  it('extracts contentUrl from object', () => {
    expect(resolveImageUrl({ contentUrl: 'https://example.com/img.jpg' })).toBe(
      'https://example.com/img.jpg'
    )
  })

  it('extracts from array', () => {
    expect(resolveImageUrl(['https://example.com/img.jpg'])).toBe('https://example.com/img.jpg')
  })

  it('returns undefined for null/undefined', () => {
    expect(resolveImageUrl(null)).toBeUndefined()
    expect(resolveImageUrl(undefined)).toBeUndefined()
  })
})

describe('extractDocText', () => {
  it('extracts text from ProseMirror doc', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello world' },
            { type: 'hard_break' },
            { type: 'text', text: 'Second line' },
          ],
        },
      ],
    }
    expect(extractDocText(doc)).toBe('Hello world\nSecond line')
  })

  it('returns empty string for null/undefined', () => {
    expect(extractDocText(null)).toBe('')
    expect(extractDocText(undefined)).toBe('')
  })

  it('returns empty string for non-doc object', () => {
    expect(extractDocText({ type: 'other' })).toBe('')
  })
})

