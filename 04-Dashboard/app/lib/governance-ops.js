"use strict";
// GPO Governance Operations Console — Unified operational view
// Aggregates health, hotspots, trends, watchlist across all governance modules.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpsView = getOpsView;
exports.saveFilter = saveFilter;
exports.getFilters = getFilters;
exports.getWatchlist = getWatchlist;
exports.addToWatchlist = addToWatchlist;
exports.toggleWatchlistEntry = toggleWatchlistEntry;
const fs = require('fs');
const path = require('path');
const FILTERS_FILE = path.resolve(__dirname, '..', '..', 'state', 'governance-filters.json');
const WATCHLIST_FILE = path.resolve(__dirname, '..', '..', 'state', 'governance-watchlist.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Ops View
// ═══════════════════════════════════════════
/** Build unified governance ops view */
function getOpsView(opts) {
    // Health
    let health = { snapshot_id: '', scope_level: 'global', scope_id: 'global', exception_count: 0, drift_signal_count: 0, pending_tuning_count: 0, override_rate: 0, enforcement_block_rate: 0, health: 'healthy', summary: 'No data', created_at: new Date().toISOString() };
    try {
        const pt = require('./policy-tuning');
        health = pt.computeHealth('global', opts?.domain || 'global', opts?.domain);
    }
    catch { /* */ }
    // Hotspots
    const hotspots = [];
    try {
        const ea = require('./exception-analytics');
        const agg = ea.aggregate({ domain: opts?.domain, project_id: opts?.project_id, provider_id: opts?.provider_id });
        // Top categories
        for (const [cat, count] of Object.entries(agg.by_category).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
            hotspots.push({ scope: agg.scope, category: cat, count: count, severity: count > 5 ? 'high' : count > 2 ? 'medium' : 'low', trend: 'stable', detail: `${count} ${cat} events` });
        }
    }
    catch { /* */ }
    // Pending counts
    let pendingResolutions = 0;
    try {
        const sdr = require('./scoped-drift-resolution');
        pendingResolutions = sdr.getAllResolutions().filter((r) => r.status === 'open' || r.status === 'approved').length;
    }
    catch { /* */ }
    let pendingTuning = 0;
    try {
        const pt = require('./policy-tuning');
        pendingTuning = pt.getAllRecommendations().filter((r) => r.status === 'pending').length;
    }
    catch { /* */ }
    let pendingOverrides = 0;
    try {
        const ol = require('./override-ledger');
        pendingOverrides = ol.getPendingOverrides().length;
    }
    catch { /* */ }
    let unresolvedEscalations = 0;
    try {
        const eg = require('./escalation-governance');
        unresolvedEscalations = eg.getAllEvents().filter((e) => !e.resolved).length;
    }
    catch { /* */ }
    // Trends (last 7 data points from health snapshots)
    const trends = [];
    try {
        const pt = require('./policy-tuning');
        const snapshots = pt.getHealthSnapshots().slice(0, 7);
        for (const s of snapshots.reverse()) {
            trends.push({ date: s.created_at.slice(0, 10), exceptions: s.exception_count, drift_signals: s.drift_signal_count, overrides: s.override_rate, blocks: s.enforcement_block_rate, health: s.health });
        }
    }
    catch { /* */ }
    // Watchlist
    const watchlist = getWatchlist();
    return { health, hotspots, pending_resolutions: pendingResolutions, pending_tuning: pendingTuning, pending_overrides: pendingOverrides, unresolved_escalations: unresolvedEscalations, trends, watchlist };
}
// ═══════════════════════════════════════════
// Filters
// ═══════════════════════════════════════════
function saveFilter(opts) {
    const filters = readJson(FILTERS_FILE, []);
    const filter = { ...opts, filter_id: uid('gf'), created_at: new Date().toISOString() };
    filters.unshift(filter);
    if (filters.length > 50)
        filters.length = 50;
    writeJson(FILTERS_FILE, filters);
    return filter;
}
function getFilters() { return readJson(FILTERS_FILE, []); }
// ═══════════════════════════════════════════
// Watchlist
// ═══════════════════════════════════════════
function getWatchlist() { return readJson(WATCHLIST_FILE, []); }
function addToWatchlist(scope, reason) {
    const list = getWatchlist();
    const entry = { entry_id: uid('gw'), scope, reason, active: true, created_at: new Date().toISOString() };
    list.unshift(entry);
    if (list.length > 50)
        list.length = 50;
    writeJson(WATCHLIST_FILE, list);
    return entry;
}
function toggleWatchlistEntry(entryId) {
    const list = getWatchlist();
    const idx = list.findIndex(e => e.entry_id === entryId);
    if (idx === -1)
        return null;
    list[idx].active = !list[idx].active;
    writeJson(WATCHLIST_FILE, list);
    return list[idx];
}
module.exports = { getOpsView, saveFilter, getFilters, getWatchlist, addToWatchlist, toggleWatchlistEntry };
//# sourceMappingURL=governance-ops.js.map