"use strict";
// RPGPO Board Deliberation Engine
// Runs structured AI deliberation on intake tasks.
// Produces interpreted objective, strategy, subtask breakdown.
// Safe: read-only against RPGPO files, AI calls only.
Object.defineProperty(exports, "__esModule", { value: true });
const { callOpenAI } = require('./ai');
const { readFile, RPGPO_ROOT } = require('./files');
const costs = require('./costs');
const repoScanner = require('./repo-scanner');
const contextEngine = require('./context');
const path = require('path');
const fs = require('fs');
// Part 67: Structured output imports
let _structuredEnabled = false;
let _structuredChecked = false;
function isStructuredEnabled() {
    if (_structuredChecked)
        return _structuredEnabled;
    _structuredChecked = true;
    try {
        const { loadContractAwareConfig } = require('./config/ai-io');
        _structuredEnabled = loadContractAwareConfig().enabled;
    }
    catch {
        _structuredEnabled = false;
    }
    return _structuredEnabled;
}
const DOMAIN_CONTEXT = {
    topranker: {
        description: 'Startup and business builder engine. Handles product strategy, competitive analysis, GTM planning, code architecture, and feature implementation for the operator\'s startup projects.',
        key_files: [],
        governed_loop: ['audit', 'decide', 'implement', 'report'],
        specialists: ['builder', 'strategy'],
    },
    careeregine: {
        description: 'Career intelligence engine for Rahul (Senior Data Engineer / Entrepreneur). Covers job search, salary benchmarking, interview prep, career strategy, and skill development. Outputs must include specific companies, salary ranges, job listings, and actionable next steps — never generic career advice.',
        key_files: ['03-Operations/MissionStatus/CareerEngine.md'],
        governed_loop: ['research', 'strategy', 'report'],
        specialists: ['research', 'strategy'],
    },
    newsroom: {
        description: 'News intelligence engine. Produces curated news digests from live web search. Outputs must include real headlines, source URLs, publication dates, and relevance analysis. ALWAYS use Perplexity for research (it has web search). NEVER produce template text or placeholders.',
        key_files: [],
        governed_loop: ['research', 'audit', 'report'],
        specialists: ['research'],
    },
    wealthresearch: {
        description: 'Wealth and income research engine for Rahul. Covers passive income ideas, investment opportunities, side project analysis, and financial strategy. Outputs must include specific revenue estimates, real examples, market data, and concrete first steps — not generic financial advice.',
        key_files: [],
        governed_loop: ['research', 'strategy', 'report'],
        specialists: ['research', 'strategy'],
    },
    personalops: {
        description: 'Personal operations and planning engine. Weekly planning, time management, priority setting. Outputs should be specific daily/weekly plans with time blocks, not abstract productivity frameworks.',
        key_files: [],
        governed_loop: ['audit', 'decide', 'report'],
        specialists: ['chief'],
    },
    writing: {
        description: 'Writing and documentation engine. Produces professional emails, PRDs, SOPs, memos, board docs, summaries, and proposals. Outputs must be clear, tailored to audience, structurally sound, and immediately usable. Match the requested tone (executive, casual, technical). Never produce generic boilerplate.',
        key_files: [],
        governed_loop: ['audit', 'report'],
        specialists: ['chief'],
    },
    research: {
        description: 'Research and analysis engine. Produces deep-dive research briefs, market analysis, competitive comparisons, risk assessments, and evidence-based recommendations. ALWAYS use Perplexity for web research first, then OpenAI for synthesis. Outputs must include specific data, citations with URLs, tradeoffs, and concrete recommendations.',
        key_files: [],
        governed_loop: ['research', 'report'],
        specialists: ['research'],
    },
    learning: {
        description: 'Learning and tutoring engine. Produces personalized study plans, concept explanations, adaptive quizzes, and skill assessments. Outputs should use clear analogies, build from simple to complex, include practice questions, and adapt to the learner level. For Rahul: assume strong technical background in data engineering.',
        key_files: [],
        governed_loop: ['research', 'report'],
        specialists: ['research'],
    },
    shopping: {
        description: 'Shopping and buying advisor engine. Produces product comparisons, shortlists, buying recommendations, and value analyses. Use Perplexity for current pricing and reviews. Outputs must include specific products, prices, pros/cons, and a clear recommendation with reasoning.',
        key_files: [],
        governed_loop: ['research', 'report'],
        specialists: ['research'],
    },
    travel: {
        description: 'Travel and relocation planning engine. Produces itineraries, cost estimates, comparison analyses, and relocation checklists. Use Perplexity for current pricing and availability. Outputs must include specific options, dates, costs, and logistics.',
        key_files: [],
        governed_loop: ['research', 'report'],
        specialists: ['research'],
    },
    health: {
        description: 'Health and wellness coaching engine. Produces workout plans, meal guidance, habit-building strategies, and wellness assessments. Outputs must be specific, evidence-based, and actionable. Include safety disclaimers where appropriate.',
        key_files: [],
        governed_loop: ['research', 'report'],
        specialists: ['research'],
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
        if (c)
            contents.push(`### ${f}\n${c.slice(0, 1500)}`);
    }
    return contents.join('\n\n');
}
/**
 * Detect if a task is a coding/build task based on the request text.
 */
