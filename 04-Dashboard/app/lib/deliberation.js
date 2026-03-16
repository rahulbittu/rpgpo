"use strict";
// RPGPO Board Deliberation Engine
// Runs structured AI deliberation on intake tasks.
// Produces interpreted objective, strategy, subtask breakdown.
// Safe: read-only against RPGPO files, AI calls only.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var callOpenAI = require('./ai').callOpenAI;
var _a = require('./files'), readFile = _a.readFile, RPGPO_ROOT = _a.RPGPO_ROOT;
var costs = require('./costs');
var repoScanner = require('./repo-scanner');
var contextEngine = require('./context');
var path = require('path');
var fs = require('fs');
// Part 67: Structured output imports
var _structuredEnabled = false;
var _structuredChecked = false;
function isStructuredEnabled() {
    if (_structuredChecked)
        return _structuredEnabled;
    _structuredChecked = true;
    try {
        var loadContractAwareConfig = require('./config/ai-io').loadContractAwareConfig;
        _structuredEnabled = loadContractAwareConfig().enabled;
    }
    catch (_a) {
        _structuredEnabled = false;
    }
    return _structuredEnabled;
}
var DOMAIN_CONTEXT = {
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
    var ctx = getDomainContext(domain);
    var contents = [];
    for (var _i = 0, _a = ctx.key_files; _i < _a.length; _i++) {
        var f = _a[_i];
        var c = readFile(f);
        if (c)
            contents.push("### ".concat(f, "\n").concat(c.slice(0, 1500)));
    }
    return contents.join('\n\n');
}
/**
 * Detect if a task is a coding/build task based on the request text.
 */
function isCodeTask(taskText) {
    var lower = (taskText || '').toLowerCase();
    var codeKeywords = ['implement', 'build', 'code', 'fix bug', 'add feature', 'refactor',
        'performance', 'optimize', 'startup', 'render', 'component', 'endpoint',
        'api', 'migration', 'schema', 'hook', 'test', 'style', 'css', 'layout'];
    return codeKeywords.some(function (k) { return lower.includes(k); });
}
/**
 * Run board deliberation on an intake task.
 * For coding tasks, performs mandatory repo grounding first.
 * Returns { deliberation, costEntry }
 */
