#!/usr/bin/env node
// RPGPO Board of AI Runner
//
// Orchestrates three AI roles against live RPGPO data:
//   1. Claude   = Builder / TopRanker reviewer (prompt generation)
//   2. OpenAI   = Chief of Staff / synthesis / daily briefing
//   3. Perplexity = Research Director / quick research scan
//
// Safe: reads local files, calls APIs, writes reports.
// Does NOT send emails, post, trade, or make external submissions.

const fs = require('fs');
const path = require('path');
const https = require('https');

const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const today = new Date().toISOString().slice(0, 10);
const runTs = new Date().toISOString();

// --- Helpers ---

function readFile(rel) {
  try { return fs.readFileSync(path.join(RPGPO_ROOT, rel), 'utf-8'); } catch { return null; }
}

function listDir(rel) {
  try { return fs.readdirSync(path.join(RPGPO_ROOT, rel)).filter(f => !f.startsWith('.') && f.endsWith('.md')); } catch { return []; }
}

function writeOutput(rel, content) {
  const full = path.join(RPGPO_ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return rel;
}

function extractField(md, field) {
  const re = new RegExp('^## ' + field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n([\\s\\S]*?)(?=\\n## |$)', 'm');
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

// --- Collect RPGPO context ---

function gatherContext() {
  // Missions
  const missionFiles = listDir('03-Operations/MissionStatus');
  const missions = missionFiles.map(f => {
    const md = readFile('03-Operations/MissionStatus/' + f);
    if (!md) return null;
    return {
      name: extractField(md, 'Mission'),
      status: extractField(md, 'Current Status'),
      objective: extractField(md, 'Current Objective'),
      blockers: extractField(md, 'Blockers'),
      nextActions: extractField(md, 'Next Recommended Actions'),
    };
  }).filter(Boolean);

  // Research queue
  const state = JSON.parse(readFile('04-Dashboard/state/dashboard-state.json') || '{}');
  const researchQueue = state.research_queue || [];

  // TopRanker summary
  const toprankerSummary = readFile('03-Operations/Reports/TopRanker-Operating-Summary.md') || 'Not available.';

  // Latest daily brief
  const briefs = listDir('03-Operations/DailyBriefs').sort().reverse();
  const latestBrief = briefs.length > 0 ? readFile('03-Operations/DailyBriefs/' + briefs[0]) : 'No daily brief available.';

  // Pending approvals
  const pendingApprovals = listDir('03-Operations/Approvals/Pending');

  return { missions, researchQueue, toprankerSummary, latestBrief, pendingApprovals };
}

function contextToText(ctx) {
  let text = '# RPGPO Current State\n\n';

  text += '## Missions\n';
  for (const m of ctx.missions) {
    text += `### ${m.name}\n- Status: ${m.status}\n- Objective: ${m.objective}\n- Blockers: ${m.blockers}\n- Next: ${m.nextActions}\n\n`;
  }

  text += '## Research Queue\n';
  text += ctx.researchQueue.map(r => `- ${r}`).join('\n') + '\n\n';

  text += '## Pending Approvals\n';
  text += (ctx.pendingApprovals.length > 0 ? ctx.pendingApprovals.map(a => `- ${a}`).join('\n') : '- None') + '\n\n';

  text += '## Latest Daily Brief\n' + ctx.latestBrief + '\n\n';

  text += '## TopRanker Operating Summary (excerpt)\n';
  // Include first 2000 chars to stay within token limits
  text += ctx.toprankerSummary.slice(0, 2000) + '\n';

  return text;
}

// --- API callers ---

function callOpenAI(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return reject(new Error('OPENAI_API_KEY not set'));

    const body = JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(new Error('OpenAI parse error: ' + data.slice(0, 300)));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('OpenAI timeout')); });
    req.write(body);
    req.end();
  });
}

function callPerplexity(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const key = process.env.PERPLEXITY_API_KEY;
    if (!key) return reject(new Error('PERPLEXITY_API_KEY not set'));

    const body = JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
          resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(new Error('Perplexity parse error: ' + data.slice(0, 300)));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('Perplexity timeout')); });
    req.write(body);
    req.end();
  });
}

// --- Board roles ---

