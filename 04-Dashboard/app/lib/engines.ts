// GPO Engines — Broad work categories that contain projects
// An engine defines defaults, context patterns, and board roles.
// Projects specialize within an engine with local context.
// Example: Startup engine → TopRanker project, CareerEngine project

import type {
  Domain, Engine, EngineContext, DecisionRecord,
  EnrichmentSource, EnrichmentJob,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ENGINES_FILE = path.resolve(__dirname, '..', '..', 'state', 'engines.json');
const ENRICHMENT_FILE = path.resolve(__dirname, '..', '..', 'state', 'enrichment-sources.json');

function readJson<T>(file: string, fallback: T): T {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback; } catch { return fallback; }
}
function writeJson(file: string, data: unknown): void {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// Engine Registry
// ═══════════════════════════════════════════

const engines: Map<Domain, Engine> = new Map();

function defineEngine(e: Engine): void { engines.set(e.domain, e); }

export function getEngine(domain: Domain): Engine | undefined { return engines.get(domain); }
export function getAllEngines(): Engine[] { return Array.from(engines.values()); }

// ═══════════════════════════════════════════
// Built-in Engine Definitions
// ═══════════════════════════════════════════

defineEngine({
  engine_id: 'eng_startup', domain: 'topranker', display_name: 'Startup & Business Builder',
  description: 'Product-building engine for startup projects — strategy, GTM, code architecture',
  default_capabilities: ['coding', 'repo-grounding', 'builder-execution', 'research', 'deliberation'],
  default_board_roles: ['CTO', 'Growth Strategist', 'QA Lead'],
  default_loop_stages: ['audit', 'locate_files', 'implement', 'report', 'review'],
  common_templates: ['Build Feature', 'Fix Bug', 'Optimize Performance', 'Code Audit'],
  context_patterns: ['startup_velocity', 'tech_debt_vs_features', 'user_impact'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_career', domain: 'careeregine', display_name: 'Career & Job Search',
  description: 'Career development engine — job search, resume, salary benchmarking, interview prep',
  default_capabilities: ['research', 'deliberation', 'creative-writing', 'report-generation'],
  default_board_roles: ['Career Strategist', 'Content Specialist'],
  default_loop_stages: ['research', 'strategy', 'implement', 'report'],
  common_templates: ['Career Strategy', 'Resume Review', 'Job Search'],
  context_patterns: ['career_progression', 'skill_gaps', 'market_positioning'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_community', domain: 'founder2founder', display_name: 'Filmmaking & Video Production',
  description: 'Film and video production engine — shot lists, storyboards, production workflows',
  default_capabilities: ['research', 'deliberation', 'creative-writing'],
  default_board_roles: ['Community Strategist', 'Content Lead'],
  default_loop_stages: ['research', 'strategy', 'report'],
  common_templates: ['Community Research', 'Event Planning'],
  context_patterns: ['community_growth', 'engagement_patterns'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_wealth', domain: 'wealthresearch', display_name: 'Personal Finance & Investing',
  description: 'Personal finance engine — budgeting, investing, tax optimization, wealth building',
  default_capabilities: ['research', 'deliberation', 'report-generation'],
  default_board_roles: ['Investment Analyst', 'Risk Assessor'],
  default_loop_stages: ['research', 'audit', 'strategy', 'report'],
  common_templates: ['Investment Analysis', 'Portfolio Review'],
  context_patterns: ['market_thesis', 'risk_assessment', 'diversification'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_news', domain: 'newsroom', display_name: 'News & Intelligence',
  description: 'News intelligence engine — daily digests, trend tracking, industry analysis',
  default_capabilities: ['research', 'report-generation'],
  default_board_roles: ['Editor', 'Fact-Checker'],
  default_loop_stages: ['research', 'audit', 'report'],
  common_templates: ['News Brief', 'Deep Dive'],
  context_patterns: ['source_reliability', 'editorial_voice'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_creative_writing', domain: 'screenwriting', display_name: 'Screenwriting & Story Development',
  description: 'Screenwriting and creative writing engine — scripts, treatments, story structure',
  default_capabilities: ['creative-writing', 'research', 'deliberation'],
  default_board_roles: ['Story Architect', 'Dialogue Specialist'],
  default_loop_stages: ['research', 'strategy', 'implement', 'review'],
  common_templates: ['Story Outline', 'Scene Draft', 'Character Development'],
  context_patterns: ['narrative_arc', 'character_voice', 'genre_conventions'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_music', domain: 'music', display_name: 'Music & Audio Creation',
  description: 'Music and audio engine — composition, arrangement, production planning',
  default_capabilities: ['creative-writing', 'research'],
  default_board_roles: ['Composer', 'Producer'],
  default_loop_stages: ['research', 'strategy', 'implement'],
  common_templates: ['Composition', 'Arrangement', 'Lyrics'],
  context_patterns: ['musical_style', 'harmonic_patterns', 'production_quality'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_ops', domain: 'personalops', display_name: 'Scheduling & Life Operations',
  description: 'Scheduling and life operations engine — weekly planning, routines, time management',
  default_capabilities: ['research', 'deliberation', 'report-generation'],
  default_board_roles: ['Chief of Staff', 'Operations Planner'],
  default_loop_stages: ['audit', 'strategy', 'implement', 'report'],
  common_templates: ['Planning', 'Review', 'Optimization'],
  context_patterns: ['routine_optimization', 'priority_management'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_writing', domain: 'writing', display_name: 'Writing & Documentation',
  description: 'Writing engine — emails, PRDs, SOPs, reports, blog posts, documentation',
  default_capabilities: ['creative-writing', 'report-generation'],
  default_board_roles: ['Writer', 'Editor'],
  default_loop_stages: ['audit', 'report'],
  common_templates: ['Email Draft', 'PRD', 'SOP', 'Blog Post'],
  context_patterns: ['writing_style', 'audience_awareness', 'document_type'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_research', domain: 'research', display_name: 'Research & Analysis',
  description: 'Research engine — market analysis, deep dives, comparisons, evidence-based recommendations',
  default_capabilities: ['research', 'deliberation', 'report-generation'],
  default_board_roles: ['Research Director', 'Analyst'],
  default_loop_stages: ['research', 'report'],
  common_templates: ['Market Research', 'Competitive Analysis', 'Deep Dive'],
  context_patterns: ['research_depth', 'citation_quality', 'evidence_weight'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_learning', domain: 'learning', display_name: 'Learning & Tutoring',
  description: 'Learning engine — study plans, concept explanations, quizzes, skill development',
  default_capabilities: ['research', 'creative-writing', 'report-generation'],
  default_board_roles: ['Tutor', 'Curriculum Designer'],
  default_loop_stages: ['research', 'report'],
  common_templates: ['Study Plan', 'Concept Explanation', 'Quiz'],
  context_patterns: ['skill_level', 'learning_style', 'progression'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_shopping', domain: 'shopping', display_name: 'Shopping & Buying Advisor',
  description: 'Shopping engine — product comparisons, recommendations, price tracking',
  default_capabilities: ['research', 'report-generation'],
  default_board_roles: ['Buying Advisor', 'Product Analyst'],
  default_loop_stages: ['research', 'report'],
  common_templates: ['Product Comparison', 'Buying Guide'],
  context_patterns: ['budget_awareness', 'feature_priorities', 'value_analysis'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_travel', domain: 'travel', display_name: 'Travel & Relocation Planner',
  description: 'Travel engine — itineraries, relocation planning, cost analysis',
  default_capabilities: ['research', 'report-generation'],
  default_board_roles: ['Travel Planner', 'Relocation Advisor'],
  default_loop_stages: ['research', 'report'],
  common_templates: ['Trip Itinerary', 'Relocation Checklist', 'Cost Comparison'],
  context_patterns: ['budget_awareness', 'preference_matching', 'logistics'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_health', domain: 'health', display_name: 'Health & Wellness Coach',
  description: 'Health engine — workout plans, nutrition, wellness, habit building',
  default_capabilities: ['research', 'report-generation'],
  default_board_roles: ['Wellness Coach', 'Fitness Planner'],
  default_loop_stages: ['research', 'report'],
  common_templates: ['Workout Plan', 'Meal Plan', 'Habit Builder'],
  context_patterns: ['fitness_level', 'health_goals', 'constraints'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_home', domain: 'home', display_name: 'Home & Lifestyle Design',
  description: 'Home and lifestyle engine — office setup, home improvement, organization',
  default_capabilities: ['research', 'report-generation'],
  default_board_roles: ['Design Advisor', 'Project Planner'],
  default_loop_stages: ['research', 'report'],
  common_templates: ['Room Design', 'Improvement Plan', 'Organization System'],
  context_patterns: ['budget_awareness', 'space_constraints', 'style_preference'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_code', domain: 'startup', display_name: 'Code & Product Engineering',
  description: 'Code engineering engine — architecture, debugging, refactoring, implementation',
  default_capabilities: ['coding', 'repo-grounding', 'builder-execution', 'deliberation'],
  default_board_roles: ['CTO', 'Code Reviewer', 'Architect'],
  default_loop_stages: ['audit', 'locate_files', 'implement', 'report', 'review'],
  common_templates: ['Build Feature', 'Debug Issue', 'Architecture Design', 'Code Review'],
  context_patterns: ['code_quality', 'test_coverage', 'performance'],
  created_at: new Date().toISOString(),
});

defineEngine({
  engine_id: 'eng_general', domain: 'general', display_name: 'General',
  description: 'General-purpose engine for tasks not tied to a specific domain',
  default_capabilities: ['research', 'deliberation', 'report-generation'],
  default_board_roles: ['Chief of Staff'],
  default_loop_stages: ['audit', 'implement', 'report'],
  common_templates: ['General Task'],
  context_patterns: [],
  created_at: new Date().toISOString(),
});

// ═══════════════════════════════════════════
// Engine Context — broad domain memory
// ═══════════════════════════════════════════

const CTX_DIR = path.resolve(__dirname, '..', '..', 'state', 'context', 'engines');

export function getEngineContext(domain: Domain): EngineContext {
  const engine = getEngine(domain);
  const file = path.join(CTX_DIR, `${domain}.json`);
  return readJson<EngineContext>(file, {
    engine_id: engine?.engine_id || domain,
    domain,
    long_term_objective: engine?.description || '',
    recurring_themes: engine?.context_patterns || [],
    cross_project_decisions: [],
    cross_project_patterns: [],
    active_projects_summary: '',
    context_summary: engine?.description || '',
    updated_at: new Date().toISOString(),
  });
}

export function updateEngineContext(domain: Domain, updates: Partial<EngineContext>): EngineContext {
  const current = getEngineContext(domain);
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  const file = path.join(CTX_DIR, `${domain}.json`);
  writeJson(file, updated);
  return updated;
}

/** Add a cross-project decision to engine context */
export function addEngineDecision(domain: Domain, decision: Omit<DecisionRecord, 'id' | 'made_at'>): void {
  const ctx = getEngineContext(domain);
  const record: DecisionRecord = {
    ...decision, id: 'ecd_' + Date.now().toString(36), made_at: new Date().toISOString(),
  };
  ctx.cross_project_decisions.unshift(record);
  if (ctx.cross_project_decisions.length > 20) ctx.cross_project_decisions.length = 20;
  updateEngineContext(domain, { cross_project_decisions: ctx.cross_project_decisions });
}

// ═══════════════════════════════════════════
// Enrichment Sources — hooks for future context enrichment
// ═══════════════════════════════════════════

export function getEnrichmentSources(): EnrichmentSource[] {
  return readJson<EnrichmentSource[]>(ENRICHMENT_FILE, defaultEnrichmentSources());
}

export function updateEnrichmentSource(id: string, updates: Partial<EnrichmentSource>): void {
  const sources = getEnrichmentSources();
  const idx = sources.findIndex(s => s.id === id);
  if (idx >= 0) {
    Object.assign(sources[idx], updates);
    writeJson(ENRICHMENT_FILE, sources);
  }
}

function defaultEnrichmentSources(): EnrichmentSource[] {
  return [
    { id: 'es_repo', name: 'Repository History', type: 'repo_history', scope: 'project', enabled: true, last_run_at: null, schedule: 'on_demand', privacy_safe: true },
    { id: 'es_artifacts', name: 'Artifact Scanner', type: 'artifact_scan', scope: 'project', enabled: true, last_run_at: null, schedule: 'on_demand', privacy_safe: true },
    { id: 'es_docs', name: 'Document Ingestion', type: 'document', scope: 'engine', enabled: false, last_run_at: null, schedule: 'on_demand', privacy_safe: true },
    { id: 'es_threads', name: 'Thread Extraction', type: 'thread', scope: 'operator', enabled: false, last_run_at: null, schedule: 'weekly', privacy_safe: false },
    { id: 'es_manual', name: 'Manual Notes', type: 'manual', scope: 'project', enabled: true, last_run_at: null, schedule: 'on_demand', privacy_safe: true },
  ];
}

// ═══════════════════════════════════════════
// Enrichment Jobs — for periodic/on-prem refinement
// ═══════════════════════════════════════════

const JOBS_FILE = path.resolve(__dirname, '..', '..', 'state', 'enrichment-jobs.json');

export function getEnrichmentJobs(): EnrichmentJob[] {
  return readJson<EnrichmentJob[]>(JOBS_FILE, defaultEnrichmentJobs());
}

function defaultEnrichmentJobs(): EnrichmentJob[] {
  return [
    { id: 'ej_profile', name: 'Operator Profile Refinement', type: 'profile_refinement', scope: 'operator', enabled: true, schedule: 'weekly', last_run_at: null },
    { id: 'ej_patterns', name: 'Decision Pattern Extraction', type: 'pattern_extraction', scope: 'engine', enabled: true, schedule: 'weekly', last_run_at: null },
    { id: 'ej_summaries', name: 'Context Summary Improvement', type: 'summary_improvement', scope: 'project', enabled: true, schedule: 'daily', last_run_at: null },
    { id: 'ej_artifacts', name: 'Artifact Clustering', type: 'artifact_clustering', scope: 'project', enabled: false, schedule: 'weekly', last_run_at: null },
    { id: 'ej_quality', name: 'Context Quality Check', type: 'context_quality', scope: 'operator', enabled: true, schedule: 'daily', last_run_at: null },
  ];
}

// ═══════════════════════════════════════════
// Canonical Engine Mapping
// ═══════════════════════════════════════════

/** Map from domain key to canonical engine display name */
export function getEngineDisplayName(domain: Domain): string {
  const engine = engines.get(domain);
  return engine?.display_name || domain;
}

/** Get all engine mappings (domain → display name) */
export function getEngineMappings(): Array<{ domain: Domain; display_name: string; engine_id: string }> {
  return Array.from(engines.values()).map(e => ({
    domain: e.domain, display_name: e.display_name, engine_id: e.engine_id,
  }));
}

/** Resolve a domain key to its canonical engine */
export function resolveEngine(domainOrName: string): Engine | undefined {
  // Try direct domain match
  const direct = engines.get(domainOrName as Domain);
  if (direct) return direct;
  // Try display name match
  return Array.from(engines.values()).find(
    e => e.display_name.toLowerCase() === domainOrName.toLowerCase()
  );
}

module.exports = {
  getEngine, getAllEngines,
  getEngineContext, updateEngineContext, addEngineDecision,
  getEnrichmentSources, updateEnrichmentSource,
  getEnrichmentJobs,
  getEngineDisplayName, getEngineMappings, resolveEngine,
};
