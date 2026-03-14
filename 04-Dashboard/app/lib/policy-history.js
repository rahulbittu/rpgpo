"use strict";
// GPO Policy History — Version tracking and change records for all policy types
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordVersion = recordVersion;
exports.recordChange = recordChange;
exports.getAllVersions = getAllVersions;
exports.getVersionsForType = getVersionsForType;
exports.getHistory = getHistory;
exports.getDiff = getDiff;
exports.getAllChanges = getAllChanges;
const fs = require('fs');
const path = require('path');
const VERSIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'policy-versions.json');
const CHANGES_FILE = path.resolve(__dirname, '..', '..', 'state', 'policy-changes.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Record a policy version snapshot */
function recordVersion(targetType, targetId, state) {
    const versions = readJson(VERSIONS_FILE, []);
    // Supersede previous version
    const previous = versions.filter(v => v.target_type === targetType && v.target_id === targetId && !v.superseded_at);
    for (const p of previous)
        p.superseded_at = new Date().toISOString();
    const nextVersion = previous.length > 0 ? Math.max(...previous.map(p => p.version)) + 1 : 1;
    const version = {
        version_id: uid('pv'), target_type: targetType, target_id: targetId,
        version: nextVersion, state, effective_from: new Date().toISOString(),
    };
    versions.unshift(version);
    if (versions.length > 500)
        versions.length = 500;
    writeJson(VERSIONS_FILE, versions);
    return version;
}
/** Record a policy change */
function recordChange(opts) {
    const changes = readJson(CHANGES_FILE, []);
    const change = {
        change_id: uid('pc'),
        target_type: opts.target_type,
        target_id: opts.target_id,
        before_state: opts.before_state,
        after_state: opts.after_state,
        actor: opts.actor,
        reason: opts.reason,
        linked_tuning_id: opts.linked_tuning_id,
        created_at: new Date().toISOString(),
    };
    changes.unshift(change);
    if (changes.length > 500)
        changes.length = 500;
    writeJson(CHANGES_FILE, changes);
    // Also record new version
    recordVersion(opts.target_type, opts.target_id, opts.after_state);
    return change;
}
/** Get all versions */
function getAllVersions() {
    return readJson(VERSIONS_FILE, []);
}
/** Get versions for a target type */
function getVersionsForType(targetType) {
    return getAllVersions().filter(v => v.target_type === targetType);
}
/** Get version history for a specific target */
function getHistory(targetType, targetId) {
    const versions = getAllVersions().filter(v => v.target_type === targetType && v.target_id === targetId);
    const changes = readJson(CHANGES_FILE, []).filter(c => c.target_type === targetType && c.target_id === targetId);
    return {
        target_type: targetType,
        target_id: targetId,
        current_version: versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0,
        versions: versions.sort((a, b) => b.version - a.version),
        changes: changes.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
}
/** Get diff for a target (latest change) */
function getDiff(targetType, targetId) {
    const changes = readJson(CHANGES_FILE, []).filter(c => c.target_type === targetType && c.target_id === targetId);
    return changes[0] || null;
}
/** Get all changes */
function getAllChanges() {
    return readJson(CHANGES_FILE, []);
}
module.exports = { recordVersion, recordChange, getAllVersions, getVersionsForType, getHistory, getDiff, getAllChanges };
//# sourceMappingURL=policy-history.js.map