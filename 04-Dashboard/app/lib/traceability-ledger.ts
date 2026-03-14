// GPO Traceability Ledger — Append-only audit trail of material system actions

import type {
  TraceabilityLedgerEntry, ArtifactScope, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const LEDGER_FILE = path.resolve(__dirname, '..', '..', 'state', 'traceability-ledger.json');

function uid(): string { return 'tl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Append an entry to the traceability ledger */
export function append(opts: {
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  scope?: Partial<ArtifactScope>;
  detail?: string;
  linked_artifact_ids?: string[];
}): TraceabilityLedgerEntry {
  const ledger = readJson<TraceabilityLedgerEntry[]>(LEDGER_FILE, []);
  const entry: TraceabilityLedgerEntry = {
    entry_id: uid(),
    actor: opts.actor,
    action: opts.action,
    target_type: opts.target_type,
    target_id: opts.target_id,
    scope: { isolation_level: 'project', ...opts.scope },
    detail: opts.detail || '',
    linked_artifact_ids: opts.linked_artifact_ids || [],
    created_at: new Date().toISOString(),
  };
  ledger.unshift(entry);
  if (ledger.length > 2000) ledger.length = 2000;
  writeJson(LEDGER_FILE, ledger);
  return entry;
}

/** Get all ledger entries */
export function getAll(): TraceabilityLedgerEntry[] {
  return readJson<TraceabilityLedgerEntry[]>(LEDGER_FILE, []);
}

/** Get by domain */
export function getByDomain(domain: Domain): TraceabilityLedgerEntry[] {
  return getAll().filter(e => e.scope.domain === domain);
}

/** Get by project */
export function getByProject(projectId: string): TraceabilityLedgerEntry[] {
  return getAll().filter(e => e.scope.project_id === projectId);
}

/** Get by entry ID */
export function getById(entryId: string): TraceabilityLedgerEntry | null {
  return getAll().find(e => e.entry_id === entryId) || null;
}

/** Get by target */
export function getByTarget(targetType: string, targetId: string): TraceabilityLedgerEntry[] {
  return getAll().filter(e => e.target_type === targetType && e.target_id === targetId);
}

module.exports = { append, getAll, getByDomain, getByProject, getById, getByTarget };