function isCodeTask(taskText) {
    const lower = (taskText || '').toLowerCase();
    const codeKeywords = ['implement', 'build', 'code', 'fix bug', 'add feature', 'refactor',
        'performance', 'optimize', 'startup', 'render', 'component', 'endpoint',
        'api', 'migration', 'schema', 'hook', 'test', 'style', 'css', 'layout'];
    return codeKeywords.some(k => lower.includes(k));
}
/**
 * Run board deliberation on an intake task.
 * For coding tasks, performs mandatory repo grounding first.
 * Returns { deliberation, costEntry }
 */
async function deliberate(task) {
    const domainCtx = getDomainContext(task.domain);
    const domainFiles = gatherDomainFiles(task.domain);
    const stages = domainCtx.governed_loop.join(', ');
    const codeTask = isCodeTask(task.raw_request);
    // ── Mandatory repo grounding for code tasks ──
    let repoGrounding = null;
    let repoSection = '';
    if (codeTask) {
        repoGrounding = repoScanner.groundInRepo(task.domain, task.raw_request);
        if (repoGrounding.grounded) {
            repoSection = `\n## REAL REPO STRUCTURE (mandatory — use only these paths)
${repoGrounding.tree}`;
            if (repoGrounding.candidates.length > 0) {
                repoSection += `\n## CANDIDATE TARGET FILES (identified by repo scan)
These are real files that likely relate to this task:
${repoGrounding.candidates.slice(0, 20).map(c => `- ${c.path} (${c.area}: ${c.reason})`).join('\n')}
`;
            }
            if (repoGrounding.targetAreas.length > 0) {
                repoSection += `\n## IDENTIFIED TARGET AREAS
${repoGrounding.targetAreas.map(a => `- ${a.area}: ${a.dirs.join(', ')} (${a.reason})`).join('\n')}
`;
            }
        }
        else {
            repoSection = `\n## REPO GROUNDING FAILED
${repoGrounding.reason}
You MUST NOT invent file paths. If you cannot identify real files, set the subtask status to blocked.
`;
        }
    }
    // ── Build file path rules based on grounding ──
    const filePathRules = codeTask ? `
CRITICAL FILE PATH RULES:
- files_to_read and files_to_write MUST contain ONLY paths from the REAL REPO STRUCTURE above.
- Source root for ${task.domain}: ${repoGrounding?.projectRelRoot || 'unknown'}
- All paths must be relative to the RPGPO root (e.g., "${repoGrounding?.projectRelRoot || '02-Projects/...'}/app/_layout.tsx")
- NEVER invent paths like "path/to/file" or "src/components/Example.tsx" that are not listed above.
- If you cannot identify the exact file, use the CANDIDATE TARGET FILES section or list the most likely real file.
- If no real target files can be identified, do NOT create an "implement" subtask. Instead create an "audit" subtask to locate the right files.
- For code implementation subtasks: include a "locate_files" stage subtask BEFORE the "implement" subtask that identifies exact target files.` : `
- files_to_read and files_to_write should be relative paths from the RPGPO root (e.g., "03-Operations/Reports/...")
- For non-code tasks, write output to "03-Operations/Reports/" directory.`;
    // Load operator profile for better prompt quality
    let operatorBlock = '';
    try {
        const opProfile = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'state', 'context', 'operator-profile.json'), 'utf-8'));
        operatorBlock = `\nOperator: ${opProfile.name} (${opProfile.professional_context?.role || 'Operator'})`;
        if (opProfile.recurring_priorities?.length)
            operatorBlock += `\nOperator priorities: ${opProfile.recurring_priorities.join('; ')}`;
        if (opProfile.output_preferences?.style)
            operatorBlock += `\nOutput style required: ${opProfile.output_preferences.style}`;
    }
    catch { /* */ }
    const systemPrompt = `You are the RPGPO Board of AI. You deliberate on tasks before execution.
You have three perspectives:
1. Chief of Staff — interprets objective, assesses feasibility, identifies what needs Rahul's decision
2. Critic — challenges assumptions, identifies risks, unknowns, and failure modes
3. Domain Specialist (${task.domain}) — proposes specific technical/strategic approach

Domain context: ${domainCtx.description}
${operatorBlock}

Rules:
- Be specific, actionable, and concise
- Every subtask must be small and bounded (one AI call or one file operation)
- Subtask stages must follow the governed loop: ${stages}, locate_files
- Mark subtasks that change external state or modify code as approval_required: true
- For non-code tasks (writing, research, analysis, reports, planning, learning), set approval_required: false and risk_level: green — these are safe text-generation tasks that should auto-execute without stopping for approval
- STAGE RULES: "implement" stage is ONLY for code changes that modify files in the repo. For text generation tasks (emails, reports, analysis, plans, documents), use "report" stage instead. This is critical — using "implement" for non-code tasks causes unnecessary approval gates.
- For "implement" stage subtasks on code changes, assign to "claude" model (local execution)
- For "locate_files" stage subtasks, assign to "openai" model (identifies exact files from the repo structure)
- Assign the best model for each subtask: openai for synthesis/analysis/report-compilation, perplexity for research/web-search, gemini for strategy/comparison, claude ONLY for code implementation tasks
- NEVER assign claude to report compilation, research, or analysis subtasks — use openai instead
- For "report" stage subtasks, always use openai (not claude)
- Risk levels: green (safe, reversible), yellow (needs review), red (needs explicit approval)

CRITICAL PROMPT QUALITY RULES FOR SUBTASKS:
- Each subtask prompt MUST be self-contained — it should include ALL necessary context from the task request so the AI model can execute it independently
- NEVER use placeholders like [Tool1], [Company Name], [Insert Here] in subtask prompts — include the actual values from the task request
- If the task asks about specific things (e.g., "passive income ideas"), the subtask prompt must repeat those specifics
- Perplexity research subtasks MUST instruct: "Search the web for current, specific information about [exact topic from request]. Include real names, numbers, dates, URLs, and sources."
- OpenAI synthesis subtasks MUST instruct: "Based on the research results from prior subtasks, synthesize actionable recommendations. Include specific names, numbers, and concrete next steps."
- Gemini strategy subtasks MUST instruct: "Analyze the data and provide strategic comparison with specific pros/cons and recommendations."
- Later subtasks receive output from earlier ones automatically — write prompts assuming this context will be available
- Every subtask prompt must produce REAL, SPECIFIC output — never templates, never placeholders
${filePathRules}
- Output valid JSON only, no markdown wrapping`;
    // ── Inject structured context from Context Engine ──
    let contextSection = '';
    try {
        const ctxBlock = contextEngine.getContextForProvider(task.domain, 'openai');
        if (ctxBlock) {
            contextSection = `\n## GPO Context (from prior work in this mission)\n${ctxBlock}\n`;
        }
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.log(`[deliberation] Context injection warning: ${message}`);
    }
    // Part 88: Inject prior knowledge from completed tasks
    let knowledgeSection = '';
    try {
        const enrichment = require('./context-enrichment');
        knowledgeSection = enrichment.getRelevantKnowledge(task.raw_request, task.domain);
    }
    catch { /* non-fatal */ }
    // Context deepening: inject recent completed task summaries for this domain
    let recentWorkSection = '';
    try {
        const intakeModule = require('./intake');
        const allTasks = intakeModule.getAllTasks();
        const recentDone = allTasks
            .filter(t => t.status === 'done' && t.domain === task.domain && t.task_id !== task.task_id)
            .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
            .slice(0, 3);
        if (recentDone.length > 0) {
            const summaries = recentDone.map(t => {
                const objective = t.board_deliberation?.interpreted_objective || t.title || '';
                return `- ${objective.slice(0, 120)}`;
            }).join('\n');
            recentWorkSection = `\n## Recent Completed Work in ${task.domain}\nThe operator has recently completed these tasks in this domain:\n${summaries}\nUse this context to avoid repeating work and to build on prior findings.\n`;
        }
    }
    catch { /* non-fatal */ }
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
${contextSection}
${knowledgeSection}
${recentWorkSection}
${domainFiles ? '## Domain Files\n' + domainFiles : ''}
${repoSection}

