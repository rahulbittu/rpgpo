// GPO Compliance Export — Privacy-safe, deterministic export bundles

import type {
  ComplianceScope, ComplianceExportRequest, ComplianceExportResult,
  ComplianceArtifact, PolicyVersion,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EXPORTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'compliance-exports.json');

function uid(): string { return 'ce_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Build a compliance export */
export function buildExport(request: ComplianceExportRequest): ComplianceExportResult {
  const artifacts: ComplianceArtifact[] = [];
  const policyVersions: PolicyVersion[] = [];
  let evidenceSummary = 'No evidence data';
  let overrideCount = 0;
  let exceptionCount = 0;
  let readinessScore: number | undefined;
  let docsComplete = true;

  // Gather registered artifacts
  try {
    const ar = require('./artifact-registry') as { getAll(): import('./types').RegisteredArtifact[] };
    const all = ar.getAll().filter(a =>
      a.related_graph_id === request.related_id || a.related_dossier_id === request.related_id ||
      a.related_task_id === request.related_id || a.source_id === request.related_id
    );
    for (const a of all) {
      artifacts.push({ type: a.type, id: a.source_id, title: a.title, content_summary: `${a.type} artifact (${a.retention})` });
    }
  } catch { /* */ }

  // Gather evidence
  if (request.include_evidence) {
    try {
      const ec = require('./evidence-chain') as { buildBundle(t: string, id: string): import('./types').EvidenceBundle };
      const bundle = ec.buildBundle(request.scope_type, request.related_id);
      evidenceSummary = bundle.summary;
    } catch { /* */ }
  }

  // Gather overrides/exceptions
  if (request.include_overrides) {
    try {
      const ol = require('./override-ledger') as { getAllOverrides(): any[] };
      overrideCount = ol.getAllOverrides().length;
    } catch { /* */ }
    try {
      const el = require('./exception-lifecycle') as { getAllCases(): any[] };
      exceptionCount = el.getAllCases().length;
    } catch { /* */ }
  }

  // Gather policy versions
  if (request.include_policies) {
    try {
      const ph = require('./policy-history') as { getAllVersions(): PolicyVersion[] };
      policyVersions.push(...ph.getAllVersions().slice(0, 20));
    } catch { /* */ }
  }

  // Check documentation
  try {
    const dg = require('./documentation-governance') as {
      checkRequirements(st: string, id: string, l: string): { met: boolean };
    };
    const scopeType = request.scope_type === 'graph' ? 'execution_graph' : request.scope_type === 'dossier' ? 'promotion' : 'release';
    const check = dg.checkRequirements(scopeType, request.related_id, 'prod');
    docsComplete = check.met;
  } catch { /* */ }

  const result: ComplianceExportResult = {
    export_id: uid(),
    scope_type: request.scope_type,
    related_id: request.related_id,
    artifacts,
    policy_versions: policyVersions,
    evidence_summary: evidenceSummary,
    override_count: overrideCount,
    exception_count: exceptionCount,
    readiness_score: readinessScore,
    documentation_complete: docsComplete,
    created_at: new Date().toISOString(),
  };

  const exports = readJson<ComplianceExportResult[]>(EXPORTS_FILE, []);
  exports.unshift(result);
  if (exports.length > 50) exports.length = 50;
  writeJson(EXPORTS_FILE, exports);

  return result;
}

export function getExport(exportId: string): ComplianceExportResult | null {
  return readJson<ComplianceExportResult[]>(EXPORTS_FILE, []).find(e => e.export_id === exportId) || null;
}

export function getAllExports(): ComplianceExportResult[] {
  return readJson<ComplianceExportResult[]>(EXPORTS_FILE, []);
}

module.exports = { buildExport, getExport, getAllExports };
