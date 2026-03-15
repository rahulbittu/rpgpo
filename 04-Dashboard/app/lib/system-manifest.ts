// GPO System Manifest — The complete system inventory and capability map

export interface SystemManifest {
  version: string;
  name: string;
  description: string;
  generatedAt: string;
  modules: number;
  apiRoutes: number;
  types: number;
  features: Feature[];
  engines: Engine[];
  providers: Provider[];
  stats: SystemStats;
}

interface Feature {
  name: string;
  part: string;
  category: string;
  status: 'active' | 'beta' | 'planned';
  description: string;
}

interface Engine {
  id: string;
  name: string;
  status: string;
  templates: number;
}

interface Provider {
  id: string;
  name: string;
  ready: boolean;
}

interface SystemStats {
  uptime: number;
  tasksCompleted: number;
  reportsGenerated: number;
  knowledgeEntries: number;
  costTotalUsd: number;
}

export function generateManifest(): SystemManifest {
  const features: Feature[] = [
    { name: 'Structured Output Pipeline', part: '67-68', category: 'Core', status: 'active', description: 'Schema-driven AI output with parse/retry/merge' },
    { name: 'Parallel Execution Engine', part: '70', category: 'Core', status: 'active', description: 'DAG-based concurrent subtask execution' },
    { name: 'Workflow Orchestrator', part: '71', category: 'Core', status: 'active', description: '14-stage task lifecycle with autopilot' },
    { name: 'Observability + Metrics', part: '69', category: 'Ops', status: 'active', description: 'In-memory metrics, percentiles, alerting' },
    { name: 'TopRanker Engine', part: '72', category: 'Engine', status: 'active', description: '4 contracts, 3 templates, build adapter' },
    { name: 'Mission Control', part: '73', category: 'UI', status: 'active', description: 'Unified dashboard + notifications' },
    { name: 'Integration Tests', part: '74', category: 'Quality', status: 'active', description: 'Provider simulator + acceptance harness' },
    { name: 'Persistent Learning', part: '75', category: 'AI', status: 'active', description: 'Cross-session provider EWMA + knowledge base' },
    { name: 'Task Conversations', part: '76', category: 'UX', status: 'active', description: 'Per-task conversation threads' },
    { name: 'Task Chaining', part: '76', category: 'UX', status: 'active', description: 'Auto follow-up tasks on completion' },
    { name: 'Smart Templates', part: '77', category: 'UX', status: 'active', description: 'Dynamic template CRUD with performance tracking' },
    { name: 'Recurring Scheduler', part: '77', category: 'Ops', status: 'active', description: 'Cron-like task scheduling' },
    { name: 'Compound Workflows', part: '78', category: 'Core', status: 'active', description: 'Multi-engine DAG orchestration' },
    { name: 'State Backup', part: '79', category: 'Ops', status: 'active', description: 'Atomic snapshots + export/import' },
    { name: 'Integration Gateway', part: '80', category: 'Enterprise', status: 'active', description: 'Inbound/outbound webhooks' },
    { name: 'Analytics Dashboard', part: '81', category: 'Ops', status: 'active', description: 'Productivity metrics + cost trends' },
    { name: 'Self-Healing', part: '82', category: 'Ops', status: 'active', description: 'Automated health checks + repair' },
    { name: 'RBAC + API Keys', part: '83', category: 'Enterprise', status: 'active', description: 'Role-based access + audit trail' },
    { name: 'API Documentation', part: '84', category: 'Enterprise', status: 'active', description: 'Auto-generated route docs' },
    { name: 'Performance Cache', part: '85', category: 'Core', status: 'active', description: 'In-memory TTL cache layer' },
    { name: 'Premium UI', part: '86', category: 'UI', status: 'active', description: 'Skeletons, responsive, focus rings' },
    { name: 'Error Tracking', part: '87', category: 'Ops', status: 'active', description: 'Categorized errors + recovery suggestions' },
    { name: 'Context Enrichment', part: '88', category: 'AI', status: 'active', description: 'Auto-extract insights from completed tasks' },
    { name: 'Quality Scoring', part: '89', category: 'AI', status: 'active', description: '5-dimension output quality scoring' },
    { name: 'Task Graphs', part: '90', category: 'Ops', status: 'active', description: 'Dependency visualization + critical path' },
    { name: 'Smart Suggestions', part: '91', category: 'AI', status: 'active', description: 'Time-aware proactive task suggestions' },
    { name: 'Prompt Optimization', part: '92', category: 'AI', status: 'active', description: 'Pattern learning + improvement suggestions' },
    { name: 'Cost Optimization', part: '93', category: 'Ops', status: 'active', description: 'Spending analysis + provider recommendations' },
    { name: 'System Dashboard', part: '94', category: 'Ops', status: 'active', description: 'Unified health + capability overview' },
    { name: 'Operator Insights', part: '95', category: 'Ops', status: 'active', description: 'Productivity metrics + recommendations' },
    { name: 'Rate Limiting', part: '96', category: 'Enterprise', status: 'active', description: 'Per-endpoint request throttling' },
    { name: 'Data Export', part: '97', category: 'Enterprise', status: 'active', description: 'CSV/JSON data export' },
    { name: 'Full-Text Search', part: '98', category: 'UX', status: 'active', description: 'Search across tasks, knowledge, templates' },
    { name: 'Changelog Generator', part: '99', category: 'Ops', status: 'active', description: 'Auto-generate activity reports' },
  ];

  const engines = [
    { id: 'topranker', name: 'TopRanker', status: 'Active', templates: 3 },
    { id: 'newsroom', name: 'News & Intelligence', status: 'Active', templates: 3 },
    { id: 'wealthresearch', name: 'Income & Wealth', status: 'Active', templates: 2 },
    { id: 'career', name: 'Career & Growth', status: 'Active', templates: 2 },
    { id: 'chief_of_staff', name: 'Planning & Strategy', status: 'Active', templates: 1 },
    { id: 'research', name: 'Research & Analysis', status: 'Active', templates: 1 },
    { id: 'communications', name: 'Writing & Comms', status: 'Active', templates: 0 },
    { id: 'startup', name: 'Code & Build', status: 'Active', templates: 0 },
  ];

  const providers = [
    { id: 'claude', name: 'Claude (Local)', ready: true },
    { id: 'openai', name: 'OpenAI GPT-4o', ready: !!process.env.OPENAI_API_KEY },
    { id: 'perplexity', name: 'Perplexity Sonar', ready: !!process.env.PERPLEXITY_API_KEY },
    { id: 'gemini', name: 'Google Gemini', ready: !!process.env.GEMINI_API_KEY },
  ];

  let stats: SystemStats = { uptime: process.uptime() * 1000, tasksCompleted: 0, reportsGenerated: 0, knowledgeEntries: 0, costTotalUsd: 0 };
  try {
    const analytics = require('./analytics') as { getAnalyticsSummary(d: number): any };
    const summary = analytics.getAnalyticsSummary(365);
    stats.tasksCompleted = summary.tasks?.completed || 0;
    stats.reportsGenerated = summary.quality?.reportsGenerated || 0;
    stats.costTotalUsd = summary.cost?.totalUsd || 0;
  } catch { /* */ }
  try {
    const ls = require('./learning-store') as { getLearningMeta(): any };
    stats.knowledgeEntries = ls.getLearningMeta().recordCounts?.knowledgeEntries || 0;
  } catch { /* */ }

  return {
    version: '1.0.0',
    name: 'GPO Command Center',
    description: 'Privacy-first governed personal AI operating system',
    generatedAt: new Date().toISOString(),
    modules: 175,
    apiRoutes: 1070,
    types: 810,
    features,
    engines,
    providers,
    stats,
  };
}

module.exports = { generateManifest };
