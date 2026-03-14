// GPO Enforcement Evidence — Durable evidence records for live enforcement truth

import type { EnforcementEvidenceRecord, MiddlewareExecutionEvidence } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EVIDENCE_FILE = path.resolve(__dirname, '..', '..', 'state', 'enforcement-evidence.json');

function uid(): string { return 'ee_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Record enforcement evidence from a live middleware execution */
export function recordEvidence(
  area: string, middlewareRan: string, decisionMade: string,
  responseEffect: string, scopeType: string, scopeId: string,
  route: string, linkedPathId: string = ''
): EnforcementEvidenceRecord {
  const record: EnforcementEvidenceRecord = {
    record_id: uid(), area, middleware_ran: middlewareRan,
    decision_made: decisionMade, response_effect: responseEffect,
    scope_type: scopeType, scope_id: scopeId, route,
    linked_path_id: linkedPathId, created_at: new Date().toISOString(),
  };
  const all = readJson<EnforcementEvidenceRecord[]>(EVIDENCE_FILE, []);
  all.unshift(record);
  if (all.length > 500) all.length = 500;
  writeJson(EVIDENCE_FILE, all);
  return record;
}

/** Get all enforcement evidence records */
export function getEvidence(area?: string): EnforcementEvidenceRecord[] {
  const all = readJson<EnforcementEvidenceRecord[]>(EVIDENCE_FILE, []);
  return area ? all.filter(r => r.area === area) : all;
}

/** Get evidence for a specific scope */
export function getEvidenceByScope(scopeType: string, scopeId: string): EnforcementEvidenceRecord[] {
  const all = readJson<EnforcementEvidenceRecord[]>(EVIDENCE_FILE, []);
  return all.filter(r => r.scope_type === scopeType && r.scope_id === scopeId);
}

/** Convert evidence to middleware execution evidence format */
export function toExecutionEvidence(record: EnforcementEvidenceRecord): MiddlewareExecutionEvidence {
  return {
    evidence_id: record.record_id, middleware: record.middleware_ran,
    route: record.route, decision: record.decision_made,
    response_effect: record.response_effect,
    scope_type: record.scope_type, scope_id: record.scope_id,
    timestamp: record.created_at,
  };
}

/** Get evidence count by area */
export function getEvidenceSummary(): Array<{ area: string; count: number; latest: string }> {
  const all = readJson<EnforcementEvidenceRecord[]>(EVIDENCE_FILE, []);
  const byArea: Record<string, { count: number; latest: string }> = {};
  for (const r of all) {
    if (!byArea[r.area]) byArea[r.area] = { count: 0, latest: r.created_at };
    byArea[r.area].count++;
  }
  return Object.entries(byArea).map(([area, v]) => ({ area, ...v }));
}

module.exports = { recordEvidence, getEvidence, getEvidenceByScope, toExecutionEvidence, getEvidenceSummary };
