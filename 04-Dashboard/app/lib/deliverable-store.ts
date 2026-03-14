// GPO Deliverable Store — Versioned, append-only persistence for deliverables

import type { StoredDeliverable, DeliverableVersionMeta, DeliverableIndexEntry, DeliverableStoreIndex, DeliverableKey, StructuredDeliverable, DeliverableStatus, MigrationResult } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STORE_DIR = path.resolve(__dirname, '..', '..', 'state', 'deliverables-store');
const INDEX_FILE = path.join(STORE_DIR, 'index.json');
const LEGACY_DIR = path.resolve(__dirname, '..', '..', 'state', 'deliverables');

function ensureDir(dir: string): void { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJsonAtomic(f: string, d: unknown): void {
  const dir = path.dirname(f);
  ensureDir(dir);
  const tmp = f + '.tmp.' + Date.now();
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2));
  fs.renameSync(tmp, f);
}

function getIndex(): DeliverableStoreIndex {
  ensureDir(STORE_DIR);
  return readJson<DeliverableStoreIndex>(INDEX_FILE, { entries: {}, totalDeliverables: 0, totalVersions: 0 });
}

function saveIndex(index: DeliverableStoreIndex): void {
  writeJsonAtomic(INDEX_FILE, index);
}

function versionPath(deliverableId: string, version: number): string {
  return path.join(STORE_DIR, deliverableId, `v${String(version).padStart(4, '0')}.json`);
}

function metaPath(deliverableId: string): string {
  return path.join(STORE_DIR, deliverableId, 'meta.json');
}

/** Create initial version of a deliverable */
export function putInitial(deliverableId: string, key: DeliverableKey, content: StructuredDeliverable, createdBy: DeliverableVersionMeta['createdBy'] = 'system'): StoredDeliverable {
  const did = require('./deliverable-id') as { computeContentHash(c: unknown): string };
  const contentHash = did.computeContentHash(content);

  const meta: DeliverableVersionMeta = {
    deliverableId, version: 1, status: 'draft', contentHash,
    createdAt: new Date().toISOString(), createdBy, parentVersion: null,
  };

  const stored: StoredDeliverable = { meta, content, provenance: {} };

  ensureDir(path.join(STORE_DIR, deliverableId));
  writeJsonAtomic(versionPath(deliverableId, 1), stored);
  writeJsonAtomic(metaPath(deliverableId), { key, versions: [{ version: 1, status: 'draft', contentHash, createdAt: meta.createdAt, createdBy }] });

  // Update index
  const index = getIndex();
  index.entries[deliverableId] = { deliverableId, key, latestVersion: 1, approvedVersion: null, status: 'draft', createdAt: meta.createdAt, updatedAt: meta.createdAt };
  index.totalDeliverables = Object.keys(index.entries).length;
  index.totalVersions++;
  saveIndex(index);

  return stored;
}

/** Create a new version of an existing deliverable */
export function putVersion(deliverableId: string, content: StructuredDeliverable, createdBy: DeliverableVersionMeta['createdBy'] = 'agent', note?: string): StoredDeliverable | null {
  const index = getIndex();
  const entry = index.entries[deliverableId];
  if (!entry) return null;

  const did = require('./deliverable-id') as { computeContentHash(c: unknown): string };
  const contentHash = did.computeContentHash(content);

  // Idempotency: if content hasn't changed, return latest
  const latest = getByVersion(deliverableId, entry.latestVersion);
  if (latest && latest.meta.contentHash === contentHash) return latest;

  const newVersion = entry.latestVersion + 1;
  const meta: DeliverableVersionMeta = {
    deliverableId, version: newVersion, status: 'draft', contentHash,
    createdAt: new Date().toISOString(), createdBy, parentVersion: entry.latestVersion, note,
  };

  const stored: StoredDeliverable = { meta, content, provenance: {} };

  writeJsonAtomic(versionPath(deliverableId, newVersion), stored);

  // Update meta
  const metaData = readJson<{ key: DeliverableKey; versions: Array<Record<string, unknown>> }>(metaPath(deliverableId), { key: entry.key, versions: [] });
  metaData.versions.push({ version: newVersion, status: 'draft', contentHash, createdAt: meta.createdAt, createdBy });
  writeJsonAtomic(metaPath(deliverableId), metaData);

  // Update index
  entry.latestVersion = newVersion;
  entry.status = 'draft';
  entry.updatedAt = meta.createdAt;
  index.totalVersions++;
  saveIndex(index);

  return stored;
}

/** Get latest version */
export function getLatest(deliverableId: string): StoredDeliverable | null {
  const index = getIndex();
  const entry = index.entries[deliverableId];
  if (!entry) return null;
  return getByVersion(deliverableId, entry.latestVersion);
}

/** Get latest approved version */
export function getApproved(deliverableId: string): StoredDeliverable | null {
  const index = getIndex();
  const entry = index.entries[deliverableId];
  if (!entry || !entry.approvedVersion) return null;
  return getByVersion(deliverableId, entry.approvedVersion);
}

/** Get specific version */
export function getByVersion(deliverableId: string, version: number): StoredDeliverable | null {
  const filePath = versionPath(deliverableId, version);
  return readJson<StoredDeliverable | null>(filePath, null);
}

