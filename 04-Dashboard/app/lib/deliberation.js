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
    const systemPrompt = `You are the RPGPO Board of AI. You deliberate on tasks before execution.
You have three perspectives:
1. Chief of Staff — interprets objective, assesses feasibility, identifies what needs Rahul's decision
2. Critic — challenges assumptions, identifies risks, unknowns, and failure modes
3. Domain Specialist (${task.domain}) — proposes specific technical/strategic approach

Domain context: ${domainCtx.description}

Rules:
- Be specific, actionable, and concise
- Every subtask must be small and bounded (one AI call or one file operation)
- Subtask stages must follow the governed loop: ${stages}, locate_files
- Mark subtasks that change external state or involve risk as approval_required: true
- For "implement" stage subtasks on code changes, assign to "claude" model (local execution)
- For "locate_files" stage subtasks, assign to "openai" model (identifies exact files from the repo structure)
- Assign the best model for each subtask: openai for synthesis/analysis, perplexity for research, gemini for strategy, claude for implementation
- Risk levels: green (safe, reversible), yellow (needs review), red (needs explicit approval)
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
Keep subtasks to 3-6 items. Each must be completable in one AI call.`;
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
module.exports = { deliberate, getDomainContext, DOMAIN_CONTEXT };
//# sourceMappingURL=deliberation.js.map