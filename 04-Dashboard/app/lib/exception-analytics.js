"use strict";
// GPO Exception Analytics — Aggregates governance exceptions across the system
// Analyzes overrides, enforcement blocks, promotion blocks, simulation failures,
// readiness shortfalls, escalations, and review failures.
Object.defineProperty(exports, "__esModule", { value: true });
exports.harvestExceptions = harvestExceptions;
exports.aggregate = aggregate;
const fs = require('fs');
const path = require('path');
const EVENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'exception-events.json');
function uid() { return 'ex_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Event Collection — harvest from existing modules
// ═══════════════════════════════════════════
/** Harvest exception events from all governance modules */
function harvestExceptions() {
    const events = [];
    const now = new Date().toISOString();
    // Overrides
    try {
        const ol = require('./override-ledger');
        for (const o of ol.getAllOverrides()) {
            events.push({ event_id: uid(), category: 'override', severity: 'medium', override_type: o.override_type, action: o.action, detail: `Override ${o.status}: ${o.reason}`, source_id: o.override_id, created_at: o.created_at });
        }
    }
    catch { /* */ }
    // Enforcement decisions (blocks only)
    try {
        const ee = require('./enforcement-engine');
        // Read decisions file directly since getDecisionsForEntity needs entity
        const decisionsFile = path.resolve(__dirname, '..', '..', 'state', 'enforcement-decisions.json');
        const decisions = readJson(decisionsFile, []);
        for (const d of decisions.filter((x) => x.level !== 'allow')) {
            events.push({ event_id: uid(), category: 'enforcement_block', severity: d.level === 'hard_block' ? 'critical' : 'high', lane: d.lane, action: d.action, detail: d.blockers?.join('; ') || d.warnings?.join('; ') || 'Enforcement triggered', source_id: d.decision_id, created_at: d.created_at });
        }
    }
    catch { /* */ }
    // Escalation events
    try {
        const eg = require('./escalation-governance');
        for (const e of eg.getAllEvents()) {
            events.push({ event_id: uid(), category: 'escalation', severity: e.action === 'pause_execution' ? 'high' : 'medium', detail: e.detail, source_id: e.event_id, created_at: e.created_at });
        }
    }
    catch { /* */ }
    // Simulation failures
    try {
        const ps = require('./policy-simulation');
        for (const r of ps.getAllResults().filter((x) => x.outcome === 'block')) {
            events.push({ event_id: uid(), category: 'simulation_failure', severity: 'medium', lane: r.lane, detail: r.summary, source_id: r.result_id, created_at: r.created_at });
        }
    }
    catch { /* */ }
    // Persist harvested events
    const existing = readJson(EVENTS_FILE, []);
    const existingSources = new Set(existing.map(e => e.source_id));
    const newEvents = events.filter(e => !existingSources.has(e.source_id));
    if (newEvents.length > 0) {
        existing.unshift(...newEvents);
        if (existing.length > 1000)
            existing.length = 1000;
        writeJson(EVENTS_FILE, existing);
    }
    return readJson(EVENTS_FILE, []);
}
// ═══════════════════════════════════════════
// Aggregation
// ═══════════════════════════════════════════
/** Aggregate exception events by scope */
function aggregate(opts) {
    let events = harvestExceptions();
    const windowDays = opts?.days || 30;
    const cutoff = new Date(Date.now() - windowDays * 86400000).toISOString();
    events = events.filter(e => e.created_at >= cutoff);
    if (opts?.domain)
        events = events.filter(e => e.domain === opts.domain);
    if (opts?.project_id)
        events = events.filter(e => e.project_id === opts.project_id);
    if (opts?.provider_id)
        events = events.filter(e => e.provider_id === opts.provider_id);
    const byCat = {};
    const bySev = {};
    const byLane = {};
    const byDomain = {};
    const byProvider = {};
    for (const e of events) {
        byCat[e.category] = (byCat[e.category] || 0) + 1;
        bySev[e.severity] = (bySev[e.severity] || 0) + 1;
        if (e.lane)
            byLane[e.lane] = (byLane[e.lane] || 0) + 1;
        if (e.domain)
            byDomain[e.domain] = (byDomain[e.domain] || 0) + 1;
        if (e.provider_id)
            byProvider[e.provider_id] = (byProvider[e.provider_id] || 0) + 1;
    }
    // Hotspots: top categories/domains by count
    const hotspots = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k}: ${v}`);
    if (Object.keys(byDomain).length) {
        const topDomain = Object.entries(byDomain).sort((a, b) => b[1] - a[1])[0];
        hotspots.push(`domain ${topDomain[0]}: ${topDomain[1]}`);
    }
    // Trends
    const trends = [];
    const overrideCount = byCat['override'] || 0;
    const blockCount = byCat['enforcement_block'] || 0;
    if (overrideCount > 3)
        trends.push(`High override rate: ${overrideCount} in ${windowDays}d`);
    if (blockCount > 2)
        trends.push(`Repeated enforcement blocks: ${blockCount}`);
    return {
        scope: opts?.domain || opts?.project_id || 'global',
        total: events.length,
        by_category: byCat,
        by_severity: bySev,
        by_lane: byLane,
        by_domain: byDomain,
        by_provider: byProvider,
        hotspots,
        trends,
        window_start: cutoff,
        window_end: new Date().toISOString(),
    };
}
module.exports = { harvestExceptions, aggregate };
//# sourceMappingURL=exception-analytics.js.map