async function runChiefOfStaff(contextText) {
  const systemPrompt = `You are the RPGPO Chief of Staff. Your role is to synthesize mission statuses, identify the single most important action for today, surface blockers, and produce a concise daily executive briefing.

Rules:
- Be direct and concise
- Separate facts from recommendations
- Highlight what needs Rahul's decision
- TopRanker is the flagship mission — give it priority
- Output in clean markdown`;

  const userPrompt = `Here is the current RPGPO state. Produce today's executive briefing with:
1. Executive summary (2-3 sentences)
2. Top 3 priorities for today
3. Mission status overview (1-2 lines each)
4. Blockers requiring Rahul's attention
5. Recommended next action

${contextText}`;

  return callOpenAI(systemPrompt, userPrompt);
}

async function runResearchDirector(contextText, researchQueue) {
  const topics = researchQueue.length > 0
    ? researchQueue.join(', ')
    : 'TopRanker growth strategies, local business leaderboard market landscape';

  const systemPrompt = `You are the RPGPO Research Director. Your role is to provide quick, actionable research intelligence on topics from the research queue. You have web access.

Rules:
- Be concise and evidence-based
- Cite specific facts, numbers, or examples
- Focus on what is actionable for a founder building products
- Do not speculate — if you are unsure, say so
- Output in clean markdown with clear sections`;

  const userPrompt = `Research these topics and provide a concise intelligence brief for each:

Topics: ${topics}

For each topic provide:
1. Key findings (3-5 bullet points of specific, useful facts)
2. Actionable insight (1-2 sentences on what to do with this)
3. Confidence level (high/medium/low)

Keep the total response concise and scannable.`;

  return callPerplexity(systemPrompt, userPrompt);
}

function runBuilder(contextText) {
  // Claude step: generate the review prompt that can be used in a Claude session.
  // This runs locally — no API call needed. Claude is invoked by the user separately.

  const toprankerSection = contextText.split('## TopRanker Operating Summary')[1] || '';

  const prompt = `You are operating inside Rahul Pitta Governed Private Office (RPGPO) as the Builder / CTO.

Today's date: ${today}

Your task: Review the current TopRanker state and produce a focused technical assessment.

Read these files:
- /Users/rpgpo/Projects/RPGPO/03-Operations/Reports/TopRanker-Operating-Summary.md
- /Users/rpgpo/Projects/RPGPO/03-Operations/MissionStatus/TopRanker.md
- /Users/rpgpo/Projects/RPGPO/02-Projects/TopRanker/Notes/TopRanker-Synthesis.md

Then produce:
1. Top 3 technical priorities for this week
2. Any deployment blockers or risks
3. One specific improvement to implement next
4. Estimated effort for each item (small/medium/large)

Write your assessment to:
/Users/rpgpo/Projects/RPGPO/03-Operations/Reports/TopRanker-Technical-Review-${today}.md

Be concise, specific, and action-oriented. Do not make destructive changes.`;

  return prompt;
}

// --- Main orchestrator ---