Produce a JSON object with exactly these fields:
{
  "interpreted_objective": "one clear sentence",
  "expected_outcome": "what success looks like",
  "key_unknowns": ["list of things we don't know"],
  "recommended_strategy": "2-3 sentence approach",
  "risk_level": "green|yellow|red",
  "is_code_task": ${codeTask},
  "target_files_identified": ["list of real file paths identified for code changes, or empty if non-code task"],
  "approval_points": ["list of decisions requiring Rahul"],
  "subtasks": [
    {
      "title": "short title",
      "stage": "one of: ${stages}, locate_files",
      "assigned_role": "chief|builder|research|strategy|creative",
      "assigned_model": "openai|perplexity|gemini|claude",
      "expected_output": "what this subtask produces",
      "prompt": "the specific prompt to send to the AI model for this subtask",
      "files_to_read": ["MUST be real paths from repo structure above"],
      "files_to_write": ["MUST be real paths or new paths in existing directories"],
      "risk_level": "green|yellow|red",
      "approval_required": false,
      "depends_on": []
    }
  ]
}

${codeTask ? `IMPORTANT for code tasks:
- You MUST include a "locate_files" stage subtask before any "implement" subtask.
- The locate_files subtask identifies exact target files and explains why they were chosen.
- The implement subtask depends_on the locate_files subtask.
- Only use file paths that appear in the REAL REPO STRUCTURE section above.
- Set target_files_identified to the specific files you plan to modify.` : ''}

