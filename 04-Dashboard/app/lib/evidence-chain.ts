// GPO Evidence Chain — Lineage links between artifacts for decision traceability

import type {
  EvidenceNode, EvidenceEdge, EvidenceBundle, EvidenceRelation,
  LineageSummary, ArtifactType,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EDGES_FILE = path.resolve(__dirname, '..', '..', 'state', 'evidence-edges.json');
const BUNDLES_FILE = path.resolve(__dirname, '..', '..', 'state', 'evidence-bundles.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Link two artifacts in the evidence chain */
export function link(sourceId: string, targetId: string, relation: EvidenceRelation, notes: string = ''): EvidenceEdge {
  const edges = readJson<EvidenceEdge[]>(EDGES_FILE, []);
  const edge: EvidenceEdge = {
    edge_id: uid('ee'), source_id: sourceId, target_id: targetId,
    relation, notes, created_at: new Date().toISOString(),
  };
  edges.unshift(edge);
  if (edges.length > 1000) edges.length = 1000;
  writeJson(EDGES_FILE, edges);
  return edge;
}

/** Get all edges for an artifact */
export function getEdgesFor(artifactId: string): { upstream: EvidenceEdge[]; downstream: EvidenceEdge[] } {
  const edges = readJson<EvidenceEdge[]>(EDGES_FILE, []);
  return {
    upstream: edges.filter(e => e.target_id === artifactId),
    downstream: edges.filter(e => e.source_id === artifactId),
  };
}

/** Get lineage summary for an artifact */
export function getLineage(artifactId: string): LineageSummary {
  const { upstream, downstream } = getEdgesFor(artifactId);

  // Resolve artifact types from registry
  let getById: ((id: string) => { type: ArtifactType } | null) | null = null;
  try {
    const ar = require('./artifact-registry') as { getById(id: string): { type: ArtifactType } | null };
    getById = ar.getById;
  } catch { /* */ }

  return {
    artifact_id: artifactId,
    upstream: upstream.map(e => ({
      id: e.source_id,
      type: getById?.(e.source_id)?.type || ('unknown' as ArtifactType),
      relation: e.relation,
    })),
    downstream: downstream.map(e => ({
      id: e.target_id,
      type: getById?.(e.target_id)?.type || ('unknown' as ArtifactType),
      relation: e.relation,
    })),
  };
}

/** Build an evidence bundle for a related entity */
export function buildBundle(relatedType: string, relatedId: string): EvidenceBundle {
  const nodes: EvidenceNode[] = [];
  const edges: EvidenceEdge[] = [];

  // Gather artifacts related to this entity
  try {
    const ar = require('./artifact-registry') as { getAll(): import('./types').RegisteredArtifact[] };
    const artifacts = ar.getAll().filter(a =>
      a.related_graph_id === relatedId || a.related_dossier_id === relatedId ||
      a.related_task_id === relatedId || a.source_id === relatedId
    );
    for (const a of artifacts) {
      nodes.push({ node_id: a.artifact_id, artifact_id: a.artifact_id, artifact_type: a.type, title: a.title });
    }
  } catch { /* */ }

  // Gather edges between these nodes
  const nodeIds = new Set(nodes.map(n => n.artifact_id));
  const allEdges = readJson<EvidenceEdge[]>(EDGES_FILE, []);
  for (const e of allEdges) {
    if (nodeIds.has(e.source_id) || nodeIds.has(e.target_id)) {
      edges.push(e);
    }
  }

  const summary = `Evidence bundle for ${relatedType}:${relatedId} — ${nodes.length} artifacts, ${edges.length} links`;

  const bundle: EvidenceBundle = {
    bundle_id: uid('eb'), related_type: relatedType, related_id: relatedId,
    nodes, edges, summary, created_at: new Date().toISOString(),
  };

  const bundles = readJson<EvidenceBundle[]>(BUNDLES_FILE, []);
  bundles.unshift(bundle);
  if (bundles.length > 200) bundles.length = 200;
  writeJson(BUNDLES_FILE, bundles);

  return bundle;
}

/** Get bundles for an entity */
export function getBundles(relatedType: string, relatedId: string): EvidenceBundle[] {
  return readJson<EvidenceBundle[]>(BUNDLES_FILE, []).filter(b => b.related_type === relatedType && b.related_id === relatedId);
}

module.exports = { link, getEdgesFor, getLineage, buildBundle, getBundles };
