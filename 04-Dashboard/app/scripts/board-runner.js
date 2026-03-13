#!/usr/bin/env node
// RPGPO Board of AI Runner v6
//
// Orchestrates four AI roles against live RPGPO data:
//   1. Claude    = Builder / TopRanker reviewer (prompt generation)
//   2. OpenAI    = Chief of Staff / synthesis / daily briefing
//   3. Perplexity = Research Director / quick research scan
//   4. Gemini    = Growth Strategist / market analysis
//
// Safe: reads local files, calls APIs, writes reports.
// Does NOT send emails, post, trade, or make external submissions.

const fs = require('fs');
const path = require('path');

const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const today = new Date().toISOString().slice(0, 10);
const runTs = new Date().toISOString();
const boardRunId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Load .env from app dir
(function loadEnv() {
  try {
    const lines = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8').split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
})();

const { callOpenAI, callPerplexity, callGemini, PROVIDER_STATES } = require('../lib/ai');
const costs = require('../lib/costs');

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

  const state = JSON.parse(readFile('04-Dashboard/state/dashboard-state.json') || '{}');
  const researchQueue = state.research_queue || [];
  const toprankerSummary = readFile('03-Operations/Reports/TopRanker-Operating-Summary.md') || 'Not available.';
  const briefs = listDir('03-Operations/DailyBriefs').sort().reverse();
  const latestBrief = briefs.length > 0 ? readFile('03-Operations/DailyBriefs/' + briefs[0]) : 'No daily brief available.';
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
  text += ctx.toprankerSummary.slice(0, 2000) + '\n';

  return text;
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

async function runGrowthStrategist(contextText) {
  const systemPrompt = `You are the RPGPO Growth Strategist. Your role is to analyze the current state of missions and propose specific, actionable growth strategies.

Rules:
- Focus on TopRanker as the flagship
- Propose concrete, testable ideas — not vague advice
- Consider cold start, distribution, positioning, and monetization
- Be brief and structured
- Output in clean markdown`;

  const userPrompt = `Here is the current RPGPO state. Analyze and produce:
1. Top growth opportunity for TopRanker right now (specific, actionable)
2. One positioning insight that could improve traction
3. One monetization experiment worth testing this week
4. Brief competitive landscape observation

${contextText}`;

  // Use cost settings for model selection
  const costSettings = costs.getSettings();
  const geminiModel = costSettings.geminiModel || 'gemini-2.5-flash-lite';

  return callGemini(systemPrompt, userPrompt, { model: geminiModel });
}

function runBuilder(contextText) {
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
  const totalSteps = 4;
  const results = {
    timestamp: runTs,
    boardRunId,
    steps: [],
    filesWritten: [],
    errors: [],
    costs: [],
  };

  console.log('=== RPGPO Board of AI v6 ===');
  console.log(`Run started: ${runTs}`);
  console.log(`Board run ID: ${boardRunId}`);
  console.log('');

  // Step 0: Gather context
  console.log('Gathering RPGPO context...');
  const ctx = gatherContext();
  const contextText = contextToText(ctx);
  console.log(`  Missions: ${ctx.missions.length}`);
  console.log(`  Research queue: ${ctx.researchQueue.length} items`);
  console.log(`  Pending approvals: ${ctx.pendingApprovals.length}`);
  console.log('');

  // Step 1: Claude Builder
  console.log(`[1/${totalSteps}] Claude Builder — generating TopRanker review prompt...`);
  try {
    const claudePrompt = runBuilder(contextText);
    const claudeFile = writeOutput(
      `03-Operations/Reports/Claude-Builder-Prompt-${today}.md`,
      claudePrompt
    );
    results.steps.push({ role: 'Claude Builder', status: 'success', model: 'prompt-generation' });
    results.filesWritten.push(claudeFile);
    console.log(`  Prompt written to: ${claudeFile}`);
  } catch (e) {
    results.steps.push({ role: 'Claude Builder', status: 'error', error: e.message });
    results.errors.push('Claude Builder: ' + e.message);
    console.log('  Error: ' + e.message);
  }
  console.log('');

  // Step 2: OpenAI Chief of Staff
  console.log(`[2/${totalSteps}] OpenAI Chief of Staff — generating executive briefing...`);
  if (!process.env.OPENAI_API_KEY) {
    results.steps.push({ role: 'OpenAI Chief of Staff', status: 'skipped', providerState: PROVIDER_STATES.MISSING });
    console.log('  Skipped: OPENAI_API_KEY not configured.');
  } else {
    try {
      const result = await runChiefOfStaff(contextText);
      const briefFile = writeOutput(
        `03-Operations/DailyBriefs/${today}-BoardBrief.md`,
        `# RPGPO Board Brief\n## Generated: ${runTs}\n## Source: OpenAI Chief of Staff\n\n${result.text}\n`
      );
      results.steps.push({ role: 'OpenAI Chief of Staff', status: 'success', model: result.model });
      results.filesWritten.push(briefFile);
      console.log(`  Briefing written to: ${briefFile}`);

      // Record cost
      const costEntry = costs.recordCost({
        provider: 'openai', model: result.model,
        inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        taskType: 'board-run', role: 'chief', boardRunId,
      });
      results.costs.push(costEntry);
      console.log(`  Tokens: ${result.usage.totalTokens} | Est cost: $${costEntry.cost.toFixed(4)}`);
    } catch (e) {
      const state = e.providerState || 'error';
      results.steps.push({ role: 'OpenAI Chief of Staff', status: 'error', error: e.message, providerState: state });
      results.errors.push('OpenAI: ' + e.message);
      console.log('  Error: ' + e.message);
    }
  }
  console.log('');

  // Step 3: Perplexity Research Director
  console.log(`[3/${totalSteps}] Perplexity Research Director — running research scan...`);
  if (!process.env.PERPLEXITY_API_KEY) {
    results.steps.push({ role: 'Perplexity Research Director', status: 'skipped', providerState: PROVIDER_STATES.MISSING });
    console.log('  Skipped: PERPLEXITY_API_KEY not configured.');
  } else {
    try {
      const result = await runResearchDirector(contextText, ctx.researchQueue);
      const researchFile = writeOutput(
        `03-Operations/Reports/Research-Scan-${today}.md`,
        `# RPGPO Research Scan\n## Generated: ${runTs}\n## Source: Perplexity Research Director\n\n${result.text}\n`
      );
      results.steps.push({ role: 'Perplexity Research Director', status: 'success', model: result.model });
      results.filesWritten.push(researchFile);
      console.log(`  Research written to: ${researchFile}`);

      const costEntry = costs.recordCost({
        provider: 'perplexity', model: result.model,
        inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        cost: result.usage.cost,
        taskType: 'board-run', role: 'research', boardRunId,
      });
      results.costs.push(costEntry);
      console.log(`  Tokens: ${result.usage.totalTokens} | Est cost: $${costEntry.cost.toFixed(4)}`);
    } catch (e) {
      const state = e.providerState || 'error';
      results.steps.push({ role: 'Perplexity Research Director', status: 'error', error: e.message, providerState: state });
      results.errors.push('Perplexity: ' + e.message);
      console.log('  Error: ' + e.message);
    }
  }
  console.log('');

  // Step 4: Gemini Growth Strategist
  console.log(`[4/${totalSteps}] Gemini Growth Strategist — generating growth analysis...`);
  if (!process.env.GEMINI_API_KEY) {
    results.steps.push({ role: 'Gemini Growth Strategist', status: 'skipped', providerState: PROVIDER_STATES.MISSING });
    console.log('  Skipped: GEMINI_API_KEY not configured.');
  } else {
    // Check budget before calling
    const budgetCheck = costs.checkBudget('gemini');
    if (!budgetCheck.ok) {
      results.steps.push({ role: 'Gemini Growth Strategist', status: 'skipped', providerState: 'budget_exceeded',
        error: `Daily budget exceeded ($${budgetCheck.todayCost.toFixed(4)} / $${budgetCheck.limit})` });
      console.log(`  Skipped: Daily budget exceeded ($${budgetCheck.todayCost.toFixed(4)} / $${budgetCheck.limit})`);
    } else {
      if (budgetCheck.warning) {
        console.log(`  Warning: Approaching daily budget ($${budgetCheck.todayCost.toFixed(4)} / $${budgetCheck.limit})`);
      }
      try {
        const result = await runGrowthStrategist(contextText);
        const growthFile = writeOutput(
          `03-Operations/Reports/Growth-Strategy-${today}.md`,
          `# RPGPO Growth Strategy\n## Generated: ${runTs}\n## Source: Gemini Growth Strategist\n\n${result.text}\n`
        );
        results.steps.push({ role: 'Gemini Growth Strategist', status: 'success', model: result.model });
        results.filesWritten.push(growthFile);
        console.log(`  Growth strategy written to: ${growthFile}`);

        const costEntry = costs.recordCost({
          provider: 'gemini', model: result.model,
          inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
          totalTokens: result.usage.totalTokens,
          taskType: 'board-run', role: 'strategy', boardRunId,
        });
        results.costs.push(costEntry);
        console.log(`  Tokens: ${result.usage.totalTokens} | Est cost: $${costEntry.cost.toFixed(4)}`);
      } catch (e) {
        const state = e.providerState || 'error';
        // Classify and continue in 3-model mode
        const stateLabel = state === PROVIDER_STATES.QUOTA_UNAVAILABLE ? 'quota unavailable'
          : state === PROVIDER_STATES.MODEL_UNAVAILABLE ? 'model unavailable'
          : state === PROVIDER_STATES.AUTH_FAILED ? 'auth failed'
          : 'error';
        results.steps.push({ role: 'Gemini Growth Strategist', status: 'skipped', error: e.message, providerState: state });
        results.errors.push(`Gemini (${stateLabel}): ${e.message}`);
        console.log(`  ${stateLabel}: ${e.message}`);
        console.log('  Continuing with 3-model Board run.');
      }
    }
  }
  console.log('');

  // Step 5: Write board run log
  const successCount = results.steps.filter(s => s.status === 'success').length;
  const skipCount = results.steps.filter(s => s.status === 'skipped').length;
  const errorCount = results.steps.filter(s => s.status === 'error').length;
  const totalCost = results.costs.reduce((s, c) => s + (c.cost || 0), 0);

  const logContent = `# RPGPO Board of AI Run Log

## Timestamp
${runTs}

## Board Run ID
${boardRunId}

## Summary
Board run completed. ${successCount} succeeded, ${skipCount} skipped, ${errorCount} failed out of ${totalSteps} steps.

## Cost
Total estimated: $${totalCost.toFixed(4)}
${results.costs.map(c => `- ${c.provider}/${c.model}: ${c.totalTokens} tokens, $${c.cost.toFixed(4)}`).join('\n') || '- No API calls with cost data'}

## Steps
${results.steps.map(s => `- **${s.role}**: ${s.status}${s.model ? ` (${s.model})` : ''}${s.providerState ? ` [${s.providerState}]` : ''}${s.error ? ` — ${s.error}` : ''}`).join('\n')}

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
  console.log(`  Succeeded: ${successCount}/${totalSteps}`);
  console.log(`  Skipped:   ${skipCount}/${totalSteps}`);
  console.log(`  Errors:    ${errorCount}/${totalSteps}`);
  console.log(`  Cost:      $${totalCost.toFixed(4)}`);
  console.log(`  Files:     ${results.filesWritten.join(', ')}`);

  // Output JSON for the worker to parse
  console.log('\n__BOARD_RESULT__' + JSON.stringify(results));
}

runBoard().catch(e => {
  console.error('Board runner fatal error:', e.message);
  process.exit(1);
});
