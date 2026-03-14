// GPO Artifact Registry — Registers all major system artifacts for lookup and lineage

import type {
  RegisteredArtifact, ArtifactType, ArtifactScope, Domain, Lane,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const REGISTRY_FILE = path.resolve(__dirname, '..', '..', 'state', 'artifact-registry.json');

function uid(): string { return 'ar_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Register an artifact */
export function register(opts: {
  source_id: string;
  type: ArtifactType;
  title: string;
  producer: string;
  scope?: Partial<ArtifactScope>;
  related_task_id?: string;
  related_graph_id?: string;
  related_node_id?: string;
  related_dossier_id?: string;
}): RegisteredArtifact {
  const registry = readJson<RegisteredArtifact[]>(REGISTRY_FILE, []);
  // Deduplicate by source_id + type
  const existing = registry.findIndex(a => a.source_id === opts.source_id && a.type === opts.type);
  if (existing >= 0) {
    registry[existing].updated_at = new Date().toISOString();
    registry[existing].title = opts.title;
    writeJson(REGISTRY_FILE, registry);
    return registry[existing];
  }

  const artifact: RegisteredArtifact = {
    artifact_id: uid(),
    source_id: opts.source_id,
    type: opts.type,
    scope: { isolation_level: 'project', ...opts.scope },
    related_task_id: opts.related_task_id,
    related_graph_id: opts.related_graph_id,
    related_node_id: opts.related_node_id,
    related_dossier_id: opts.related_dossier_id,
    producer: opts.producer,
    title: opts.title,
    retention: 'active',
    integrity: 'valid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  registry.unshift(artifact);
  if (registry.length > 1000) registry.length = 1000;
  writeJson(REGISTRY_FILE, registry);
  return artifact;
}

/** Get all registered artifacts */
export function getAll(): RegisteredArtifact[] { return readJson<RegisteredArtifact[]>(REGISTRY_FILE, []); }

/** Get artifact by ID */
export function getById(artifactId: string): RegisteredArtifact | null {
  return getAll().find(a => a.artifact_id === artifactId || a.source_id === artifactId) || null;
}

/** Get by type */
export function getByType(type: ArtifactType): RegisteredArtifact[] {
  return getAll().filter(a => a.type === type);
}

/** Get by domain */
export function getByDomain(domain: Domain): RegisteredArtifact[] {
  return getAll().filter(a => a.scope.domain === domain);
}

/** Get by project */
export function getByProject(projectId: string): RegisteredArtifact[] {
  return getAll().filter(a => a.scope.project_id === projectId);
}

/** Get by related graph */
export function getByGraph(graphId: string): RegisteredArtifact[] {
  return getAll().filter(a => a.related_graph_id === graphId);
}

module.exports = { register, getAll, getById, getByType, getByDomain, getByProject, getByGraph };
