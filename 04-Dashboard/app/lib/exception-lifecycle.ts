// GPO Exception Lifecycle Management — Unified lifecycle for overrides, blocks, escalations
// Links enforcement decisions, overrides, blocks, and escalation events into cases.

import type {
  ExceptionCase, ExceptionLifecycleStage, Domain, Lane,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const CASES_FILE = path.resolve(__dirname, '..', '..', 'state', 'exception-cases.json');

function uid(): string { return 'ec_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Create an exception case */
export function createCase(opts: {
  source_type: ExceptionCase['source_type'];
  source_id: string;
  title: string;
  severity?: ExceptionCase['severity'];
  graph_id?: string;
  node_id?: string;
  dossier_id?: string;
  domain?: Domain;
  project_id?: string;
  lane?: Lane;
}): ExceptionCase {
  const cases = readJson<ExceptionCase[]>(CASES_FILE, []);
  const c: ExceptionCase = {
    case_id: uid(),
    source_type: opts.source_type,
    source_id: opts.source_id,
    title: opts.title,
    severity: opts.severity || 'medium',
    stage: 'opened',
    graph_id: opts.graph_id,
    node_id: opts.node_id,
    dossier_id: opts.dossier_id,
    domain: opts.domain,
    project_id: opts.project_id,
    lane: opts.lane,
    linked_override_ids: [],
    linked_block_ids: [],
    linked_escalation_ids: [],
    remediation_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  cases.unshift(c);
  if (cases.length > 300) cases.length = 300;
  writeJson(CASES_FILE, cases);
  return c;
}

/** Get all cases */
export function getAllCases(): ExceptionCase[] { return readJson<ExceptionCase[]>(CASES_FILE, []); }

export function getCasesForDomain(domain: Domain): ExceptionCase[] {
  return getAllCases().filter(c => c.domain === domain);
}

export function getCasesForProject(projectId: string): ExceptionCase[] {
  return getAllCases().filter(c => c.project_id === projectId);
}

export function getCase(caseId: string): ExceptionCase | null {
  return getAllCases().find(c => c.case_id === caseId) || null;
}

/** Assign owner to a case */
export function assignOwner(caseId: string, owner: string): ExceptionCase | null {
  return updateCase(caseId, { owner, stage: 'assigned' });
}

/** Update case status */
export function updateStatus(caseId: string, stage: ExceptionLifecycleStage, notes?: string): ExceptionCase | null {
  const updates: Partial<ExceptionCase> = { stage };
  if (notes) updates.remediation_notes = notes;
  if (stage === 'resolved' || stage === 'closed') updates.resolution_outcome = 'fixed';
  return updateCase(caseId, updates);
}

/** Link override to case */
export function linkOverride(caseId: string, overrideId: string): ExceptionCase | null {
  const c = getCase(caseId);
  if (!c) return null;
  if (!c.linked_override_ids.includes(overrideId)) c.linked_override_ids.push(overrideId);
  return updateCase(caseId, { linked_override_ids: c.linked_override_ids });
}

/** Link block to case */
export function linkBlock(caseId: string, blockId: string): ExceptionCase | null {
  const c = getCase(caseId);
  if (!c) return null;
  if (!c.linked_block_ids.includes(blockId)) c.linked_block_ids.push(blockId);
  return updateCase(caseId, { linked_block_ids: c.linked_block_ids });
}

function updateCase(caseId: string, updates: Partial<ExceptionCase>): ExceptionCase | null {
  const cases = getAllCases();
  const idx = cases.findIndex(c => c.case_id === caseId);
  if (idx === -1) return null;
  Object.assign(cases[idx], updates, { updated_at: new Date().toISOString() });
  writeJson(CASES_FILE, cases);
  return cases[idx];
}

/** Get open cases (not resolved/closed/expired) */
export function getOpenCases(): ExceptionCase[] {
  const terminal: ExceptionLifecycleStage[] = ['resolved', 'verified', 'closed', 'expired', 'consumed'];
  return getAllCases().filter(c => !terminal.includes(c.stage));
}

module.exports = {
  createCase, getAllCases, getCasesForDomain, getCasesForProject, getCase,
  assignOwner, updateStatus, linkOverride, linkBlock, getOpenCases,
};
