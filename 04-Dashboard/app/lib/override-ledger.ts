// GPO Override Ledger — Append-only audit trail for governance overrides
// Supports request, approve, reject. Tracks expiry and remediation items.

import type {
  SimulationScope, EnforcementAction, OverrideType, OverrideStatus, OverrideEntry,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const LEDGER_FILE = path.resolve(__dirname, '..', '..', 'state', 'override-ledger.json');

function uid(): string { return 'ov_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Override CRUD
// ═══════════════════════════════════════════

/** Request an override */
export function requestOverride(opts: {
  related_type: SimulationScope;
  related_id: string;
  action: EnforcementAction;
  override_type: OverrideType;
  reason: string;
  notes?: string;
  requested_by?: string;
  expires_at?: string;
  remediation_items?: string[];
}): OverrideEntry {
  const ledger = readJson<OverrideEntry[]>(LEDGER_FILE, []);
  const entry: OverrideEntry = {
    override_id: uid(),
    related_type: opts.related_type,
    related_id: opts.related_id,
    action: opts.action,
    override_type: opts.override_type,
    reason: opts.reason,
    notes: opts.notes || '',
    status: 'pending',
    requested_by: opts.requested_by || 'operator',
    remediation_items: opts.remediation_items || [],
    created_at: new Date().toISOString(),
  };
  if (opts.expires_at) entry.expires_at = opts.expires_at;
  ledger.unshift(entry);
  if (ledger.length > 500) ledger.length = 500;
  writeJson(LEDGER_FILE, ledger);
  return entry;
}

/** Approve an override */
export function approveOverride(overrideId: string, resolvedBy: string = 'operator'): OverrideEntry | null {
  const ledger = readJson<OverrideEntry[]>(LEDGER_FILE, []);
  const idx = ledger.findIndex(e => e.override_id === overrideId);
  if (idx === -1 || ledger[idx].status !== 'pending') return null;
  ledger[idx].status = 'approved';
  ledger[idx].resolved_by = resolvedBy;
  ledger[idx].resolved_at = new Date().toISOString();
  writeJson(LEDGER_FILE, ledger);
  // Part 45: Auto-emit telemetry
  try { const tw = require('./telemetry-wiring') as { emitTelemetry(c: string, a: string, o: string): void }; tw.emitTelemetry('governance_runtime', 'override_approved', 'success'); } catch { /* */ }
  return ledger[idx];
}

/** Reject an override */
export function rejectOverride(overrideId: string, resolvedBy: string = 'operator'): OverrideEntry | null {
  const ledger = readJson<OverrideEntry[]>(LEDGER_FILE, []);
  const idx = ledger.findIndex(e => e.override_id === overrideId);
  if (idx === -1 || ledger[idx].status !== 'pending') return null;
  ledger[idx].status = 'rejected';
  ledger[idx].resolved_by = resolvedBy;
  ledger[idx].resolved_at = new Date().toISOString();
  writeJson(LEDGER_FILE, ledger);
  return ledger[idx];
}

/** Get overrides for an entity */
export function getOverridesForEntity(relatedType: SimulationScope, relatedId: string): OverrideEntry[] {
  return readJson<OverrideEntry[]>(LEDGER_FILE, []).filter(e => e.related_type === relatedType && e.related_id === relatedId);
}

/** Get approved, non-expired overrides for an entity+action */
export function getApprovedOverrides(relatedType: SimulationScope, relatedId: string, action: EnforcementAction): OverrideEntry[] {
  const now = new Date().toISOString();
  return readJson<OverrideEntry[]>(LEDGER_FILE, []).filter(e =>
    e.related_type === relatedType && e.related_id === relatedId &&
    e.action === action && e.status === 'approved' &&
    (!e.expires_at || e.expires_at > now)
  );
}

/** Get all pending overrides */
export function getPendingOverrides(): OverrideEntry[] {
  return readJson<OverrideEntry[]>(LEDGER_FILE, []).filter(e => e.status === 'pending');
}

/** Get full ledger */
export function getAllOverrides(): OverrideEntry[] {
  return readJson<OverrideEntry[]>(LEDGER_FILE, []);
}

module.exports = {
  requestOverride, approveOverride, rejectOverride,
  getOverridesForEntity, getApprovedOverrides,
  getPendingOverrides, getAllOverrides,
};
