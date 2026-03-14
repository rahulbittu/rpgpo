// GPO Evidence Linker — Link deliverables to artifacts, subtasks, and traceability

import type { EvidenceRef, EvidenceLinkReport, StoredDeliverable } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const LINKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'evidence-links.json');

function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

type LinkStore = Record<string, Record<number, EvidenceRef[]>>; // deliverableId -> version -> refs

/** Attach evidence refs to a deliverable version */
export function attachEvidence(deliverableId: string, version: number, refs: EvidenceRef[]): EvidenceRef[] {
  const store = readJson<LinkStore>(LINKS_FILE, {});
  if (!store[deliverableId]) store[deliverableId] = {};
  if (!store[deliverableId][version]) store[deliverableId][version] = [];

  for (const ref of refs) {
    const exists = store[deliverableId][version].some(r => r.kind === ref.kind && r.ref === ref.ref);
    if (!exists) store[deliverableId][version].push(ref);
  }

  writeJson(LINKS_FILE, store);

  // Also record in enforcement evidence for traceability
  try {
    const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): unknown };
    ee.recordEvidence('evidence_link', 'evidence-linker', `linked_${refs.length}_refs`, 'linked', 'deliverable', deliverableId, `v${version}`, '');
  } catch { /* */ }

  return store[deliverableId][version];
}

/** Fetch evidence refs for a deliverable version */
export function fetchEvidence(deliverableId: string, version: number): EvidenceRef[] {
  const store = readJson<LinkStore>(LINKS_FILE, {});
  return store[deliverableId]?.[version] || [];
}

/** Get evidence link report for a deliverable */
export function getLinkReport(deliverableId: string, version: number): EvidenceLinkReport {
  const refs = fetchEvidence(deliverableId, version);
  return {
    deliverable_id: deliverableId, version, total_refs: refs.length,
    artifact_refs: refs.filter(r => r.kind === 'artifact').length,
    subtask_refs: refs.filter(r => r.kind === 'subtask').length,
    url_refs: refs.filter(r => r.kind === 'url').length,
  };
}

/** Auto-link evidence from deliverable provenance */
export function autoLinkFromProvenance(deliverableId: string, version: number, provenance: StoredDeliverable['provenance']): EvidenceRef[] {
  const refs: EvidenceRef[] = [];
  for (const [field, entries] of Object.entries(provenance)) {
    for (const entry of entries) {
      refs.push({ kind: 'subtask', ref: entry.subtaskId, label: `${field} from ${entry.stepType}` });
    }
  }
  return attachEvidence(deliverableId, version, refs);
}

/** Register a deliverable as an artifact in the Artifact Registry */
export function toArtifactRef(deliverableId: string, version: number): { artifactId: string } {
  const artifactId = `art_${deliverableId}_v${version}`;
  try {
    const ar = require('./artifact-registry') as { registerArtifact(a: { artifact_id: string; type: string; title: string; retention: string }): unknown };
    ar.registerArtifact({ artifact_id: artifactId, type: 'deliverable', title: `Deliverable ${deliverableId} v${version}`, retention: 'permanent' });
  } catch { /* */ }
  return { artifactId };
}

module.exports = { attachEvidence, fetchEvidence, getLinkReport, autoLinkFromProvenance, toArtifactRef };
