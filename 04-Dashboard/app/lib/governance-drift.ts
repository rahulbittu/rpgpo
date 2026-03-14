// GPO Governance Drift Detection — Detects mismatch between policy and behavior
// Produces drift signals and grouped drift reports.

import type {
  DriftSignal, DriftReport, MissionStatementLevel, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const REPORTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'drift-reports.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Drift Detection
// ═══════════════════════════════════════════

/** Detect governance drift for a given scope */
export function detectDrift(
  scopeLevel: MissionStatementLevel | 'global',
  scopeId: string,
  domain?: Domain
): DriftReport {
  const signals: DriftSignal[] = [];
  const now = new Date().toISOString();

  // 1. Repeated overrides against same rule
  try {
    const ol = require('./override-ledger') as { getAllOverrides(): Array<{ override_type: string; action: string; status: string; created_at: string }> };
    const overrides = ol.getAllOverrides();
    const byType: Record<string, number> = {};
    for (const o of overrides) byType[o.override_type] = (byType[o.override_type] || 0) + 1;
    for (const [type, count] of Object.entries(byType)) {
      if (count >= 3) {
        signals.push({ signal_id: uid('ds'), category: 'repeated_override', severity: count >= 5 ? 'high' : 'medium', scope_level: scopeLevel, scope_id: scopeId, description: `Override type "${type}" used ${count} times — consider adjusting the underlying rule`, evidence_count: count, first_seen: overrides[overrides.length - 1]?.created_at || now, last_seen: overrides[0]?.created_at || now });
      }
    }
  } catch { /* */ }

  // 2. Chronic simulation warnings
  try {
    const ps = require('./policy-simulation') as { getAllResults(): Array<{ outcome: string; lane: string; related_id: string; warnings: string[]; created_at: string }> };
    const results = ps.getAllResults();
    const warnCount = results.filter(r => r.outcome === 'warn' || r.outcome === 'block').length;
    if (warnCount >= 3) {
      signals.push({ signal_id: uid('ds'), category: 'chronic_sim_warnings', severity: 'medium', scope_level: scopeLevel, scope_id: scopeId, description: `${warnCount} simulation warnings/blocks — governance may be miscalibrated`, evidence_count: warnCount, first_seen: results[results.length - 1]?.created_at || now, last_seen: results[0]?.created_at || now });
    }
  } catch { /* */ }

  // 3. Frequent promotion blocks
  try {
    const pc = require('./promotion-control') as { getDecisionsForDossier(id: string): any[] };
    const decisionsFile = path.resolve(__dirname, '..', '..', 'state', 'promotion-decisions.json');
    const decisions = readJson<any[]>(decisionsFile, []);
    const blocked = decisions.filter((d: any) => d.result === 'blocked');
    if (blocked.length >= 2) {
      signals.push({ signal_id: uid('ds'), category: 'frequent_promotion_blocks', severity: 'high', scope_level: scopeLevel, scope_id: scopeId, description: `${blocked.length} promotion blocks — review promotion policies or address recurring blockers`, evidence_count: blocked.length, first_seen: blocked[blocked.length - 1]?.decided_at || now, last_seen: blocked[0]?.decided_at || now });
    }
  } catch { /* */ }

  // 4. Documentation gaps recurring
  try {
    const ea = require('./exception-analytics') as { aggregate(opts?: Record<string, unknown>): import('./types').ExceptionAggregate };
    const agg = ea.aggregate({ domain, days: 30 });
    const docBlockCount = Object.entries(agg.by_category).filter(([k]) => k.includes('simulation') || k.includes('enforcement')).reduce((s, [, v]) => s + v, 0);
    if (agg.trends.length > 0) {
      for (const trend of agg.trends) {
        signals.push({ signal_id: uid('ds'), category: 'exception_trend', severity: 'medium', scope_level: scopeLevel, scope_id: scopeId, description: trend, evidence_count: agg.total, first_seen: agg.window_start, last_seen: agg.window_end });
      }
    }
  } catch { /* */ }

  // 5. Provider-role mismatches from reverse prompting
  try {
    const rpFile = path.resolve(__dirname, '..', '..', 'state', 'reverse-prompting-runs.json');
    const runs = readJson<any[]>(rpFile, []);
    const antiPatterns = runs.flatMap((r: any) => r.anti_patterns || []);
    const providerMismatches = antiPatterns.filter((p: string) => p.toLowerCase().includes('provider mismatch'));
    if (providerMismatches.length >= 2) {
      signals.push({ signal_id: uid('ds'), category: 'provider_mismatch_drift', severity: 'medium', scope_level: scopeLevel, scope_id: scopeId, description: `${providerMismatches.length} provider-role mismatches detected across runs`, evidence_count: providerMismatches.length, first_seen: runs[runs.length - 1]?.created_at || now, last_seen: runs[0]?.created_at || now });
    }
  } catch { /* */ }

  const summary = signals.length === 0
    ? `No governance drift detected for ${scopeLevel}:${scopeId}`
    : `${signals.length} drift signal(s) detected: ${signals.map(s => s.category).join(', ')}`;

  const report: DriftReport = {
    report_id: uid('dr'),
    scope_level: scopeLevel,
    scope_id: scopeId,
    signals,
    summary,
    created_at: now,
  };

  const reports = readJson<DriftReport[]>(REPORTS_FILE, []);
  reports.unshift(report);
  if (reports.length > 100) reports.length = 100;
  writeJson(REPORTS_FILE, reports);

  return report;
}

export function getReports(scopeLevel?: string, scopeId?: string): DriftReport[] {
  const all = readJson<DriftReport[]>(REPORTS_FILE, []);
  if (scopeLevel && scopeId) return all.filter(r => r.scope_level === scopeLevel && r.scope_id === scopeId);
  return all;
}

module.exports = { detectDrift, getReports };
