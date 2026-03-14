"use strict";
// GPO Override Operations Center — Unified override management
// Surfaces pending, stale, expired, consumed overrides with drill-down.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpsView = getOpsView;
exports.getStaleOverrides = getStaleOverrides;
exports.consumeOverride = consumeOverride;
exports.getConsumptionRecords = getConsumptionRecords;
const fs = require('fs');
const path = require('path');
const CONSUMPTION_FILE = path.resolve(__dirname, '..', '..', 'state', 'override-consumption.json');
function uid() { return 'oc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Build override operations view */
function getOpsView(filters) {
    let overrides = [];
    try {
        const ol = require('./override-ledger');
        overrides = ol.getAllOverrides();
    }
    catch { /* */ }
    const now = new Date().toISOString();
    const staleDays = 7;
    const staleCutoff = new Date(Date.now() - staleDays * 86400000).toISOString();
    const pending = overrides.filter(o => o.status === 'pending');
    const approved = overrides.filter(o => o.status === 'approved');
    const rejected = overrides.filter(o => o.status === 'rejected');
    const expired = overrides.filter(o => o.status === 'expired' || (o.expires_at && o.expires_at < now && o.status === 'approved'));
    const consumed = overrides.filter(o => o.status === 'consumed');
    const stale = approved.filter(o => o.created_at < staleCutoff && o.status !== 'consumed');
    const byType = {};
    const byLane = {};
    for (const o of overrides) {
        byType[o.override_type] = (byType[o.override_type] || 0) + 1;
    }
    const hotspots = [];
    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    if (topType && topType[1] > 2)
        hotspots.push(`${topType[0]}: ${topType[1]} overrides`);
    if (stale.length > 0)
        hotspots.push(`${stale.length} stale override(s) older than ${staleDays}d`);
    if (pending.length > 3)
        hotspots.push(`${pending.length} pending overrides — review backlog`);
    return {
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        expired: expired.length,
        consumed: consumed.length,
        stale: stale.length,
        total: overrides.length,
        by_type: byType,
        by_lane: byLane,
        hotspots,
    };
}
/** Get stale overrides (approved but old and not consumed) */
function getStaleOverrides(days = 7) {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    try {
        const ol = require('./override-ledger');
        return ol.getAllOverrides().filter(o => o.status === 'approved' && o.created_at < cutoff);
    }
    catch {
        return [];
    }
}
/** Consume an override (mark as used to clear a decision) */
function consumeOverride(overrideId, decisionId, graphId) {
    // Mark override as consumed
    try {
        const ol = require('./override-ledger');
        const ledgerFile = path.resolve(__dirname, '..', '..', 'state', 'override-ledger.json');
        const all = ol.getAllOverrides();
        const idx = all.findIndex((o) => o.override_id === overrideId);
        if (idx === -1)
            return null;
        if (all[idx].status !== 'approved')
            return null;
        all[idx].status = 'consumed';
        writeJson(ledgerFile, all);
    }
    catch {
        return null;
    }
    // Record consumption
    const record = {
        consumption_id: uid(),
        override_id: overrideId,
        decision_id: decisionId,
        graph_id: graphId,
        consumed_at: new Date().toISOString(),
    };
    const records = readJson(CONSUMPTION_FILE, []);
    records.unshift(record);
    if (records.length > 300)
        records.length = 300;
    writeJson(CONSUMPTION_FILE, records);
    return record;
}
function getConsumptionRecords() {
    return readJson(CONSUMPTION_FILE, []);
}
module.exports = {
    getOpsView, getStaleOverrides,
    consumeOverride, getConsumptionRecords,
};
//# sourceMappingURL=override-operations.js.map