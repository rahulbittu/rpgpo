"use strict";
// GPO Override Ledger — Append-only audit trail for governance overrides
// Supports request, approve, reject. Tracks expiry and remediation items.
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOverride = requestOverride;
exports.approveOverride = approveOverride;
exports.rejectOverride = rejectOverride;
exports.getOverridesForEntity = getOverridesForEntity;
exports.getApprovedOverrides = getApprovedOverrides;
exports.getPendingOverrides = getPendingOverrides;
exports.getAllOverrides = getAllOverrides;
const fs = require('fs');
const path = require('path');
const LEDGER_FILE = path.resolve(__dirname, '..', '..', 'state', 'override-ledger.json');
function uid() { return 'ov_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Override CRUD
// ═══════════════════════════════════════════
/** Request an override */
function requestOverride(opts) {
    const ledger = readJson(LEDGER_FILE, []);
    const entry = {
        override_id: uid(),
        related_type: opts.related_type,
        related_id: opts.related_id,
        action: opts.action,
        override_type: opts.override_type,
        reason: opts.reason,
        notes: opts.notes || '',
        status: 'pending',
        requested_by: opts.requested_by || 'operator',
        remediation_items: opts.remediation_items || [],
        created_at: new Date().toISOString(),
    };
    if (opts.expires_at)
        entry.expires_at = opts.expires_at;
    ledger.unshift(entry);
    if (ledger.length > 500)
        ledger.length = 500;
    writeJson(LEDGER_FILE, ledger);
    return entry;
}
/** Approve an override */
function approveOverride(overrideId, resolvedBy = 'operator') {
    const ledger = readJson(LEDGER_FILE, []);
    const idx = ledger.findIndex(e => e.override_id === overrideId);
    if (idx === -1 || ledger[idx].status !== 'pending')
        return null;
    ledger[idx].status = 'approved';
    ledger[idx].resolved_by = resolvedBy;
    ledger[idx].resolved_at = new Date().toISOString();
    writeJson(LEDGER_FILE, ledger);
    // Part 45: Auto-emit telemetry
    try {
        const tw = require('./telemetry-wiring');
        tw.emitTelemetry('governance_runtime', 'override_approved', 'success');
    }
    catch { /* */ }
    return ledger[idx];
}
/** Reject an override */
function rejectOverride(overrideId, resolvedBy = 'operator') {
    const ledger = readJson(LEDGER_FILE, []);
    const idx = ledger.findIndex(e => e.override_id === overrideId);
    if (idx === -1 || ledger[idx].status !== 'pending')
        return null;
    ledger[idx].status = 'rejected';
    ledger[idx].resolved_by = resolvedBy;
    ledger[idx].resolved_at = new Date().toISOString();
    writeJson(LEDGER_FILE, ledger);
    return ledger[idx];
}
/** Get overrides for an entity */
function getOverridesForEntity(relatedType, relatedId) {
    return readJson(LEDGER_FILE, []).filter(e => e.related_type === relatedType && e.related_id === relatedId);
}
/** Get approved, non-expired overrides for an entity+action */
function getApprovedOverrides(relatedType, relatedId, action) {
    const now = new Date().toISOString();
    return readJson(LEDGER_FILE, []).filter(e => e.related_type === relatedType && e.related_id === relatedId &&
        e.action === action && e.status === 'approved' &&
        (!e.expires_at || e.expires_at > now));
}
/** Get all pending overrides */
function getPendingOverrides() {
    return readJson(LEDGER_FILE, []).filter(e => e.status === 'pending');
}
/** Get full ledger */
function getAllOverrides() {
    return readJson(LEDGER_FILE, []);
}
module.exports = {
    requestOverride, approveOverride, rejectOverride,
    getOverridesForEntity, getApprovedOverrides,
    getPendingOverrides, getAllOverrides,
};
//# sourceMappingURL=override-ledger.js.map