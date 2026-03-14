"use strict";
// GPO Deliverable ID — Deterministic identity for deliverables
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDeliverableId = computeDeliverableId;
exports.makeKey = makeKey;
exports.parseId = parseId;
exports.computeContentHash = computeContentHash;
const crypto = require('crypto');
/** Compute a deterministic deliverable ID from a key */
function computeDeliverableId(key) {
    const canonical = `${key.projectId}:${key.taskId}:${key.variant}:${key.contractVersion}`;
    const hash = crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 8);
    return `dlv_${slugify(key.projectId)}_${slugify(key.taskId)}_${key.variant}_${hash}`;
}
/** Create a DeliverableKey from task context */
function makeKey(projectId, taskId, variant, contractVersion = 'v1') {
    return { projectId, taskId, variant, contractVersion };
}
/** Parse a deliverable ID back to components (best-effort) */
function parseId(id) {
    const parts = id.replace('dlv_', '').split('_');
    if (parts.length < 4)
        return null;
    const hash = parts[parts.length - 1];
    const variant = parts[parts.length - 2];
    const taskId = parts[parts.length - 3];
    const projectId = parts.slice(0, parts.length - 3).join('_');
    return { projectId, taskId, variant, hash };
}
/** Slugify a string for use in IDs */
function slugify(s) {
    return s.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).toLowerCase() || 'default';
}
/** Compute content hash for a deliverable */
function computeContentHash(content) {
    const canonical = JSON.stringify(content, Object.keys(content).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 16);
}
module.exports = { computeDeliverableId, makeKey, parseId, computeContentHash };
//# sourceMappingURL=deliverable-id.js.map