depends_on contains indices (0-based) of subtasks that must complete first.
Keep subtasks to 2-4 items. Each must be completable in one AI call.

${!codeTask ? `IMPORTANT for research/analysis tasks:
- Typical pattern: 1) Perplexity research subtask (web search), then 2) OpenAI synthesis subtask (depends_on: [0])
- The Perplexity subtask does the web search and gathers raw data with citations
- The OpenAI subtask synthesizes the research into an actionable, structured report
- For complex topics, you can add a Gemini strategy subtask between them for comparative analysis
- Write the final report to "03-Operations/Reports/{domain}-{date}-{topic}.md"` : ''}`;
    const result = await callOpenAI(systemPrompt, userPrompt, { maxTokens: 3000 });
    // Parse the JSON response
    let deliberation;
    try {
        let text = result.text.trim();
        if (text.startsWith('```')) {
            text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        deliberation = JSON.parse(text);
    }
    catch (e) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            deliberation = JSON.parse(jsonMatch[0]);
        }
        else {
            throw new Error('Failed to parse deliberation JSON: ' + result.text.slice(0, 200));
        }
    }
    // Validate required fields
    if (!deliberation.interpreted_objective)
        throw new Error('Missing interpreted_objective');
    if (!deliberation.subtasks || !Array.isArray(deliberation.subtasks))
        throw new Error('Missing subtasks array');
    // ── Post-deliberation path validation for code tasks ──
    if (codeTask && repoGrounding?.grounded) {
        for (const st of deliberation.subtasks) {
            if (st.stage === 'implement' || st.assigned_model === 'claude') {
                const allPaths = [...(st.files_to_read || []), ...(st.files_to_write || [])];
                const validation = repoScanner.validatePaths(allPaths);
                if (!validation.valid) {
                    // Strip invalid paths, keep only real ones
                    st.files_to_read = (st.files_to_read || []).filter((f) => {
                        const full = path.join(RPGPO_ROOT, f);
                        return fs.existsSync(full);
                    });
                    st.files_to_write = (st.files_to_write || []).filter((f) => {
                        const full = path.join(RPGPO_ROOT, f);
                        // For write targets, allow new files in existing directories
                        const dir = path.dirname(full);
                        return fs.existsSync(full) || fs.existsSync(dir);
                    });
                    st._stripped_paths = validation.missing;
                }
            }
        }
    }
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
            repo_grounding: repoGrounding ? {
                grounded: repoGrounding.grounded,
                projectRelRoot: repoGrounding.projectRelRoot,
                totalFiles: repoGrounding.totalFiles,
                candidateCount: repoGrounding.candidates?.length || 0,
                targetAreas: repoGrounding.targetAreas?.map(a => a.area) || [],
                candidates: (repoGrounding.candidates || []).slice(0, 10).map(c => c.path),
            } : null,
            model_used: result.model,
            tokens_used: result.usage.totalTokens,
        },
        costEntry,
    };
}
/**
 * Part 67: Execute a subtask with contract-aware structured output.
 * Returns parsed structured extraction alongside raw AI result.
 * Falls back to raw text if structured path fails or is disabled.
 */
