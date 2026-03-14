"use strict";
// GPO Release Assembly — Build release candidates from approved deliverables
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCandidate = buildCandidate;
exports.diffLockfiles = diffLockfiles;
exports.promoteCandidate = promoteCandidate;
exports.rejectCandidate = rejectCandidate;
exports.getCandidates = getCandidates;
exports.getCurrentRelease = getCurrentRelease;
exports.getLockfile = getLockfile;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const RELEASES_DIR = path.resolve(__dirname, '..', '..', 'state', 'release-candidates');
const INDEX_FILE = path.join(RELEASES_DIR, 'index.json');
const CHANNELS_FILE = path.join(RELEASES_DIR, 'channels.json');
function uid() { return 'rc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function ensureDir(dir) { if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJsonAtomic(f, d) { ensureDir(path.dirname(f)); const tmp = f + '.tmp.' + Date.now(); fs.writeFileSync(tmp, JSON.stringify(d, null, 2)); fs.renameSync(tmp, f); }
/** Build a release candidate from approved deliverables */
function buildCandidate(project, channel, createdBy) {
    ensureDir(RELEASES_DIR);
    // Get all approved deliverables from store
    const entries = [];
    try {
        const ds = require('./deliverable-store');
        const el = require('./evidence-linker');
        const did = require('./deliverable-id');
        const storeIdx = ds.getStoreIndex();
        for (const [deliverableId, entry] of Object.entries(storeIdx.entries)) {
            if (!entry.approvedVersion)
                continue;
            if (entry.key.projectId !== project && project !== 'all')
                continue;
            const stored = require('./deliverable-store').getByVersion(deliverableId, entry.approvedVersion);
            if (!stored)
                continue;
            const evidenceRefs = el.fetchEvidence(deliverableId, entry.approvedVersion).map((r) => r.ref);
            entries.push({
                key: deliverableId,
                type: stored.content.kind,
                variant: entry.key.variant,
                deliverableId,
                version: entry.approvedVersion,
                contentHash: did.computeContentHash(stored.content),
                evidenceRefs,
            });
        }
    }
    catch { /* */ }
    // Sort deterministically
    entries.sort((a, b) => a.key.localeCompare(b.key));
    // Compute entries hash
    const entriesHash = crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0, 16);
    const lockfileId = 'lf_' + entriesHash;
    const candidateId = uid();
    // Get base release
    const channels = readJson(CHANNELS_FILE, {});
    const baseReleaseId = channels[`${project}:${channel}`];
    const lockfile = {
        lockfile_id: lockfileId, project, channel, entries, entries_hash: entriesHash,
        created_at: new Date().toISOString(), created_by: createdBy,
        base_release_id: baseReleaseId,
    };
    const candidate = {
        candidate_id: candidateId, status: 'pending', project, channel,
        lockfile_id: lockfileId, entry_count: entries.length,
        created_at: new Date().toISOString(), created_by: createdBy,
    };
    // Persist
    writeJsonAtomic(path.join(RELEASES_DIR, `${lockfileId}.json`), lockfile);
    const index = readJson(INDEX_FILE, []);
    index.unshift(candidate);
    if (index.length > 100)
        index.length = 100;
    writeJsonAtomic(INDEX_FILE, index);
    return { candidate, lockfile };
}
/** Diff two lockfiles */
function diffLockfiles(aId, bId) {
    const a = readJson(path.join(RELEASES_DIR, `${aId}.json`), null);
    const b = readJson(path.join(RELEASES_DIR, `${bId}.json`), null);
    const changes = [];
    const stat = { added: 0, removed: 0, changed: 0, unchanged: 0 };
    if (!a || !b)
        return { a_id: aId, b_id: bId, stat, changes };
    const aMap = new Map(a.entries.map(e => [e.key, e]));
    const bMap = new Map(b.entries.map(e => [e.key, e]));
    for (const [key, bEntry] of bMap) {
        const aEntry = aMap.get(key);
        if (!aEntry) {
            stat.added++;
            changes.push({ key, type: bEntry.type, to_hash: bEntry.contentHash, change: 'added' });
        }
        else if (aEntry.contentHash !== bEntry.contentHash) {
            stat.changed++;
            changes.push({ key, type: bEntry.type, from_hash: aEntry.contentHash, to_hash: bEntry.contentHash, change: 'changed' });
        }
        else {
            stat.unchanged++;
            changes.push({ key, type: bEntry.type, from_hash: aEntry.contentHash, to_hash: bEntry.contentHash, change: 'unchanged' });
        }
    }
    for (const [key, aEntry] of aMap) {
        if (!bMap.has(key)) {
            stat.removed++;
            changes.push({ key, type: aEntry.type, from_hash: aEntry.contentHash, change: 'removed' });
        }
    }
    return { a_id: aId, b_id: bId, stat, changes: changes.filter(c => c.change !== 'unchanged') };
}
/** Promote a candidate — create release record and update channel pointer */
function promoteCandidate(candidateId, approver) {
    const index = readJson(INDEX_FILE, []);
    const candidate = index.find(c => c.candidate_id === candidateId);
    if (!candidate || candidate.status !== 'pending')
        return null;
    const channels = readJson(CHANNELS_FILE, {});
    const channelKey = `${candidate.project}:${candidate.channel}`;
    const supersedes = channels[channelKey];
    const releaseId = 'rel_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const record = {
        release_id: releaseId, project: candidate.project, channel: candidate.channel,
        lockfile_id: candidate.lockfile_id, created_at: new Date().toISOString(),
        created_by: approver, supersedes,
    };
    // Update candidate status
    candidate.status = 'promoted';
    writeJsonAtomic(INDEX_FILE, index);
    // Update channel pointer
    channels[channelKey] = releaseId;
    writeJsonAtomic(CHANNELS_FILE, channels);
    // Persist release record
    writeJsonAtomic(path.join(RELEASES_DIR, `${releaseId}.json`), record);
    return record;
}
/** Reject a candidate */
function rejectCandidate(candidateId) {
    const index = readJson(INDEX_FILE, []);
    const candidate = index.find(c => c.candidate_id === candidateId);
    if (!candidate || candidate.status !== 'pending')
        return false;
    candidate.status = 'rejected';
    writeJsonAtomic(INDEX_FILE, index);
    return true;
}
/** Get candidates */
function getCandidates(project, channel) {
    const index = readJson(INDEX_FILE, []);
    return index.filter(c => (!project || c.project === project) && (!channel || c.channel === channel));
}
/** Get current release for a channel */
function getCurrentRelease(project, channel) {
    const channels = readJson(CHANNELS_FILE, {});
    const releaseId = channels[`${project}:${channel}`];
    if (!releaseId)
        return null;
    return readJson(path.join(RELEASES_DIR, `${releaseId}.json`), null);
}
/** Get lockfile */
function getLockfile(lockfileId) {
    return readJson(path.join(RELEASES_DIR, `${lockfileId}.json`), null);
}
module.exports = { buildCandidate, diffLockfiles, promoteCandidate, rejectCandidate, getCandidates, getCurrentRelease, getLockfile };
//# sourceMappingURL=release-assembly.js.map