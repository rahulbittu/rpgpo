// GPO Shared Governance Boundaries — Rules for what can be shared across projects

import type { IsolatedArtifactType, CrossProjectAccessOutcome } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const BOUNDARIES_FILE = path.resolve(__dirname, '..', '..', 'state', 'governance-boundaries.json');

function uid(): string { return 'gb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

interface GovernanceBoundary {
  boundary_id: string;
  artifact_type: IsolatedArtifactType;
  sharing_allowed: boolean;
  requires_redaction: boolean;
  requires_approval: boolean;
  description: string;
  enabled: boolean;
  created_at: string;
}

function defaultBoundaries(): GovernanceBoundary[] {
  return [
    { boundary_id: 'gb_context', artifact_type: 'context', sharing_allowed: false, requires_redaction: true, requires_approval: true, description: 'Project context is private by default', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_governance', artifact_type: 'governance', sharing_allowed: true, requires_redaction: false, requires_approval: false, description: 'Governance rules/policies can be shared', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_override', artifact_type: 'override', sharing_allowed: false, requires_redaction: true, requires_approval: true, description: 'Override details are project-private', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_exception', artifact_type: 'exception', sharing_allowed: false, requires_redaction: true, requires_approval: true, description: 'Exception cases are project-private', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_tuning', artifact_type: 'tuning', sharing_allowed: true, requires_redaction: true, requires_approval: true, description: 'Tuning lessons can be shared after redaction+approval', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_provider', artifact_type: 'provider_fit', sharing_allowed: true, requires_redaction: false, requires_approval: false, description: 'Provider heuristics can be shared freely', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_execution', artifact_type: 'execution', sharing_allowed: false, requires_redaction: true, requires_approval: true, description: 'Execution details are project-private', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_promotion', artifact_type: 'promotion', sharing_allowed: false, requires_redaction: true, requires_approval: true, description: 'Promotion details are project-private', enabled: true, created_at: new Date().toISOString() },
    { boundary_id: 'gb_pattern', artifact_type: 'pattern', sharing_allowed: true, requires_redaction: true, requires_approval: true, description: 'Patterns shareable after redaction+approval', enabled: true, created_at: new Date().toISOString() },
  ];
}

function ensureDefaults(): GovernanceBoundary[] {
  let boundaries = readJson<GovernanceBoundary[]>(BOUNDARIES_FILE, []);
  if (boundaries.length === 0) { boundaries = defaultBoundaries(); writeJson(BOUNDARIES_FILE, boundaries); }
  return boundaries;
}

export function getAllBoundaries(): GovernanceBoundary[] { return ensureDefaults(); }

export function getBoundaryForType(artifactType: IsolatedArtifactType): GovernanceBoundary | null {
  return ensureDefaults().find(b => b.artifact_type === artifactType && b.enabled) || null;
}

/** Check if sharing is allowed for an artifact type */
export function isSharingAllowed(artifactType: IsolatedArtifactType): {
  allowed: boolean;
  requires_redaction: boolean;
  requires_approval: boolean;
} {
  const boundary = getBoundaryForType(artifactType);
  if (!boundary) return { allowed: false, requires_redaction: true, requires_approval: true };
  return {
    allowed: boundary.sharing_allowed,
    requires_redaction: boundary.requires_redaction,
    requires_approval: boundary.requires_approval,
  };
}

export function createBoundary(opts: Omit<GovernanceBoundary, 'boundary_id' | 'created_at'>): GovernanceBoundary {
  const boundaries = ensureDefaults();
  const b: GovernanceBoundary = { ...opts, boundary_id: uid(), created_at: new Date().toISOString() };
  boundaries.unshift(b);
  writeJson(BOUNDARIES_FILE, boundaries);
  return b;
}

module.exports = { getAllBoundaries, getBoundaryForType, isSharingAllowed, createBoundary };