async function executeStructuredSubtask(args) {
    const { provider, taskDescription, engineId, deliverableId, taskId, subtaskId, priorContext, fieldPolicies } = args;
    if (!isStructuredEnabled()) {
        // Fallback: use plain AI call
        const result = await callOpenAI('You are a GPO worker. Complete the following subtask.', taskDescription, { model: args.model, maxTokens: 3000 });
        return { text: result.text, structured: null, mapping: null };
    }
    try {
        const { buildContractAwarePrompt } = require('./prompt/contract-aware');
        const { callProviderStructured } = require('./ai/providers');
        const { parseStructured } = require('./ai/structured-output');
        const { loadContractAwareConfig } = require('./config/ai-io');
        const { populateDeliverableFromStructured } = require('./merge/field-populator');
        const { recordStructuredEvidence } = require('./evidence/structured');
        const cfg = loadContractAwareConfig();
        const { envelope, schema } = buildContractAwarePrompt({
            provider, taskKind: 'subtask-execution', taskDescription,
            deliverableContract: null, priorContext, fieldPolicies, engineId,
        });
        const res = await callProviderStructured({ provider, model: args.model, envelope, schema });
        const parsed = parseStructured(res.rawText, res.usedMode, schema, cfg);
        parsed.tokensIn = res.tokensIn;
        parsed.tokensOut = res.tokensOut;
        parsed.durationMs = res.durationMs;
        parsed.promptId = envelope.promptId;
        let mapping = null;
        if (parsed.ok) {
            // Try to populate deliverable if we have one
            try {
                const ce = require('./contract-enforcement');
                const deliverable = ce.getDeliverable(taskId);
                if (deliverable) {
                    const { getMergePolicy } = require('./deliverable-merge');
                    const policy = getMergePolicy(deliverable.kind);
                    mapping = populateDeliverableFromStructured({ deliverable, parsed, mergePolicy: policy });
                }
            }
            catch { /* non-fatal */ }
        }
        // Record evidence
        try {
            recordStructuredEvidence({
                deliverableId: deliverableId || taskId,
                taskId: subtaskId,
                schema, envelope, extraction: parsed, mapping,
            });
        }
        catch { /* non-fatal */ }
        return {
            text: parsed.ok ? JSON.stringify(parsed.value) : res.rawText,
            structured: parsed.ok ? parsed : null,
            mapping,
        };
    }
    catch (e) {
        // Full fallback on any error
        console.log(`[deliberation] Structured subtask fallback: ${e instanceof Error ? e.message : String(e)}`);
        const result = await callOpenAI('You are a GPO worker. Complete the following subtask.', taskDescription, { model: args.model, maxTokens: 3000 });
        return { text: result.text, structured: null, mapping: null };
    }
}
module.exports = { deliberate, getDomainContext, DOMAIN_CONTEXT, executeStructuredSubtask };
//# sourceMappingURL=deliberation.js.map