// RPGPO Board Deliberation Engine
// Runs structured AI deliberation on intake tasks.
// Produces interpreted objective, strategy, subtask breakdown.
// Safe: read-only against RPGPO files, AI calls only.

const { callOpenAI } = require('./ai');
const { readFile } = require('./files');
const costs = require('./costs');

// Domain-specific context for richer deliberation
const DOMAIN_CONTEXT = {
  topranker: {
    description: 'TopRanker is a community-ranked local business leaderboard app. Stack: Expo/React Native + Express + PostgreSQL. It is the flagship RPGPO mission.',
    key_files: [
      '03-Operations/MissionStatus/TopRanker.md',
      '03-Operations/Reports/TopRanker-Operating-Summary.md',
    ],
    governed_loop: ['audit', 'decide', 'implement', 'report'],
    specialists: ['builder', 'strategy'],
  },
  careeregine: {
    description: 'CareerEngine is a career management tool.',
    key_files: ['03-Operations/MissionStatus/CareerEngine.md'],
    governed_loop: ['audit', 'decide', 'implement', 'report'],
    specialists: ['builder'],
  },
  general: {
    description: 'General RPGPO task.',
    key_files: [],
    governed_loop: ['audit', 'decide', 'implement', 'report'],
    specialists: ['chief'],
  },
};

function getDomainContext(domain) {
  return DOMAIN_CONTEXT[domain] || DOMAIN_CONTEXT.general;
}

// Read domain key files to provide context to the deliberation
function gatherDomainFiles(domain) {
  const ctx = getDomainContext(domain);
  const contents = [];
  for (const f of ctx.key_files) {
    const c = readFile(f);
    if (c) contents.push(`### ${f}\n${c.slice(0, 1500)}`);
  }
  return contents.join('\n\n');
}

/**
 * Run board deliberation on an intake task.
 * Returns { deliberation, costEntry }
 */
async function deliberate(task) {
  const domainCtx = getDomainContext(task.domain);
  const domainFiles = gatherDomainFiles(task.domain);
  const stages = domainCtx.governed_loop.join(', ');

  const systemPrompt = `You are the RPGPO Board of AI. You deliberate on tasks before execution.
You have three perspectives:
1. Chief of Staff — interprets objective, assesses feasibility, identifies what needs Rahul's decision
2. Critic — challenges assumptions, identifies risks, unknowns, and failure modes
3. Domain Specialist (${task.domain}) — proposes specific technical/strategic approach

Domain context: ${domainCtx.description}

Rules:
- Be specific, actionable, and concise
- Every subtask must be small and bounded (one AI call or one file operation)
- Subtask stages must follow the governed loop: ${stages}
- Mark subtasks that change external state or involve risk as approval_required: true
- For "implement" stage subtasks on code changes, assign to "claude" model (local execution)
- Assign the best model for each subtask: openai for synthesis/analysis, perplexity for research, gemini for strategy, claude for implementation
- Risk levels: green (safe, reversible), yellow (needs review), red (needs explicit approval)
- Output valid JSON only, no markdown wrapping`;

  const userPrompt = `Deliberate on this task:

## Raw Request
${task.raw_request}

## Domain
${task.domain}

## Urgency
${task.urgency}

## Desired Outcome
${task.desired_outcome || 'Not specified — infer from request'}

## Constraints
${task.constraints || 'Standard RPGPO safety rules apply'}

${domainFiles ? '## Domain Files\n' + domainFiles : ''}

Produce a JSON object with exactly these fields:
{
  "interpreted_objective": "one clear sentence",
  "expected_outcome": "what success looks like",
  "key_unknowns": ["list of things we don't know"],
  "recommended_strategy": "2-3 sentence approach",
  "risk_level": "green|yellow|red",
  "approval_points": ["list of decisions requiring Rahul"],
  "subtasks": [
    {
      "title": "short title",
      "stage": "${stages}",
      "assigned_role": "chief|builder|research|strategy|creative",
      "assigned_model": "openai|perplexity|gemini|claude",
      "expected_output": "what this subtask produces",
      "prompt": "the specific prompt to send to the AI model for this subtask",
      "files_to_read": ["relative paths from RPGPO root"],
      "files_to_write": ["relative paths"],
      "risk_level": "green|yellow|red",
      "approval_required": false,
      "depends_on": []
    }
  ]
}

depends_on contains indices (0-based) of subtasks that must complete first.
Keep subtasks to 3-6 items. Each must be completable in one AI call.`;

  const result = await callOpenAI(systemPrompt, userPrompt, { maxTokens: 3000 });

  // Parse the JSON response
  let deliberation;
  try {
    // Strip markdown code fences if present
    let text = result.text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    deliberation = JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from the response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      deliberation = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse deliberation JSON: ' + result.text.slice(0, 200));
    }
  }

  // Validate required fields
  if (!deliberation.interpreted_objective) throw new Error('Missing interpreted_objective');
  if (!deliberation.subtasks || !Array.isArray(deliberation.subtasks)) throw new Error('Missing subtasks array');

  // Record cost
  const costEntry = costs.recordCost({
    provider: 'openai',
    model: result.model,
    inputTokens: result.usage.inputTokens,
    outputTokens: result.usage.outputTokens,
    totalTokens: result.usage.totalTokens,
    taskId: task.task_id,
    taskType: 'deliberation',
    role: 'board',
  });

  return {
    deliberation: {
      timestamp: new Date().toISOString(),
      ...deliberation,
      model_used: result.model,
      tokens_used: result.usage.totalTokens,
    },
    costEntry,
  };
}

module.exports = { deliberate, getDomainContext, DOMAIN_CONTEXT };