function deliberate(task) {
    return __awaiter(this, void 0, void 0, function () {
        var domainCtx, domainFiles, stages, codeTask, repoGrounding, repoSection, filePathRules, operatorBlock, opProfile, systemPrompt, contextSection, ctxBlock, message, knowledgeSection, enrichment, recentWorkSection, intakeModule, allTasks, recentDone, summaries, behaviorSection, behaviorModule, ctx, userPrompt, result, deliberation, text, jsonMatch, _i, _a, st, allPaths, validation, costEntry;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    domainCtx = getDomainContext(task.domain);
                    domainFiles = gatherDomainFiles(task.domain);
                    stages = domainCtx.governed_loop.join(', ');
                    codeTask = isCodeTask(task.raw_request);
                    repoGrounding = null;
                    repoSection = '';
                    if (codeTask) {
                        repoGrounding = repoScanner.groundInRepo(task.domain, task.raw_request);
                        if (repoGrounding.grounded) {
                            repoSection = "\n## REAL REPO STRUCTURE (mandatory \u2014 use only these paths)\n".concat(repoGrounding.tree);
                            if (repoGrounding.candidates.length > 0) {
                                repoSection += "\n## CANDIDATE TARGET FILES (identified by repo scan)\nThese are real files that likely relate to this task:\n".concat(repoGrounding.candidates.slice(0, 20).map(function (c) { return "- ".concat(c.path, " (").concat(c.area, ": ").concat(c.reason, ")"); }).join('\n'), "\n");
                            }
                            if (repoGrounding.targetAreas.length > 0) {
                                repoSection += "\n## IDENTIFIED TARGET AREAS\n".concat(repoGrounding.targetAreas.map(function (a) { return "- ".concat(a.area, ": ").concat(a.dirs.join(', '), " (").concat(a.reason, ")"); }).join('\n'), "\n");
                            }
                        }
                        else {
                            repoSection = "\n## REPO GROUNDING FAILED\n".concat(repoGrounding.reason, "\nYou MUST NOT invent file paths. If you cannot identify real files, set the subtask status to blocked.\n");
                        }
                    }
                    filePathRules = codeTask ? "\nCRITICAL FILE PATH RULES:\n- files_to_read and files_to_write MUST contain ONLY paths from the REAL REPO STRUCTURE above.\n- Source root for ".concat(task.domain, ": ").concat((repoGrounding === null || repoGrounding === void 0 ? void 0 : repoGrounding.projectRelRoot) || 'unknown', "\n- All paths must be relative to the RPGPO root (e.g., \"").concat((repoGrounding === null || repoGrounding === void 0 ? void 0 : repoGrounding.projectRelRoot) || '02-Projects/...', "/app/_layout.tsx\")\n- NEVER invent paths like \"path/to/file\" or \"src/components/Example.tsx\" that are not listed above.\n- If you cannot identify the exact file, use the CANDIDATE TARGET FILES section or list the most likely real file.\n- If no real target files can be identified, do NOT create an \"implement\" subtask. Instead create an \"audit\" subtask to locate the right files.\n- For code implementation subtasks: include a \"locate_files\" stage subtask BEFORE the \"implement\" subtask that identifies exact target files.") : "\n- files_to_read and files_to_write should be relative paths from the RPGPO root (e.g., \"03-Operations/Reports/...\")\n- For non-code tasks, write output to \"03-Operations/Reports/\" directory.";
                    operatorBlock = '';
                    try {
                        opProfile = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'state', 'context', 'operator-profile.json'), 'utf-8'));
                        operatorBlock = "\nOperator: ".concat(opProfile.name, " (").concat(((_b = opProfile.professional_context) === null || _b === void 0 ? void 0 : _b.role) || 'Operator', ")");
                        if ((_c = opProfile.recurring_priorities) === null || _c === void 0 ? void 0 : _c.length)
                            operatorBlock += "\nOperator priorities: ".concat(opProfile.recurring_priorities.join('; '));
                        if ((_d = opProfile.output_preferences) === null || _d === void 0 ? void 0 : _d.style)
                            operatorBlock += "\nOutput style required: ".concat(opProfile.output_preferences.style);
                    }
                    catch ( /* */_h) { /* */ }
                    systemPrompt = "You are the RPGPO Board of AI. You deliberate on tasks before execution.\nYou have three perspectives:\n1. Chief of Staff \u2014 interprets objective, assesses feasibility, identifies what needs Rahul's decision\n2. Critic \u2014 challenges assumptions, identifies risks, unknowns, and failure modes\n3. Domain Specialist (".concat(task.domain, ") \u2014 proposes specific technical/strategic approach\n\nDomain context: ").concat(domainCtx.description, "\n").concat(operatorBlock, "\n\nRules:\n- Be specific, actionable, and concise\n- Every subtask must be small and bounded (one AI call or one file operation)\n- Subtask stages must follow the governed loop: ").concat(stages, ", locate_files\n- Mark subtasks that change external state or modify code as approval_required: true\n- For non-code tasks (writing, research, analysis, reports, planning, learning), set approval_required: false and risk_level: green \u2014 these are safe text-generation tasks that should auto-execute without stopping for approval\n- STAGE RULES: \"implement\" stage is ONLY for code changes that modify files in the repo. For text generation tasks (emails, reports, analysis, plans, documents), use \"report\" stage instead. This is critical \u2014 using \"implement\" for non-code tasks causes unnecessary approval gates.\n- For \"implement\" stage subtasks on code changes, assign to \"claude\" model (local execution)\n- For \"locate_files\" stage subtasks, assign to \"openai\" model (identifies exact files from the repo structure)\n- Assign the best model for each subtask: openai for synthesis/analysis/report-compilation, perplexity for research/web-search, gemini for strategy/comparison, claude ONLY for code implementation tasks\n- NEVER assign claude to report compilation, research, or analysis subtasks \u2014 use openai instead\n- For \"report\" stage subtasks, always use openai (not claude)\n- Risk levels: green (safe, reversible), yellow (needs review), red (needs explicit approval)\n\nCRITICAL PROMPT QUALITY RULES FOR SUBTASKS:\n- Each subtask prompt MUST be self-contained \u2014 it should include ALL necessary context from the task request so the AI model can execute it independently\n- NEVER use placeholders like [Tool1], [Company Name], [Insert Here] in subtask prompts \u2014 include the actual values from the task request\n- If the task asks about specific things (e.g., \"passive income ideas\"), the subtask prompt must repeat those specifics\n- Perplexity research subtasks MUST instruct: \"Search the web for current, specific information about [exact topic from request]. Include real names, numbers, dates, URLs, and sources.\"\n- OpenAI synthesis subtasks MUST instruct: \"Based on the research results from prior subtasks, synthesize actionable recommendations. Include specific names, numbers, and concrete next steps.\"\n- Gemini strategy subtasks MUST instruct: \"Analyze the data and provide strategic comparison with specific pros/cons and recommendations.\"\n- Later subtasks receive output from earlier ones automatically \u2014 write prompts assuming this context will be available\n- Every subtask prompt must produce REAL, SPECIFIC output \u2014 never templates, never placeholders\n").concat(filePathRules, "\n- Output valid JSON only, no markdown wrapping");
                    contextSection = '';
                    try {
                        ctxBlock = contextEngine.getContextForProvider(task.domain, 'openai');
                        if (ctxBlock) {
                            contextSection = "\n## GPO Context (from prior work in this mission)\n".concat(ctxBlock, "\n");
                        }
                    }
                    catch (e) {
                        message = e instanceof Error ? e.message : String(e);
                        console.log("[deliberation] Context injection warning: ".concat(message));
                    }
                    knowledgeSection = '';
                    try {
                        enrichment = require('./context-enrichment');
                        knowledgeSection = enrichment.getRelevantKnowledge(task.raw_request, task.domain);
                    }
                    catch ( /* non-fatal */_j) { /* non-fatal */ }
                    recentWorkSection = '';
                    try {
                        intakeModule = require('./intake');
                        allTasks = intakeModule.getAllTasks();
                        recentDone = allTasks
                            .filter(function (t) { return t.status === 'done' && t.domain === task.domain && t.task_id !== task.task_id; })
                            .sort(function (a, b) { return (b.updated_at || '').localeCompare(a.updated_at || ''); })
                            .slice(0, 3);
                        if (recentDone.length > 0) {
                            summaries = recentDone.map(function (t) {
                                var _a;
                                var objective = ((_a = t.board_deliberation) === null || _a === void 0 ? void 0 : _a.interpreted_objective) || t.title || '';
                                return "- ".concat(objective.slice(0, 120));
                            }).join('\n');
                            recentWorkSection = "\n## Recent Completed Work in ".concat(task.domain, "\nThe operator has recently completed these tasks in this domain:\n").concat(summaries, "\nUse this context to avoid repeating work and to build on prior findings.\n");
                        }
                    }
                    catch ( /* non-fatal */_k) { /* non-fatal */ }
                    behaviorSection = '';
                    try {
                        behaviorModule = require('./behavior');
                        ctx = behaviorModule.getScopedContext({ engine: task.domain });
                        if (ctx.summary && ctx.summary !== 'No learned preferences available.') {
                            behaviorSection = "\n## Operator Preferences (from learned behavior \u2014 additive context only)\n".concat(ctx.summary, "\nUse these preferences to shape output style and depth. These are advisory signals, not overrides.\n");
                        }
                    }
                    catch ( /* behavior module not available — non-fatal */_l) { /* behavior module not available — non-fatal */ }
                    userPrompt = "Deliberate on this task:\n\n## Raw Request\n".concat(task.raw_request, "\n\n## Domain\n").concat(task.domain, "\n\n## Urgency\n").concat(task.urgency, "\n\n## Desired Outcome\n").concat(task.desired_outcome || 'Not specified — infer from request', "\n\n## Constraints\n").concat(task.constraints || 'Standard RPGPO safety rules apply', "\n").concat(contextSection, "\n").concat(knowledgeSection, "\n").concat(recentWorkSection, "\n").concat(behaviorSection, "\n").concat(domainFiles ? '## Domain Files\n' + domainFiles : '', "\n").concat(repoSection, "\n\nProduce a JSON object with exactly these fields:\n{\n  \"interpreted_objective\": \"one clear sentence\",\n  \"expected_outcome\": \"what success looks like\",\n  \"key_unknowns\": [\"list of things we don't know\"],\n  \"recommended_strategy\": \"2-3 sentence approach\",\n  \"risk_level\": \"green|yellow|red\",\n  \"is_code_task\": ").concat(codeTask, ",\n  \"target_files_identified\": [\"list of real file paths identified for code changes, or empty if non-code task\"],\n  \"approval_points\": [\"list of decisions requiring Rahul\"],\n  \"subtasks\": [\n    {\n      \"title\": \"short title\",\n      \"stage\": \"one of: ").concat(stages, ", locate_files\",\n      \"assigned_role\": \"chief|builder|research|strategy|creative\",\n      \"assigned_model\": \"openai|perplexity|gemini|claude\",\n      \"expected_output\": \"what this subtask produces\",\n      \"prompt\": \"the specific prompt to send to the AI model for this subtask\",\n      \"files_to_read\": [\"MUST be real paths from repo structure above\"],\n      \"files_to_write\": [\"MUST be real paths or new paths in existing directories\"],\n      \"risk_level\": \"green|yellow|red\",\n      \"approval_required\": false,\n      \"depends_on\": []\n    }\n  ]\n}\n\n").concat(codeTask ? "IMPORTANT for code tasks:\n- You MUST include a \"locate_files\" stage subtask before any \"implement\" subtask.\n- The locate_files subtask identifies exact target files and explains why they were chosen.\n- The implement subtask depends_on the locate_files subtask.\n- Only use file paths that appear in the REAL REPO STRUCTURE section above.\n- Set target_files_identified to the specific files you plan to modify." : '', "\n\ndepends_on contains indices (0-based) of subtasks that must complete first.\nMINIMUM 2 subtasks required. For simple writing tasks: 1) research/context gathering, 2) synthesis/writing. Single-subtask plans are acceptable ONLY for direct text transformations (rewrite, summarize) where no research is needed.\nKeep subtasks to 2-4 items. Each must be completable in one AI call.\n\n").concat(!codeTask ? "IMPORTANT for research/analysis tasks:\n- Typical pattern: 1) Perplexity research subtask (web search), then 2) OpenAI synthesis subtask (depends_on: [0])\n- The Perplexity subtask does the web search and gathers raw data with citations\n- The OpenAI subtask synthesizes the research into an actionable, structured report\n- For complex topics, you can add a Gemini strategy subtask between them for comparative analysis\n- Write the final report to \"03-Operations/Reports/{domain}-{date}-{topic}.md\"" : '');
                    return [4 /*yield*/, callOpenAI(systemPrompt, userPrompt, { maxTokens: 3000 })];
                case 1:
                    result = _g.sent();
                    try {
                        text = result.text.trim();
                        if (text.startsWith('```')) {
                            text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
                        }
                        deliberation = JSON.parse(text);
                    }
                    catch (e) {
                        jsonMatch = result.text.match(/\{[\s\S]*\}/);
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
                    if (codeTask && (repoGrounding === null || repoGrounding === void 0 ? void 0 : repoGrounding.grounded)) {
                        for (_i = 0, _a = deliberation.subtasks; _i < _a.length; _i++) {
                            st = _a[_i];
                            if (st.stage === 'implement' || st.assigned_model === 'claude') {
                                allPaths = __spreadArray(__spreadArray([], (st.files_to_read || []), true), (st.files_to_write || []), true);
                                validation = repoScanner.validatePaths(allPaths);
                                if (!validation.valid) {
                                    // Strip invalid paths, keep only real ones
                                    st.files_to_read = (st.files_to_read || []).filter(function (f) {
                                        var full = path.join(RPGPO_ROOT, f);
                                        return fs.existsSync(full);
                                    });
                                    st.files_to_write = (st.files_to_write || []).filter(function (f) {
                                        var full = path.join(RPGPO_ROOT, f);
                                        // For write targets, allow new files in existing directories
                                        var dir = path.dirname(full);
                                        return fs.existsSync(full) || fs.existsSync(dir);
                                    });
                                    st._stripped_paths = validation.missing;
                                }
                            }
                        }
                    }
                    costEntry = costs.recordCost({
                        provider: 'openai',
                        model: result.model,
                        inputTokens: result.usage.inputTokens,
                        outputTokens: result.usage.outputTokens,
                        totalTokens: result.usage.totalTokens,
                        taskId: task.task_id,
                        taskType: 'deliberation',
                        role: 'board',
                    });
                    return [2 /*return*/, {
                            deliberation: __assign(__assign({ timestamp: new Date().toISOString() }, deliberation), { repo_grounding: repoGrounding ? {
                                    grounded: repoGrounding.grounded,
                                    projectRelRoot: repoGrounding.projectRelRoot,
                                    totalFiles: repoGrounding.totalFiles,
                                    candidateCount: ((_e = repoGrounding.candidates) === null || _e === void 0 ? void 0 : _e.length) || 0,
                                    targetAreas: ((_f = repoGrounding.targetAreas) === null || _f === void 0 ? void 0 : _f.map(function (a) { return a.area; })) || [],
                                    candidates: (repoGrounding.candidates || []).slice(0, 10).map(function (c) { return c.path; }),
                                } : null, model_used: result.model, tokens_used: result.usage.totalTokens }),
                            costEntry: costEntry,
                        }];
            }
        });
    });
}
/**
 * Part 67: Execute a subtask with contract-aware structured output.
 * Returns parsed structured extraction alongside raw AI result.
 * Falls back to raw text if structured path fails or is disabled.
 */