/** List version history */
export function listHistory(deliverableId: string): DeliverableVersionMeta[] {
  const metaData = readJson<{ versions: Array<Record<string, unknown>> }>(metaPath(deliverableId), { versions: [] });
  return metaData.versions.map(v => ({
    deliverableId, version: v.version as number, status: v.status as DeliverableStatus,
    contentHash: v.contentHash as string, createdAt: v.createdAt as string,
    createdBy: (v.createdBy as DeliverableVersionMeta['createdBy']) || 'system', parentVersion: null,
  }));
}

/** Transition status */
export function transitionStatus(deliverableId: string, version: number, newStatus: DeliverableStatus, actor: string): StoredDeliverable | null {
  const stored = getByVersion(deliverableId, version);
  if (!stored) return null;

  stored.meta.status = newStatus;
  writeJsonAtomic(versionPath(deliverableId, version), stored);

  // Update meta
  const metaData = readJson<{ key: DeliverableKey; versions: Array<Record<string, unknown>> }>(metaPath(deliverableId), { key: {} as DeliverableKey, versions: [] });
  const vMeta = metaData.versions.find(v => v.version === version);
  if (vMeta) vMeta.status = newStatus;
  writeJsonAtomic(metaPath(deliverableId), metaData);

  // Update index
  const index = getIndex();
  const entry = index.entries[deliverableId];
  if (entry) {
    if (newStatus === 'approved') {
      // Supersede prior approved
      if (entry.approvedVersion && entry.approvedVersion !== version) {
        const prior = getByVersion(deliverableId, entry.approvedVersion);
        if (prior) { prior.meta.status = 'superseded'; writeJsonAtomic(versionPath(deliverableId, entry.approvedVersion), prior); }
      }
      entry.approvedVersion = version;
    }
    entry.status = newStatus;
    entry.updatedAt = new Date().toISOString();
    saveIndex(index);
  }

  return stored;
}

/** Get store index */
export function getStoreIndex(): DeliverableStoreIndex {
  return getIndex();
}

/** Migrate legacy flat deliverables into versioned store */
export function migrateFlatStore(): MigrationResult {
  const result: MigrationResult = { migrated: 0, skipped: 0, errors: [], created_at: new Date().toISOString() };

  if (!fs.existsSync(LEGACY_DIR)) return result;

  const files = fs.readdirSync(LEGACY_DIR).filter(f => f.endsWith('.json'));
  const did = require('./deliverable-id') as { computeDeliverableId(k: DeliverableKey): string; makeKey(p: string, t: string, v: string, c?: string): DeliverableKey };

  for (const file of files) {
    const taskId = file.replace('.json', '');
    try {
      const content = readJson<StructuredDeliverable | null>(path.join(LEGACY_DIR, file), null);
      if (!content) { result.skipped++; continue; }

      const key = did.makeKey('rpgpo', taskId, content.kind || 'document', 'v1');
      const deliverableId = did.computeDeliverableId(key);

      // Skip if already migrated
      const index = getIndex();
      if (index.entries[deliverableId]) { result.skipped++; continue; }

      putInitial(deliverableId, key, content, 'system');
      // Mark as approved since it was previously surfaced
      transitionStatus(deliverableId, 1, 'approved', 'migration');
      result.migrated++;
    } catch (e) {
      result.errors.push(`${file}: ${e}`);
    }
  }

  return result;
}

/** Reindex — rebuild index from folder contents */
export function reindex(): { verified: number; repaired: number; errors: string[] } {
  ensureDir(STORE_DIR);
  const index: DeliverableStoreIndex = { entries: {}, totalDeliverables: 0, totalVersions: 0 };
  const errors: string[] = [];
  let repaired = 0;

  const dirs = fs.existsSync(STORE_DIR) ? fs.readdirSync(STORE_DIR).filter(f => fs.statSync(path.join(STORE_DIR, f)).isDirectory()) : [];

  for (const dir of dirs) {
    try {
      const meta = readJson<{ key: DeliverableKey; versions: Array<{ version: number; status: string; contentHash: string; createdAt: string; createdBy: string }> }>(path.join(STORE_DIR, dir, 'meta.json'), null as any);
      if (!meta) { errors.push(`${dir}: no meta.json`); continue; }

      const versions = meta.versions.sort((a, b) => b.version - a.version);
      const latest = versions[0];
      const approved = versions.find(v => v.status === 'approved');

      index.entries[dir] = {
        deliverableId: dir, key: meta.key, latestVersion: latest.version,
        approvedVersion: approved?.version || null, status: latest.status as DeliverableStatus,
        createdAt: versions[versions.length - 1]?.createdAt || new Date().toISOString(),
        updatedAt: latest.createdAt,
      };
      index.totalDeliverables++;
      index.totalVersions += versions.length;
    } catch (e) {
      errors.push(`${dir}: ${e}`);
      repaired++;
    }
  }

  saveIndex(index);
  return { verified: index.totalDeliverables, repaired, errors };
}

module.exports = { putInitial, putVersion, getLatest, getApproved, getByVersion, listHistory, transitionStatus, getStoreIndex, migrateFlatStore, reindex };
