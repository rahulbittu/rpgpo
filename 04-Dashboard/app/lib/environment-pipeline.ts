// GPO Environment Promotion Pipeline — Formalized dev→beta→prod transitions

import type {
  EnvironmentPromotionRequest, PipelineStatus, Lane, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const REQUESTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'pipeline-requests.json');

function uid(): string { return 'pp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Evaluate and create a pipeline promotion request */
export function evaluate(dossierId: string, targetLane: Lane): EnvironmentPromotionRequest {
  const blockers: string[] = [];
  const approvalsRequired: string[] = ['operator_approval'];
  const approvalsObtained: string[] = [];
  let readinessScore: number | undefined;
  let docsComplete = false;
  let exceptionsOpen = 0;
  let domain: Domain = 'general';
  let projectId: string | undefined;
  const sourceLane: Lane = targetLane === 'prod' ? 'beta' : 'dev';

  // Get dossier context
  try {
    const pd = require('./promotion-dossiers') as { getDossier(id: string): import('./types').PromotionDossier | null };
    const d = pd.getDossier(dossierId);
    if (d) { domain = d.domain; }
    if (d?.recommendation === 'rework') blockers.push('Dossier recommendation is rework');
  } catch { /* */ }

  // Readiness
  try {
    const rr = require('./release-readiness') as { getScoresForEntity(t: string, id: string): import('./types').ReleaseReadinessScore[] };
    const scores = rr.getScoresForEntity('dossier', dossierId);
    if (scores.length > 0) readinessScore = scores[0].overall_score;
  } catch { /* */ }

  // Documentation
  try {
    const dg = require('./documentation-governance') as { checkRequirements(t: string, id: string, l: string): { met: boolean; missing: string[] } };
    const check = dg.checkRequirements('promotion', dossierId, targetLane);
    docsComplete = check.met;
    if (!check.met && targetLane === 'prod') blockers.push(`Docs missing: ${check.missing.join(', ')}`);
  } catch { /* */ }

  // Exceptions
  try {
    const el = require('./exception-lifecycle') as { getOpenCases(): any[] };
    exceptionsOpen = el.getOpenCases().length;
    if (exceptionsOpen > 0 && targetLane === 'prod') blockers.push(`${exceptionsOpen} open exception(s)`);
  } catch { /* */ }

  // Approvals
  if (targetLane === 'prod') {
    approvalsRequired.push('documentation_review', 'final_sign_off');
  }

  let status: PipelineStatus = blockers.length > 0 ? 'blocked' : 'awaiting_approval';

  const request: EnvironmentPromotionRequest = {
    request_id: uid(), dossier_id: dossierId, source_lane: sourceLane, target_lane: targetLane,
    project_id: projectId, domain, status, blockers,
    approvals_required: approvalsRequired, approvals_obtained: approvalsObtained,
    readiness_score: readinessScore, docs_complete: docsComplete,
    exceptions_open: exceptionsOpen,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };

  const requests = readJson<EnvironmentPromotionRequest[]>(REQUESTS_FILE, []);
  requests.unshift(request);
  if (requests.length > 100) requests.length = 100;
  writeJson(REQUESTS_FILE, requests);
  return request;
}

export function getRequests(projectId?: string): EnvironmentPromotionRequest[] {
  const all = readJson<EnvironmentPromotionRequest[]>(REQUESTS_FILE, []);
  return projectId ? all.filter(r => r.project_id === projectId) : all;
}

export function getRequest(requestId: string): EnvironmentPromotionRequest | null {
  return readJson<EnvironmentPromotionRequest[]>(REQUESTS_FILE, []).find(r => r.request_id === requestId) || null;
}

module.exports = { evaluate, getRequests, getRequest };