async function runBoard() {
  const results = {
    timestamp: runTs,
    steps: [],
    filesWritten: [],
    errors: [],
  };

  console.log('=== RPGPO Board of AI ===');
  console.log(`Run started: ${runTs}`);
  console.log('');

  // Step 0: Gather context
  console.log('Gathering RPGPO context...');
  const ctx = gatherContext();
  const contextText = contextToText(ctx);
  console.log(`  Missions: ${ctx.missions.length}`);
  console.log(`  Research queue: ${ctx.researchQueue.length} items`);
  console.log(`  Pending approvals: ${ctx.pendingApprovals.length}`);
  console.log('');

  // Step 1: Claude Builder — prompt generation (always available)
  console.log('[1/3] Claude Builder — generating TopRanker review prompt...');
  try {
    const claudePrompt = runBuilder(contextText);
    const claudeFile = writeOutput(
      `03-Operations/Reports/Claude-Builder-Prompt-${today}.md`,
      claudePrompt
    );
    results.steps.push({ role: 'Claude Builder', status: 'success', model: 'prompt-generation' });
    results.filesWritten.push(claudeFile);
    console.log(`  Prompt written to: ${claudeFile}`);
    console.log('  Use "Launch Claude Session" to run this prompt.');
  } catch (e) {
    results.steps.push({ role: 'Claude Builder', status: 'error', error: e.message });
    results.errors.push('Claude Builder: ' + e.message);
    console.log('  Error: ' + e.message);
  }
  console.log('');

  // Step 2: OpenAI Chief of Staff — executive briefing
  console.log('[2/3] OpenAI Chief of Staff — generating executive briefing...');
  if (!process.env.OPENAI_API_KEY) {
    const msg = 'OPENAI_API_KEY not set. Skipping Chief of Staff briefing.';
    results.steps.push({ role: 'OpenAI Chief of Staff', status: 'skipped', error: msg });
    results.errors.push(msg);
    console.log('  ' + msg);
  } else {
    try {
      const briefing = await runChiefOfStaff(contextText);
      const briefFile = writeOutput(
        `03-Operations/DailyBriefs/${today}-BoardBrief.md`,
        `# RPGPO Board Brief\n## Generated: ${runTs}\n## Source: OpenAI Chief of Staff\n\n${briefing}\n`
      );
      results.steps.push({ role: 'OpenAI Chief of Staff', status: 'success', model: 'gpt-4o' });
      results.filesWritten.push(briefFile);
      console.log(`  Briefing written to: ${briefFile}`);
    } catch (e) {
      results.steps.push({ role: 'OpenAI Chief of Staff', status: 'error', error: e.message });
      results.errors.push('OpenAI: ' + e.message);
      console.log('  Error: ' + e.message);
    }
  }
  console.log('');

  // Step 3: Perplexity Research Director — research scan
  console.log('[3/3] Perplexity Research Director — running research scan...');
  if (!process.env.PERPLEXITY_API_KEY) {
    const msg = 'PERPLEXITY_API_KEY not set. Skipping research scan.';
    results.steps.push({ role: 'Perplexity Research Director', status: 'skipped', error: msg });
    results.errors.push(msg);
    console.log('  ' + msg);
  } else {
    try {
      const research = await runResearchDirector(contextText, ctx.researchQueue);
      const researchFile = writeOutput(
        `03-Operations/Reports/Research-Scan-${today}.md`,
        `# RPGPO Research Scan\n## Generated: ${runTs}\n## Source: Perplexity Research Director\n\n${research}\n`
      );
      results.steps.push({ role: 'Perplexity Research Director', status: 'success', model: 'sonar' });
      results.filesWritten.push(researchFile);
      console.log(`  Research written to: ${researchFile}`);
    } catch (e) {
      results.steps.push({ role: 'Perplexity Research Director', status: 'error', error: e.message });
      results.errors.push('Perplexity: ' + e.message);
      console.log('  Error: ' + e.message);
    }
  }
  console.log('');

  // Step 4: Write board run log
  const successCount = results.steps.filter(s => s.status === 'success').length;
  const skipCount = results.steps.filter(s => s.status === 'skipped').length;
  const errorCount = results.steps.filter(s => s.status === 'error').length;

  const logContent = `# RPGPO Board of AI Run Log

## Timestamp
${runTs}

## Summary
Board run completed. ${successCount} succeeded, ${skipCount} skipped, ${errorCount} failed.

## Steps
${results.steps.map(s => `- **${s.role}**: ${s.status}${s.model ? ` (${s.model})` : ''}${s.error ? ` — ${s.error}` : ''}`).join('\n')}

## Files Written
${results.filesWritten.length > 0 ? results.filesWritten.map(f => `- ${f}`).join('\n') : '- None'}

## Errors
${results.errors.length > 0 ? results.errors.map(e => `- ${e}`).join('\n') : '- None'}

## Risk Level
Green (read + write reports only, no external actions)
`;

  const logFile = writeOutput(
    `03-Operations/Logs/AgentRuns/${today}-BoardRun.md`,
    logContent
  );
  results.filesWritten.push(logFile);

  console.log('=== Board Run Complete ===');
  console.log(`  Succeeded: ${successCount}/3`);
  console.log(`  Skipped:   ${skipCount}/3`);
  console.log(`  Errors:    ${errorCount}/3`);
  console.log(`  Files:     ${results.filesWritten.join(', ')}`);
  if (results.errors.length > 0) {
    console.log('');
    console.log('Missing keys? Set them and restart:');
    if (!process.env.OPENAI_API_KEY) console.log('  export OPENAI_API_KEY=sk-...');
    if (!process.env.PERPLEXITY_API_KEY) console.log('  export PERPLEXITY_API_KEY=pplx-...');
  }

  // Output JSON for the server to parse
  console.log('\n__BOARD_RESULT__' + JSON.stringify(results));
}

runBoard().catch(e => {
  console.error('Board runner fatal error:', e.message);
  process.exit(1);
});
