// GPO System Status — Unified system health dashboard data

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');

export interface SystemDashboard {
  timestamp: number;
  health: 'green' | 'yellow' | 'red';
  uptime: { server: number; worker: boolean };
  providers: { total: number; ready: number; degraded: number };
  tasks: { total: number; active: number; completed: number; failed: number; successRate: number };
  costs: { todayUsd: number; weekUsd: number; callsToday: number };
  knowledge: { entries: number; providerRecords: number };
  errors: { unresolved: number; recentRate: number };
  storage: { totalFiles: number; totalMb: number };
  features: string[];
}

export function getSystemDashboard(): SystemDashboard {
  const now = Date.now();

  // Tasks
  let tasks = { total: 0, active: 0, completed: 0, failed: 0, successRate: 0 };
  try {
    const intake = require('./intake') as { getAllTasks(): any[] };
    const all = intake.getAllTasks();
    tasks.total = all.length;
    tasks.completed = all.filter((t: any) => t.status === 'done').length;
    tasks.failed = all.filter((t: any) => t.status === 'failed').length;
    tasks.active = all.filter((t: any) => !['done', 'failed', 'canceled'].includes(t.status)).length;
    tasks.successRate = tasks.total > 0 ? tasks.completed / tasks.total : 0;
  } catch { /* */ }

  // Costs
  let costs = { todayUsd: 0, weekUsd: 0, callsToday: 0 };
  try {
    const costsMod = require('./costs') as { getSummary(): any };
    const summary = costsMod.getSummary();
    costs.todayUsd = summary.today?.cost || 0;
    costs.weekUsd = summary.week?.cost || 0;
    costs.callsToday = summary.today?.calls || 0;
  } catch { /* */ }

  // Knowledge
  let knowledge = { entries: 0, providerRecords: 0 };
  try {
    const ls = require('./learning-store') as { getLearningMeta(): any };
    const meta = ls.getLearningMeta();
    knowledge.entries = meta.recordCounts?.knowledgeEntries || 0;
    knowledge.providerRecords = meta.recordCounts?.providerPerf || 0;
  } catch { /* */ }

  // Errors
  let errors = { unresolved: 0, recentRate: 0 };
  try {
    const et = require('./error-tracker') as { getErrorStats(): any };
    const stats = et.getErrorStats();
    errors.unresolved = stats.unresolved || 0;
    errors.recentRate = stats.recentRate || 0;
  } catch { /* */ }

  // Storage
  let storage = { totalFiles: 0, totalMb: 0 };
  try {
    const sb = require('./state-backup') as { verifyIntegrity(): any };
    const integrity = sb.verifyIntegrity();
    storage.totalFiles = integrity.totalFiles || 0;
    storage.totalMb = (integrity.totalBytes || 0) / (1024 * 1024);
  } catch { /* */ }

  // Providers
  let providers = { total: 4, ready: 0, degraded: 0 };
  const keys = ['OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'GEMINI_API_KEY'];
  providers.ready = 1 + keys.filter(k => process.env[k] && process.env[k] !== 'your_key_here').length;
  providers.degraded = providers.total - providers.ready;

  // Health
  const health = errors.unresolved > 5 || providers.degraded >= 2 ? 'red' : errors.unresolved > 0 || providers.degraded >= 1 ? 'yellow' : 'green';

  // Features
  const features = [
    'Structured Output', 'Parallel Execution', 'Workflow Orchestrator', 'Autopilot',
    'Persistent Learning', 'Task Chaining', 'Smart Templates', 'Recurring Scheduler',
    'Compound Workflows', 'State Backup', 'Integration Gateway', 'Analytics',
    'Health Checks', 'RBAC', 'API Docs', 'Caching', 'Error Tracking',
    'Context Enrichment', 'Quality Scoring', 'Task Graphs', 'Smart Suggestions',
    'Prompt Optimization', 'Cost Insights',
  ];

  return { timestamp: now, health, uptime: { server: process.uptime() * 1000, worker: true }, providers, tasks, costs, knowledge, errors, storage, features };
}

module.exports = { getSystemDashboard };
