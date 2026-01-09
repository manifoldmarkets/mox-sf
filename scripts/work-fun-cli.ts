/**
 * Work/Fun Things CLI Client
 *
 * Simple CLI that fetches pre-analyzed people from the worker
 * and lets you choose what to save.
 */

import * as readline from 'readline';

const WORKER_URL = 'http://localhost:3456';

interface AirtableRecord {
  id: string;
  fields: {
    Name?: string;
    Email?: string;
    Website?: string;
    'Work thing'?: string;
    'Fun thing'?: string;
  };
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

async function getNextPerson(): Promise<AnalysisResult | null> {
  const response = await fetch(`${WORKER_URL}/next`);
  const data = await response.json();
  return data;
}

async function getWorkerStatus() {
  try {
    const response = await fetch(`${WORKER_URL}/status`);
    return await response.json();
  } catch {
    return null;
  }
}

async function updateMemberInAirtable(
  recordId: string,
  workThing: string | null,
  workThingUrl: string | null,
  funThing: string | null,
  funThingUrl: string | null,
  website: string | null
): Promise<boolean> {
  try {
    const fields: Record<string, string> = {
      'Work thing': workThing || '',
      'Work thing URL': workThingUrl || '',
      'Fun thing': funThing || '',
      'Fun thing URL': funThingUrl || '',
      'Website': website || '',
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
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

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function interactivePrompt(
  analysis: AnalysisResult
): Promise<{ workThing: string | null; workThingUrl: string | null; funThing: string | null; funThingUrl: string | null; website: string | null } | null> {
  const name = analysis.member.fields.Name || 'Unknown';
  const email = analysis.member.fields.Email || 'Unknown';

  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n👤 ${name} (${email})`);
  console.log(`   Website: ${analysis.member.fields.Website || '(none)'}`);

  // Display profile URLs from the dict
  if (Object.keys(analysis.profileUrls).length > 0) {
    console.log(`\n🔗 Profile URLs:`);
    const urlEntries = Object.entries(analysis.profileUrls).filter(([_, url]) => url);
    urlEntries.forEach(([label, url], i) => {
      const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);
      console.log(`   ${i + 1}. [${displayLabel}] ${url}`);
    });
  }

  console.log(`\n   Current state:`);
  console.log(`   Work: ${analysis.member.fields['Work thing'] || '(empty)'}`);
  console.log(`   Fun:  ${analysis.member.fields['Fun thing'] || '(empty)'}`);

  // Show search logs
  if (analysis.searchLogs.length > 0) {
    console.log(`\n📝 Search Process:`);
    analysis.searchLogs.forEach(log => console.log(`   ${log}`));
  }

  // Show full web search results and analysis
  if (analysis.rawInfo) {
    console.log(`\n📄 Full Search Results & Analysis:`);
    console.log(`   ${analysis.rawInfo.split('\n').join('\n   ')}`);
  }

  // Show work options
  console.log(`\n💼 WORK OPTIONS:`);
  if (analysis.workOptions.length === 0) {
    console.log(`   (no options found)`);
  } else {
    analysis.workOptions.forEach((opt, i) => {
      console.log(`   ${i + 1}. ${opt.text}${opt.url ? ` → ${opt.url}` : ''} [${opt.confidence}]`);
    });
  }

  // Show fun options
  console.log(`\n🎯 FUN OPTIONS:`);
  if (analysis.funOptions.length === 0) {
    console.log(`   (no options found)`);
  } else {
    analysis.funOptions.forEach((opt, i) => {
      console.log(`   ${i + 1}. ${opt.text}${opt.url ? ` → ${opt.url}` : ''} [${opt.confidence}]`);
    });
  }

  // Get work selection
  const workAnswer = await askQuestion(`\nSelect WORK (1-${analysis.workOptions.length}, 0=none, c=custom, s=skip person): `);

  if (workAnswer.toLowerCase() === 's') {
    return null;
  }

  let selectedWork: WorkOption | null = null;

  const workLower = workAnswer.toLowerCase();

  if (workLower === 'c') {
    const customText = await askQuestion(`Enter custom work text: `);
    if (customText.trim()) {
      selectedWork = { text: customText.trim(), url: null, confidence: 'custom' };
    }
  } else if (workLower === '0' || workLower === '') {
    // 0 or empty = none
    selectedWork = null;
  } else {
    const workIndex = parseInt(workAnswer) - 1;
    // If a valid number selection
    if (!isNaN(workIndex) && workIndex >= 0 && workIndex < analysis.workOptions.length) {
      selectedWork = analysis.workOptions[workIndex];
    } else if (!isNaN(workIndex) && (workIndex < -1 || workIndex >= analysis.workOptions.length)) {
      // Invalid number, do nothing
      selectedWork = null;
    } else {
      // Not a number or command, treat as custom text
      selectedWork = { text: workAnswer.trim(), url: null, confidence: 'custom' };
    }
  }

  // Allow changing work URL (using all extracted URLs)
  if (selectedWork) {
    const changeUrl = await askQuestion(`Change URL for "${selectedWork.text}"? (y/n, default: ${selectedWork.url || 'none'}): `);
    // If they paste a URL instead of 'y', use that URL directly
    if (changeUrl.toLowerCase() === 'y') {
      console.log(`\nAvailable URLs:`);
      analysis.allUrls.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
      });
      console.log(`   c. Custom URL`);
      console.log(`   0. No URL`);

      const urlChoice = await askQuestion(`Select URL (1-${analysis.allUrls.length}, c=custom, 0=none): `);

      const urlLower = urlChoice.toLowerCase();

      if (urlLower === 'c') {
        const customUrl = await askQuestion(`Enter custom URL: `);
        selectedWork = { ...selectedWork, url: customUrl.trim() || null };
      } else if (urlLower === '0' || urlLower === '') {
        selectedWork = { ...selectedWork, url: null };
      } else {
        const urlIndex = parseInt(urlChoice) - 1;
        // If a valid number selection
        if (!isNaN(urlIndex) && urlIndex >= 0 && urlIndex < analysis.allUrls.length) {
          selectedWork = { ...selectedWork, url: analysis.allUrls[urlIndex] };
        } else if (!isNaN(urlIndex)) {
          // Invalid number, keep default
        } else if (urlChoice.trim().startsWith('http')) {
          // Pasted URL
          selectedWork = { ...selectedWork, url: urlChoice.trim() };
        }
      }
    } else if (changeUrl.trim().startsWith('http')) {
      // They pasted a URL directly
      selectedWork = { ...selectedWork, url: changeUrl.trim() };
    }
    // else: 'n' or anything else means keep default
  }

  // Get fun selection
  const funAnswer = await askQuestion(`Select FUN (1-${analysis.funOptions.length}, 0=none, c=custom): `);

  let selectedFun: FunOption | null = null;

  const funLower = funAnswer.toLowerCase();

  if (funLower === 'c') {
    const customText = await askQuestion(`Enter custom fun text: `);
    if (customText.trim()) {
      selectedFun = { text: customText.trim(), url: null, confidence: 'custom' };
    }
  } else if (funLower === '0' || funLower === '') {
    // 0 or empty = none
    selectedFun = null;
  } else {
    const funIndex = parseInt(funAnswer) - 1;
    // If a valid number selection
    if (!isNaN(funIndex) && funIndex >= 0 && funIndex < analysis.funOptions.length) {
      selectedFun = analysis.funOptions[funIndex];
    } else if (!isNaN(funIndex) && (funIndex < -1 || funIndex >= analysis.funOptions.length)) {
      // Invalid number, do nothing
      selectedFun = null;
    } else {
      // Not a number or command, treat as custom text
      selectedFun = { text: funAnswer.trim(), url: null, confidence: 'custom' };
    }
  }

  // Allow changing fun URL (using all extracted URLs)
  if (selectedFun) {
    const changeUrl = await askQuestion(`Change URL for "${selectedFun.text}"? (y/n, default: ${selectedFun.url || 'none'}): `);
    // If they paste a URL instead of 'y', use that URL directly
    if (changeUrl.toLowerCase() === 'y') {
      console.log(`\nAvailable URLs:`);
      analysis.allUrls.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
      });
      console.log(`   c. Custom URL`);
      console.log(`   0. No URL`);

      const urlChoice = await askQuestion(`Select URL (1-${analysis.allUrls.length}, c=custom, 0=none): `);

      const urlLower = urlChoice.toLowerCase();

      if (urlLower === 'c') {
        const customUrl = await askQuestion(`Enter custom URL: `);
        selectedFun = { ...selectedFun, url: customUrl.trim() || null };
      } else if (urlLower === '0' || urlLower === '') {
        selectedFun = { ...selectedFun, url: null };
      } else {
        const urlIndex = parseInt(urlChoice) - 1;
        // If a valid number selection
        if (!isNaN(urlIndex) && urlIndex >= 0 && urlIndex < analysis.allUrls.length) {
          selectedFun = { ...selectedFun, url: analysis.allUrls[urlIndex] };
        } else if (!isNaN(urlIndex)) {
          // Invalid number, keep default
        } else if (urlChoice.trim().startsWith('http')) {
          // Pasted URL
          selectedFun = { ...selectedFun, url: urlChoice.trim() };
        }
      }
    } else if (changeUrl.trim().startsWith('http')) {
      // They pasted a URL directly
      selectedFun = { ...selectedFun, url: changeUrl.trim() };
    }
    // else: 'n' or anything else means keep default
  }

  // Select website from profileUrls
  let selectedWebsite: string | null = analysis.member.fields.Website || null;
  const profileUrlEntries = Object.entries(analysis.profileUrls).filter(([_, url]) => url) as [string, string][];

  console.log(`\n🌐 Select primary WEBSITE (current: ${selectedWebsite || '(none)'})`);

  if (profileUrlEntries.length > 0) {
    profileUrlEntries.forEach(([label, url], i) => {
      const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);
      console.log(`   ${i + 1}. [${displayLabel}] ${url}`);
    });
  }

  console.log(`   c. Custom URL`);
  console.log(`   0. Keep current / No website`);

  const websitePrompt = profileUrlEntries.length > 0
    ? `\nSelect WEBSITE (1-${profileUrlEntries.length}, c=custom, 0=keep current): `
    : `\nSelect WEBSITE (c=custom, 0=keep current): `;

  const websiteAnswer = await askQuestion(websitePrompt);

  const websiteLower = websiteAnswer.toLowerCase();

  if (websiteLower === 'c') {
    const customUrl = await askQuestion(`Enter custom website URL: `);
    if (customUrl.trim()) {
      selectedWebsite = customUrl.trim();
    }
  } else if (websiteLower === '0' || websiteLower === '') {
    // Keep current
  } else {
    const websiteIndex = parseInt(websiteAnswer) - 1;
    // If a valid number selection
    if (!isNaN(websiteIndex) && websiteIndex >= 0 && websiteIndex < profileUrlEntries.length) {
      selectedWebsite = profileUrlEntries[websiteIndex][1];
    } else if (!isNaN(websiteIndex)) {
      // Invalid number, keep current
    } else if (websiteAnswer.trim().startsWith('http')) {
      // Pasted URL
      selectedWebsite = websiteAnswer.trim();
    }
  }

  return {
    workThing: selectedWork?.text || null,
    workThingUrl: selectedWork?.url || null,
    funThing: selectedFun?.text || null,
    funThingUrl: selectedFun?.url || null,
    website: selectedWebsite,
  };
}

async function main() {
  console.log('🚀 Starting interactive work/fun thing editor...\n');

  // Validate environment variables
  if (!process.env.AIRTABLE_WRITE_KEY) {
    throw new Error('AIRTABLE_WRITE_KEY is not set');
  }
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is not set');
  }

  // Check worker status
  console.log('Checking worker status...');
  const status = await getWorkerStatus();
  if (!status) {
    console.error('\n❌ Cannot connect to worker. Make sure it\'s running:');
    console.error('   bun scripts/work-fun-worker.ts\n');
    process.exit(1);
  }

  console.log(`✅ Worker connected: ${status.queueSize} ready, ${status.remaining} remaining\n`);

  let updated = 0;
  let skipped = 0;

  // Process members
  while (true) {
    const analysis = await getNextPerson();
    if (!analysis) {
      console.log('\n✅ No more members to process');
      break;
    }

    const selection = await interactivePrompt(analysis);

    if (selection === null) {
      console.log('⏭️  Skipped\n');
      skipped++;
      continue;
    }

    // Update Airtable
    console.log('\n💾 Saving to Airtable...');
    const success = await updateMemberInAirtable(
      analysis.member.id,
      selection.workThing,
      selection.workThingUrl,
      selection.funThing,
      selection.funThingUrl,
      selection.website
    );

    if (success) {
      console.log('✅ Saved successfully\n');
      updated++;

      // Acknowledge to worker that this person has been processed
      try {
        await fetch(`${WORKER_URL}/acknowledge`, { method: 'POST' });
      } catch (error) {
        console.warn('⚠️  Failed to acknowledge to worker (non-fatal)');
      }
    } else {
      console.log('❌ Failed to save\n');
    }

    // Show progress
    const newStatus = await getWorkerStatus();
    if (newStatus) {
      console.log(`📊 Progress: ${newStatus.processed} processed, ${newStatus.queueSize} ready, ${newStatus.remaining} remaining\n`);
    }

    // Brief delay for rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log('='.repeat(70));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
