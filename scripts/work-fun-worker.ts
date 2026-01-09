/**
 * Work/Fun Things Analysis Worker
 *
 * This runs in the background and maintains a queue of analyzed people.
 * It exposes a simple HTTP API for the CLI to consume.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createServer } from 'http';

const anthropic = new Anthropic({
  apiKey: process.env.MOX_ANTHROPIC_API_KEY!,
});

const PORT = 3456;

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Email?: string;
    'Outreach Notes'?: string;
    'AI Evaluation'?: string;
    Website?: string;
    'Work thing'?: string;
    'Work thing URL'?: string;
    'Fun thing'?: string;
    'Fun thing URL'?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface WorkOption {
  text: string;
  url: string | null;
  confidence: string;
}

interface FunOption {
  text: string;
  url: string | null;
  confidence: string;
}

interface ProfileUrls {
  personal?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  [key: string]: string | undefined;
}

interface AnalysisResult {
  member: AirtableRecord;
  workOptions: WorkOption[];
  funOptions: FunOption[];
  rawInfo: string;
  searchLogs: string[];
  profileUrls: ProfileUrls;
  allUrls: string[];
}

async function fetchAllMembers(): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  console.log('Fetching all members from Airtable...');

  do {
    const url = new URL(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People`);
    url.searchParams.set('filterByFormula', '{Status} = "Joined"');

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

async function searchWebForMember(name: string, website: string, email?: string): Promise<{ result: string; logs: string[] }> {
  const maxRetries = 3;
  const logs: string[] = [];

  logs.push(`🔍 Searching web for ${name}...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Build search keywords - use website domain if available, otherwise just name and email
      let searchKeywords = name;
      if (website) {
        const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        const domainKeywords = domain.split('.')[0];
        searchKeywords = [name, domainKeywords].filter(Boolean).join(' ');
      }
      if (email) {
        const emailDomain = email.split('@')[1]?.split('.')[0];
        if (emailDomain) {
          searchKeywords = [searchKeywords, emailDomain].join(' ');
        }
      }

      logs.push(`   Keywords: ${searchKeywords}`);

      // Build search prompt based on whether we have a website
      const verificationPhase = website
        ? `## PHASE 1: VERIFICATION (state confidence: high/medium/low)
Search results should relate to ${website}. Verify this is the right person.

`
        : `## PHASE 1: PERSON IDENTIFICATION
Try to identify the correct person named "${name}"${email ? ` with email ${email}` : ''}. State confidence level.

`;

      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1200,
        tools: [{
          type: 'web_search_20250305' as const,
          name: 'web_search' as const
        }],
        messages: [{
          role: 'user',
          content: `Use web search to find information about "${name}". Search using keywords: ${searchKeywords}

${verificationPhase}## PHASE 2: FIND PROFILE URLS
Find these specific profile URLs for this person:
- personal: their personal website/portfolio/blog (base domain only, e.g. example.com not example.com/about)
- github: their GitHub profile
- linkedin: their LinkedIn profile
- twitter: their Twitter/X profile

Return as: "PROFILES_JSON: {"personal": "https://example.com", "github": "https://github.com/user", "linkedin": "https://linkedin.com/in/user", "twitter": "https://x.com/user"}"

## PHASE 3: WORK & INTERESTS (state confidence for each finding: high/medium/low)
Find ANY NUMBER of good options for their:
- Professional work (job, company, career focus, projects) - include inline URL citation with confidence when available
- Personal interests/hobbies (different from work) - include inline URL citation with confidence when available

Format: "Works on X (https://example.com, confidence: high), also does Y (confidence: medium)"`
        }]
      });

      let summary = '';
      let hasToolUse = false;
      for (const block of message.content) {
        if (block.type.includes('tool')) {
          hasToolUse = true;
        }
        if (block.type === 'text') {
          summary += block.text;
        }
      }

      const result = summary || '(no results)';

      if (result.includes('unable to complete') || result.includes('tool is currently unavailable') || result.includes('tool may be available')) {
        logs.push(`   ⚠️  Web search tool unavailable (attempt ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          logs.push(`   Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        logs.push(`   ❌ Web search unavailable after ${maxRetries} attempts`);
        return { result: '', logs };
      }

      if (!hasToolUse) {
        logs.push(`   ⚠️  No tool use detected (attempt ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          logs.push(`   Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        logs.push(`   ❌ Failed to get web search results`);
        return { result: '', logs };
      }

      logs.push(`   ✅ Web search completed`);
      return { result, logs };
    } catch (error: any) {
      logs.push(`   ❌ Error on attempt ${attempt}/${maxRetries}: ${error?.message || error}`);

      if (error?.status === 429) {
        const retryAfter = error?.headers?.['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

        if (attempt < maxRetries) {
          logs.push(`      Rate limited. Waiting ${Math.round(waitTime/1000)}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      if (attempt === maxRetries) {
        logs.push(`   ❌ Failed after ${maxRetries} attempts`);
        return { result: '', logs };
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return { result: '', logs };
}

async function analyzeForOptions(member: AirtableRecord): Promise<AnalysisResult> {
  const name = member.fields.Name || 'Unknown';
  const email = member.fields.Email;

  let webSearchInfo = '';
  let searchLogs: string[] = [];
  let profileUrls: ProfileUrls = {};
  let allUrls: string[] = [];

  // Always try web search - even without a website, search by name
  if (member.fields.Website || name !== 'Unknown') {
    const searchResult = await searchWebForMember(name, member.fields.Website || '', email);
    webSearchInfo = searchResult.result;
    searchLogs = searchResult.logs;

    // Parse PROFILES_JSON from search results for the website field
    const profilesJsonMatch = webSearchInfo.match(/PROFILES_JSON:\s*(\{[^}]+\})/i);
    if (profilesJsonMatch) {
      try {
        profileUrls = JSON.parse(profilesJsonMatch[1]);
      } catch (error) {
        console.error(`Failed to parse PROFILES_JSON:`, error);
      }
    }

    // Extract ALL URLs from search results for work/fun thing URLs
    const urlMatches = webSearchInfo.match(/https?:\/\/[^\s,)]+/g);
    if (urlMatches) {
      allUrls = [...new Set(urlMatches.map(url => url.trim()))]; // dedupe
    }
  }

  const prompt = `Extract work things and fun things for ${name}.

IMPORTANT CONTEXT: These will be displayed as "into [work thing] and [fun thing]"

RULES:
1. Provide ANY NUMBER of good OPTIONS for work things (areas, fields, technologies - NOT job titles)
2. Provide ANY NUMBER of good OPTIONS for fun things (hobbies, interests)
3. Each option should be 1-4 words
4. Include URL citations when available - prefer options with URLs but include good options without URLs if needed
5. Mark confidence for each option (high/medium/low)
6. WORK = professional interests/fields/technologies (e.g., "AI safety", "compilers", "web3")
   - NOT job titles like "Developer at X" or "CEO of Y"
   - Should fit grammatically: "into [work thing]"
   - Include URL if available from web search
7. FUN = hobbies/interests DIFFERENT from work (e.g., "rock climbing", "board games")
   - Should fit grammatically: "into [fun thing]"
   - Include URL if available from web search
8. If insufficient data, return EMPTY ARRAYS

URL RULES:
- GOOD: https://user.substack.com, https://company.com/project, https://github.com/user/repo
- BAD: https://substack.com, https://github.com, https://medium.com (generic domains without specific user/project)
- Prefer specific URLs over generic ones, but null is acceptable if no good URL exists

${member.fields['Outreach Notes'] ? `Notes: ${member.fields['Outreach Notes']}\n` : ''}${member.fields['AI Evaluation'] ? `Eval: ${member.fields['AI Evaluation']}\n` : ''}${webSearchInfo ? `Web: ${webSearchInfo}\n` : ''}

ALWAYS return JSON in this exact format (use empty arrays if no data):
{
  "workOptions": [
    {"text": "Company/Project", "url": "https://...", "confidence": "high"},
    {"text": "Another thing", "url": null, "confidence": "medium"}
  ],
  "funOptions": [
    {"text": "Hobby 1", "url": "https://...", "confidence": "high"},
    {"text": "Hobby 2", "url": null, "confidence": "medium"}
  ]
}
`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      console.error(`Unexpected response type from Claude: ${content.type}`);
      return {
        member,
        workOptions: [],
        funOptions: [],
        rawInfo: webSearchInfo,
        searchLogs,
        profileUrls,
        allUrls
      };
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`No JSON found in Claude response. Full response:\n${content.text}`);
      return {
        member,
        workOptions: [],
        funOptions: [],
        rawInfo: webSearchInfo,
        searchLogs,
        profileUrls,
        allUrls
      };
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      member,
      workOptions: result.workOptions || [],
      funOptions: result.funOptions || [],
      rawInfo: webSearchInfo,
      searchLogs,
      profileUrls,
      allUrls
    };
  } catch (error) {
    console.error(`Error analyzing member:`, error);
    return {
      member,
      workOptions: [],
      funOptions: [],
      rawInfo: webSearchInfo,
      searchLogs,
      profileUrls,
      allUrls
    };
  }
}

class AnalysisQueue {
  private queue: AnalysisResult[] = [];
  private members: AirtableRecord[];
  private currentIndex = 0;
  private bufferSize = 4;
  private isProcessing = false;

  constructor(members: AirtableRecord[]) {
    this.members = members;
  }

  async start() {
    console.log(`Worker ready with ${this.members.length} members. Queue will load on first request.`);
    // Don't pre-load - let it load on-demand when getNext() is called
  }

  private async maintainBuffer() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length < this.bufferSize && this.currentIndex < this.members.length) {
      const member = this.members[this.currentIndex];
      this.currentIndex++;

      console.log(`\n[${ this.queue.length + 1}/${this.bufferSize}] Analyzing ${member.fields.Name || 'Unknown'}...`);
      const result = await analyzeForOptions(member);

      // Log search results
      if (result.searchLogs.length > 0) {
        result.searchLogs.forEach(log => console.log(log));
      }

      this.queue.push(result);
      console.log(`✅ Added to queue (${this.queue.length}/${this.bufferSize} ready)\n`);
    }

    this.isProcessing = false;
  }

  async getNext(): Promise<AnalysisResult | null> {
    // If queue is empty and we have more members, fill the buffer first
    if (this.queue.length === 0 && this.currentIndex < this.members.length) {
      console.log('🔄 Queue empty, starting to analyze members...\n');
      await this.maintainBuffer();
    }

    if (this.queue.length === 0) {
      return null;
    }

    // Return first item WITHOUT removing it (peek behavior)
    return this.queue[0];
  }

  acknowledge(): void {
    // Remove the first item only when confirmed processed
    if (this.queue.length > 0) {
      this.queue.shift();
      // Trigger buffer refill in background (don't await)
      this.maintainBuffer();
    }
  }

  getQueueStatus() {
    return {
      queueSize: this.queue.length,
      totalMembers: this.members.length,
      processed: this.currentIndex,
      remaining: this.members.length - this.currentIndex
    };
  }
}

let queue: AnalysisQueue | null = null;

async function main() {
  // Validate environment variables
  if (!process.env.MOX_ANTHROPIC_API_KEY) {
    throw new Error('MOX_ANTHROPIC_API_KEY is not set');
  }
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not set');
  }
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is not set');
  }

  // Parse command-line arguments
  const args = process.argv.slice(2);
  const skipCompleted = args.includes('--skip-completed');
  const personFilter = args.find(arg => arg.startsWith('--person='))?.split('=')[1];

  let members = await fetchAllMembers();
  console.log(`\n✅ Found ${members.length} members\n`);

  // Filter members
  if (skipCompleted) {
    members = members.filter(m => !m.fields['Work thing'] || !m.fields['Fun thing']);
    console.log(`Filtered to ${members.length} incomplete members\n`);
  }

  if (personFilter) {
    const filterLower = personFilter.toLowerCase();
    members = members.filter(m => {
      const name = (m.fields.Name || '').toLowerCase();
      const email = (m.fields.Email || '').toLowerCase();
      return name.includes(filterLower) || email.includes(filterLower);
    });
    console.log(`Filtered to ${members.length} matching member(s)\n`);
  }

  queue = new AnalysisQueue(members);
  await queue.start();

  // Create HTTP server
  const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.url === '/next' && req.method === 'GET') {
      const result = await queue!.getNext();
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } else if (req.url === '/acknowledge' && req.method === 'POST') {
      queue!.acknowledge();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } else if (req.url === '/status' && req.method === 'GET') {
      const status = queue!.getQueueStatus();
      res.writeHead(200);
      res.end(JSON.stringify(status));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(PORT, () => {
    console.log(`\n🚀 Worker server running on http://localhost:${PORT}`);
    console.log(`   GET  /next        - Get next analyzed person`);
    console.log(`   POST /acknowledge - Confirm person processed`);
    console.log(`   GET  /status      - Get queue status\n`);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
