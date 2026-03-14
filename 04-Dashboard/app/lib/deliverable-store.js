"use strict";
// GPO Deliverable Store — Versioned, append-only persistence for deliverables
Object.defineProperty(exports, "__esModule", { value: true });
exports.putInitial = putInitial;
exports.putVersion = putVersion;
exports.getLatest = getLatest;
exports.getApproved = getApproved;
exports.getByVersion = getByVersion;
exports.listHistory = listHistory;
exports.transitionStatus = transitionStatus;
exports.getStoreIndex = getStoreIndex;
exports.migrateFlatStore = migrateFlatStore;
exports.reindex = reindex;
const fs = require('fs');
const path = require('path');
const STORE_DIR = path.resolve(__dirname, '..', '..', 'state', 'deliverables-store');
const INDEX_FILE = path.join(STORE_DIR, 'index.json');
const LEGACY_DIR = path.resolve(__dirname, '..', '..', 'state', 'deliverables');
function ensureDir(dir) { if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJsonAtomic(f, d) {
    const dir = path.dirname(f);
    ensureDir(dir);
    const tmp = f + '.tmp.' + Date.now();
    fs.writeFileSync(tmp, JSON.stringify(d, null, 2));
    fs.renameSync(tmp, f);
}
function getIndex() {
    ensureDir(STORE_DIR);
    return readJson(INDEX_FILE, { entries: {}, totalDeliverables: 0, totalVersions: 0 });
}
function saveIndex(index) {
    writeJsonAtomic(INDEX_FILE, index);
}
function versionPath(deliverableId, version) {
    return path.join(STORE_DIR, deliverableId, `v${String(version).padStart(4, '0')}.json`);
}
function metaPath(deliverableId) {
    return path.join(STORE_DIR, deliverableId, 'meta.json');
}
/** Create initial version of a deliverable */
function putInitial(deliverableId, key, content, createdBy = 'system') {
    const did = require('./deliverable-id');
    const contentHash = did.computeContentHash(content);
    const meta = {
        deliverableId, version: 1, status: 'draft', contentHash,
        createdAt: new Date().toISOString(), createdBy, parentVersion: null,
    };
    const stored = { meta, content, provenance: {} };
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
function putVersion(deliverableId, content, createdBy = 'agent', note) {
    const index = getIndex();
    const entry = index.entries[deliverableId];
    if (!entry)
        return null;
    const did = require('./deliverable-id');
    const contentHash = did.computeContentHash(content);
    // Idempotency: if content hasn't changed, return latest
    const latest = getByVersion(deliverableId, entry.latestVersion);
    if (latest && latest.meta.contentHash === contentHash)
        return latest;
    const newVersion = entry.latestVersion + 1;
    const meta = {
        deliverableId, version: newVersion, status: 'draft', contentHash,
        createdAt: new Date().toISOString(), createdBy, parentVersion: entry.latestVersion, note,
    };
    const stored = { meta, content, provenance: {} };
    writeJsonAtomic(versionPath(deliverableId, newVersion), stored);
    // Update meta
    const metaData = readJson(metaPath(deliverableId), { key: entry.key, versions: [] });
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
function getLatest(deliverableId) {
    const index = getIndex();
    const entry = index.entries[deliverableId];
    if (!entry)
        return null;
    return getByVersion(deliverableId, entry.latestVersion);
}
/** Get latest approved version */
function getApproved(deliverableId) {
    const index = getIndex();
    const entry = index.entries[deliverableId];
    if (!entry || !entry.approvedVersion)
        return null;
    return getByVersion(deliverableId, entry.approvedVersion);
}
/** Get specific version */
function getByVersion(deliverableId, version) {
    const filePath = versionPath(deliverableId, version);
    return readJson(filePath, null);
}
/** List version history */
function listHistory(deliverableId) {
    const metaData = readJson(metaPath(deliverableId), { versions: [] });
    return metaData.versions.map(v => ({
        deliverableId, version: v.version, status: v.status,
        contentHash: v.contentHash, createdAt: v.createdAt,
        createdBy: v.createdBy || 'system', parentVersion: null,
    }));
}
/** Transition status */
function transitionStatus(deliverableId, version, newStatus, actor) {
    const stored = getByVersion(deliverableId, version);
    if (!stored)
        return null;
    stored.meta.status = newStatus;
    writeJsonAtomic(versionPath(deliverableId, version), stored);
    // Update meta
    const metaData = readJson(metaPath(deliverableId), { key: {}, versions: [] });
    const vMeta = metaData.versions.find(v => v.version === version);
    if (vMeta)
        vMeta.status = newStatus;
    writeJsonAtomic(metaPath(deliverableId), metaData);
    // Update index
    const index = getIndex();
    const entry = index.entries[deliverableId];
    if (entry) {
        if (newStatus === 'approved') {
            // Supersede prior approved
            if (entry.approvedVersion && entry.approvedVersion !== version) {
                const prior = getByVersion(deliverableId, entry.approvedVersion);
                if (prior) {
                    prior.meta.status = 'superseded';
                    writeJsonAtomic(versionPath(deliverableId, entry.approvedVersion), prior);
                }
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
function getStoreIndex() {
    return getIndex();
}
/** Migrate legacy flat deliverables into versioned store */
function migrateFlatStore() {
    const result = { migrated: 0, skipped: 0, errors: [], created_at: new Date().toISOString() };
    if (!fs.existsSync(LEGACY_DIR))
        return result;
    const files = fs.readdirSync(LEGACY_DIR).filter(f => f.endsWith('.json'));
    const did = require('./deliverable-id');
    for (const file of files) {
        const taskId = file.replace('.json', '');
        try {
            const content = readJson(path.join(LEGACY_DIR, file), null);
            if (!content) {
                result.skipped++;
                continue;
            }
            const key = did.makeKey('rpgpo', taskId, content.kind || 'document', 'v1');
            const deliverableId = did.computeDeliverableId(key);
            // Skip if already migrated
            const index = getIndex();
            if (index.entries[deliverableId]) {
                result.skipped++;
                continue;
            }
            putInitial(deliverableId, key, content, 'system');
            // Mark as approved since it was previously surfaced
            transitionStatus(deliverableId, 1, 'approved', 'migration');
            result.migrated++;
        }
        catch (e) {
            result.errors.push(`${file}: ${e}`);
        }
    }
    return result;
}
/** Reindex — rebuild index from folder contents */
function reindex() {
    ensureDir(STORE_DIR);
    const index = { entries: {}, totalDeliverables: 0, totalVersions: 0 };
    const errors = [];
    let repaired = 0;
    const dirs = fs.existsSync(STORE_DIR) ? fs.readdirSync(STORE_DIR).filter(f => fs.statSync(path.join(STORE_DIR, f)).isDirectory()) : [];
    for (const dir of dirs) {
        try {
            const meta = readJson(path.join(STORE_DIR, dir, 'meta.json'), null);
            if (!meta) {
                errors.push(`${dir}: no meta.json`);
                continue;
            }
            const versions = meta.versions.sort((a, b) => b.version - a.version);
            const latest = versions[0];
            const approved = versions.find(v => v.status === 'approved');
            index.entries[dir] = {
                deliverableId: dir, key: meta.key, latestVersion: latest.version,
                approvedVersion: approved?.version || null, status: latest.status,
                createdAt: versions[versions.length - 1]?.createdAt || new Date().toISOString(),
                updatedAt: latest.createdAt,
            };
            index.totalDeliverables++;
            index.totalVersions += versions.length;
        }
        catch (e) {
            errors.push(`${dir}: ${e}`);
            repaired++;
        }
    }
    saveIndex(index);
    return { verified: index.totalDeliverables, repaired, errors };
}
module.exports = { putInitial, putVersion, getLatest, getApproved, getByVersion, listHistory, transitionStatus, getStoreIndex, migrateFlatStore, reindex };
//# sourceMappingURL=deliverable-store.js.map