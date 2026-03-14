// GPO Deliverable Approval Gates — Propose/approve/reject lifecycle for deliverables

import type { DeliverableApprovalRequest } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const REQUESTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'deliverable-approval-requests.json');

function uid(): string { return 'dar_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Propose a deliverable version for approval */
export function propose(deliverableId: string, version: number): DeliverableApprovalRequest {
  const requests = readJson<DeliverableApprovalRequest[]>(REQUESTS_FILE, []);

  // Idempotent: if already pending for same version, return existing
  const existing = requests.find(r => r.deliverable_id === deliverableId && r.version === version && r.status === 'pending');
  if (existing) return existing;

  const request: DeliverableApprovalRequest = {
    request_id: uid(), deliverable_id: deliverableId, version,
    status: 'pending', requested_at: new Date().toISOString(),
  };
  requests.unshift(request);
  if (requests.length > 300) requests.length = 300;
  writeJson(REQUESTS_FILE, requests);

  // Transition deliverable status to proposed
  try {
    const ds = require('./deliverable-store') as { transitionStatus(id: string, v: number, s: string, a: string): unknown };
    ds.transitionStatus(deliverableId, version, 'proposed', 'system');
  } catch { /* */ }

  // Create approval workspace entry
  try {
    const aw = require('./approval-workspace') as { createRequest(req: { request_id: string; title: string; type: string; severity: string; context: Record<string, unknown> }): unknown };
    aw.createRequest({ request_id: request.request_id, title: `Approve deliverable ${deliverableId} v${version}`, type: 'deliverable_approval', severity: 'medium', context: { deliverableId, version } });
  } catch { /* */ }

  return request;
}

/** Approve a deliverable version */
export function approve(deliverableId: string, version: number, approver: string, note?: string): DeliverableApprovalRequest | null {
  const requests = readJson<DeliverableApprovalRequest[]>(REQUESTS_FILE, []);
  const request = requests.find(r => r.deliverable_id === deliverableId && r.version === version && r.status === 'pending');
  if (!request) return null;

  request.status = 'approved';
  request.decided_at = new Date().toISOString();
  request.decided_by = approver;
  request.reason = note || 'Approved';
  writeJson(REQUESTS_FILE, requests);

  // Transition deliverable status
  try {
    const ds = require('./deliverable-store') as { transitionStatus(id: string, v: number, s: string, a: string): unknown };
    ds.transitionStatus(deliverableId, version, 'approved', approver);
  } catch { /* */ }

  // Register as artifact
  try {
    const el = require('./evidence-linker') as { toArtifactRef(id: string, v: number): unknown };
    el.toArtifactRef(deliverableId, version);
  } catch { /* */ }

  return request;
}

/** Reject a deliverable version */
export function reject(deliverableId: string, version: number, reviewer: string, reason: string): DeliverableApprovalRequest | null {
  const requests = readJson<DeliverableApprovalRequest[]>(REQUESTS_FILE, []);
  const request = requests.find(r => r.deliverable_id === deliverableId && r.version === version && r.status === 'pending');
  if (!request) return null;

  request.status = 'rejected';
  request.decided_at = new Date().toISOString();
  request.decided_by = reviewer;
  request.reason = reason;
  writeJson(REQUESTS_FILE, requests);

  try {
    const ds = require('./deliverable-store') as { transitionStatus(id: string, v: number, s: string, a: string): unknown };
    ds.transitionStatus(deliverableId, version, 'rejected', reviewer);
  } catch { /* */ }

  return request;
}

/** Get current approval status for a deliverable */
export function currentStatus(deliverableId: string): DeliverableApprovalRequest | null {
  const requests = readJson<DeliverableApprovalRequest[]>(REQUESTS_FILE, []);
  return requests.find(r => r.deliverable_id === deliverableId) || null;
}

/** Get all approval requests */
export function getRequests(deliverableId?: string): DeliverableApprovalRequest[] {
  const requests = readJson<DeliverableApprovalRequest[]>(REQUESTS_FILE, []);
  return deliverableId ? requests.filter(r => r.deliverable_id === deliverableId) : requests;
}

module.exports = { propose, approve, reject, currentStatus, getRequests };
