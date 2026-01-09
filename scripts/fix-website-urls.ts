/**
 * Fix Malformatted Personal Website URLs
 *
 * This script fetches people from Airtable and uses Claude Haiku to:
 * 1. Identify and fix malformatted personal website URLs
 * 2. If multiple URLs exist, keep only the first valid one
 * 3. Append any additional URLs to the 'Outreach Notes' field
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.MOX_ANTHROPIC_API_KEY!,
});

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Email?: string;
    Website?: string;
    'Outreach Notes'?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface URLAnalysis {
  hasIssue: boolean;
  primaryUrl: string | null;
  additionalUrls: string[];
  explanation: string;
}

/**
 * Quick validation check to see if a URL is properly formatted
 * Returns true if the URL appears valid and doesn't need AI analysis
 */
function isValidSingleURL(websiteField: string): boolean {
  const trimmed = websiteField.trim();

  // Check if it's a single URL (no commas, spaces in middle, or multiple http/https)
  const hasMultipleUrls =
    trimmed.includes(',') ||
    trimmed.includes(' ') ||
    (trimmed.match(/https?:\/\//g) || []).length > 1;

  if (hasMultipleUrls) {
    return false;
  }

  // Check if it starts with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }

  // Basic URL structure validation using a simple regex
  // This checks for: protocol + domain + optional path
  const urlRegex = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(\.[a-zA-Z]{2,})(\/[^\s]*)?$/;

  return urlRegex.test(trimmed);
}

/**
 * Try to fix a URL by adding https:// if that's all that's needed
 * Returns the fixed URL if successful, null otherwise
 */
function trySimpleFix(websiteField: string): string | null {
  const trimmed = websiteField.trim();

  // Check if it's a single URL without protocol
  const hasMultipleUrls =
    trimmed.includes(',') ||
    (trimmed.match(/https?:\/\//g) || []).length > 1;

  if (hasMultipleUrls) {
    return null;
  }

  // If it doesn't start with a protocol but looks like a domain
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    // Check if adding https:// would make it valid
    const withHttps = `https://${trimmed}`;
    if (isValidSingleURL(withHttps)) {
      return withHttps;
    }
  }

  return null;
}

async function fetchAllPeople(): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  console.log('Fetching all people from Airtable...');

  do {
    const url = new URL(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People`);

    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data: AirtableResponse = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;

    console.log(`Fetched ${data.records.length} records (total: ${allRecords.length})`);
  } while (offset);

  return allRecords;
}

async function analyzeWebsiteURL(websiteField: string): Promise<URLAnalysis> {
  const prompt = `Analyze this website field from a database and determine if it has any formatting issues.

Website field content: "${websiteField}"

Your task:
1. Identify if there are formatting issues (missing https://, multiple URLs, malformed URLs, etc.)
2. Extract the PRIMARY valid URL (prefer https:// over http://, clean up any formatting)
3. Extract any ADDITIONAL URLs that should be removed from the Website field
4. Provide a brief explanation

Rules:
- A valid URL should start with https:// or http://
- If multiple URLs are present, the first valid one is primary
- Clean up common issues like missing protocols, extra spaces, etc.
- If the field is empty or has no valid URL, set primaryUrl to null

Return your response as JSON:
{
  "hasIssue": true/false,
  "primaryUrl": "https://example.com" or null,
  "additionalUrls": ["https://other.com", "https://another.com"] or [],
  "explanation": "Brief explanation of what was found/fixed"
}

Examples:

Input: "example.com, https://twitter.com/user"
Output: {
  "hasIssue": true,
  "primaryUrl": "https://example.com",
  "additionalUrls": ["https://twitter.com/user"],
  "explanation": "Missing https:// on first URL, second URL moved to additional"
}

Input: "https://website.com"
Output: {
  "hasIssue": false,
  "primaryUrl": "https://website.com",
  "additionalUrls": [],
  "explanation": "URL is properly formatted"
}

Input: "mysite.com https://blog.com"
Output: {
  "hasIssue": true,
  "primaryUrl": "https://mysite.com",
  "additionalUrls": ["https://blog.com"],
  "explanation": "Added https:// to first URL, moved second URL to additional"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]) as URLAnalysis;
    return result;
  } catch (error) {
    console.error(`Error analyzing URL:`, error);
    throw error;
  }
}

async function updateAirtableRecord(
  recordId: string,
  updates: {
    website?: string | null;
    outreachNotes?: string;
  }
): Promise<boolean> {
  try {
    const fields: Record<string, string> = {};

    if (updates.website !== undefined) {
      if (updates.website === null) {
        fields['Website'] = '';
      } else {
        fields['Website'] = updates.website;
      }
    }

    if (updates.outreachNotes !== undefined) {
      fields['Outreach Notes'] = updates.outreachNotes;
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable update error: ${response.statusText} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating record ${recordId}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting website URL cleanup...\n');

  // Validate environment variables
  if (!process.env.MOX_ANTHROPIC_API_KEY) {
    throw new Error('MOX_ANTHROPIC_API_KEY is not set');
  }
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not set');
  }
  if (!process.env.AIRTABLE_WRITE_KEY) {
    throw new Error('AIRTABLE_WRITE_KEY is not set');
  }
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is not set');
  }

  // Fetch all people
  const people = await fetchAllPeople();

  console.log(`\nFound ${people.length} people\n`);

  let analyzed = 0;
  let fixed = 0;
  let skipped = 0;
  let validWithoutAI = 0;
  let simpleFixed = 0;
  let analyzedWithAI = 0;
  let errors = 0;

  // Process each person
  for (const person of people) {
    const name = person.fields.Name || 'Unknown';
    const email = person.fields.Email || 'Unknown';
    const website = person.fields.Website;

    // Skip if no website field
    if (!website || website.trim() === '') {
      skipped++;
      continue;
    }

    console.log(`\nAnalyzing: ${name} (${email})`);
    console.log(`  Current Website: "${website}"`);

    try {
      analyzed++;

      // First, do a cheap validation check
      if (isValidSingleURL(website)) {
        console.log(`  ✓ Valid URL, no changes needed`);
        validWithoutAI++;
        continue;
      }

      // Try a simple fix (just adding https://)
      const simpleFix = trySimpleFix(website);
      if (simpleFix) {
        console.log(`  🔧 Simple fix: adding https://`);
        console.log(`  New URL: "${simpleFix}"`);

        const success = await updateAirtableRecord(person.id, {
          website: simpleFix,
        });

        if (success) {
          console.log(`  ✅ Fixed website URL (simple fix)`);
          fixed++;
          simpleFixed++;
        } else {
          console.log(`  ❌ Failed to update`);
          errors++;
        }
        continue;
      }

      // If simple fix doesn't work, use Claude Haiku to analyze and fix
      console.log(`  ⚠️  Complex issue detected, using AI to analyze...`);
      analyzedWithAI++;
      const analysis = await analyzeWebsiteURL(website);

      console.log(`  Analysis: ${analysis.explanation}`);
      console.log(`  Has Issue: ${analysis.hasIssue}`);
      console.log(`  Primary URL: ${analysis.primaryUrl || '(none)'}`);
      console.log(`  Additional URLs: ${analysis.additionalUrls.length > 0 ? analysis.additionalUrls.join(', ') : '(none)'}`);

      if (analysis.hasIssue) {
        const updates: { website?: string | null; outreachNotes?: string } = {};

        // Update website field with primary URL
        updates.website = analysis.primaryUrl;

        // Append additional URLs to Outreach Notes
        if (analysis.additionalUrls.length > 0) {
          const currentNotes = person.fields['Outreach Notes'] || '';
          const additionalUrlsText = `\n\n[Additional URLs from Website field]: ${analysis.additionalUrls.join(', ')}`;
          updates.outreachNotes = currentNotes + additionalUrlsText;
        }

        const success = await updateAirtableRecord(person.id, updates);

        if (success) {
          console.log(`  ✅ Fixed website URL`);
          fixed++;
        } else {
          console.log(`  ❌ Failed to update`);
          errors++;
        }
      } else {
        console.log(`  ℹ️  No changes needed`);
      }
    } catch (error) {
      console.log(`  ❌ Error analyzing/updating: ${error}`);
      errors++;
    }

    // Rate limiting: wait 1.5 seconds between people to avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total people: ${people.length}`);
  console.log(`Analyzed (had website): ${analyzed}`);
  console.log(`  - Valid without changes: ${validWithoutAI}`);
  console.log(`  - Fixed with simple fix (https://): ${simpleFixed}`);
  console.log(`  - Analyzed with AI: ${analyzedWithAI}`);
  console.log(`Fixed: ${fixed}`);
  console.log(`  - Simple fixes: ${simpleFixed}`);
  console.log(`  - AI fixes: ${fixed - simpleFixed}`);
  console.log(`No changes needed: ${validWithoutAI}`);
  console.log(`Skipped (no website): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log('='.repeat(50));
  const apiCallsSaved = validWithoutAI + simpleFixed;
  console.log(`\n💰 Claude API calls saved: ${apiCallsSaved} (${Math.round(apiCallsSaved / analyzed * 100)}% of records with websites)`);
  console.log('='.repeat(50));
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