function executeStructuredSubtask(args) {
    return __awaiter(this, void 0, void 0, function () {
        var provider, taskDescription, engineId, deliverableId, taskId, subtaskId, priorContext, fieldPolicies, result, buildContractAwarePrompt, callProviderStructured, parseStructured, loadContractAwareConfig, populateDeliverableFromStructured, recordStructuredEvidence, cfg, _a, envelope, schema, res, parsed, mapping, ce, deliverable, getMergePolicy, policy, e_1, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    provider = args.provider, taskDescription = args.taskDescription, engineId = args.engineId, deliverableId = args.deliverableId, taskId = args.taskId, subtaskId = args.subtaskId, priorContext = args.priorContext, fieldPolicies = args.fieldPolicies;
                    if (!!isStructuredEnabled()) return [3 /*break*/, 2];
                    return [4 /*yield*/, callOpenAI('You are a GPO worker. Complete the following subtask.', taskDescription, { model: args.model, maxTokens: 3000 })];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, { text: result.text, structured: null, mapping: null }];
                case 2:
                    _b.trys.push([2, 4, , 6]);
                    buildContractAwarePrompt = require('./prompt/contract-aware').buildContractAwarePrompt;
                    callProviderStructured = require('./ai/providers').callProviderStructured;
                    parseStructured = require('./ai/structured-output').parseStructured;
                    loadContractAwareConfig = require('./config/ai-io').loadContractAwareConfig;
                    populateDeliverableFromStructured = require('./merge/field-populator').populateDeliverableFromStructured;
                    recordStructuredEvidence = require('./evidence/structured').recordStructuredEvidence;
                    cfg = loadContractAwareConfig();
                    _a = buildContractAwarePrompt({
                        provider: provider,
                        taskKind: 'subtask-execution',
                        taskDescription: taskDescription,
                        deliverableContract: null,
                        priorContext: priorContext,
                        fieldPolicies: fieldPolicies,
                        engineId: engineId,
                    }), envelope = _a.envelope, schema = _a.schema;
                    return [4 /*yield*/, callProviderStructured({ provider: provider, model: args.model, envelope: envelope, schema: schema })];
                case 3:
                    res = _b.sent();
                    parsed = parseStructured(res.rawText, res.usedMode, schema, cfg);
                    parsed.tokensIn = res.tokensIn;
                    parsed.tokensOut = res.tokensOut;
                    parsed.durationMs = res.durationMs;
                    parsed.promptId = envelope.promptId;
                    mapping = null;
                    if (parsed.ok) {
                        // Try to populate deliverable if we have one
                        try {
                            ce = require('./contract-enforcement');
                            deliverable = ce.getDeliverable(taskId);
                            if (deliverable) {
                                getMergePolicy = require('./deliverable-merge').getMergePolicy;
                                policy = getMergePolicy(deliverable.kind);
                                mapping = populateDeliverableFromStructured({ deliverable: deliverable, parsed: parsed, mergePolicy: policy });
                            }
                        }
                        catch ( /* non-fatal */_c) { /* non-fatal */ }
                    }
                    // Record evidence
                    try {
                        recordStructuredEvidence({
                            deliverableId: deliverableId || taskId,
                            taskId: subtaskId,
                            schema: schema,
                            envelope: envelope,
                            extraction: parsed,
                            mapping: mapping,
                        });
                    }
                    catch ( /* non-fatal */_d) { /* non-fatal */ }
                    return [2 /*return*/, {
                            text: parsed.ok ? JSON.stringify(parsed.value) : res.rawText,
                            structured: parsed.ok ? parsed : null,
                            mapping: mapping,
                        }];
                case 4:
                    e_1 = _b.sent();
                    // Full fallback on any error
                    console.log("[deliberation] Structured subtask fallback: ".concat(e_1 instanceof Error ? e_1.message : String(e_1)));
                    return [4 /*yield*/, callOpenAI('You are a GPO worker. Complete the following subtask.', taskDescription, { model: args.model, maxTokens: 3000 })];
                case 5:
                    result = _b.sent();
                    return [2 /*return*/, { text: result.text, structured: null, mapping: null }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
module.exports = { deliberate: deliberate, getDomainContext: getDomainContext, DOMAIN_CONTEXT: DOMAIN_CONTEXT, executeStructuredSubtask: executeStructuredSubtask };
