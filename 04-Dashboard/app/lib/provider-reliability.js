"use strict";
// GPO Provider Reliability Scoring — Health classification from governance evidence
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeReliability = computeReliability;
exports.recordIncident = recordIncident;
exports.getIncidentsForProvider = getIncidentsForProvider;
exports.getAllIncidents = getAllIncidents;
exports.getSnapshots = getSnapshots;
const fs = require('fs');
const path = require('path');
const SNAPSHOTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-reliability.json');
const INCIDENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-incidents.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Compute reliability snapshot for a provider */
function computeReliability(providerId, domain, projectId, windowDays = 30) {
    const providers = providerId ? [providerId] : ['claude', 'openai', 'gemini', 'perplexity'];
    const snapshots = [];
    for (const pid of providers) {
        const metrics = { success_count: 0, failure_count: 0, retry_count: 0, override_linked_count: 0, escalation_linked_count: 0, review_failure_correlation: 0, promotion_block_correlation: 0, incident_count: 0 };
        // Gather evidence from provider fits
        try {
            const pr = require('./provider-registry');
            const fits = pr.getFitsForProvider(pid);
            for (const f of fits) {
                metrics.success_count += f.success_runs;
                metrics.failure_count += f.failure_runs;
            }
        }
        catch { /* */ }
        // Gather incidents
        const incidents = getIncidentsForProvider(pid);
        metrics.incident_count = incidents.length;
        // Gather override/escalation correlations from exception analytics
        try {
            const ea = require('./exception-analytics');
            const agg = ea.aggregate({ provider_id: pid, days: windowDays });
            metrics.override_linked_count = agg.by_category['override'] || 0;
            metrics.escalation_linked_count = agg.by_category['escalation'] || 0;
        }
        catch { /* */ }
        const total = metrics.success_count + metrics.failure_count;
        const successRate = total > 0 ? Math.round((metrics.success_count / total) * 100) : 100;
        let health = 'healthy';
        if (successRate < 50 || metrics.incident_count >= 3)
            health = 'unstable';
        else if (successRate < 70 || metrics.incident_count >= 2)
            health = 'degraded';
        else if (successRate < 85 || metrics.incident_count >= 1)
            health = 'watch';
        const snapshot = {
            snapshot_id: uid('prs'), provider_id: pid, health, success_rate: successRate,
            metrics, window_days: windowDays, created_at: new Date().toISOString(),
        };
        snapshots.push(snapshot);
    }
    // Persist
    const existing = readJson(SNAPSHOTS_FILE, []);
    existing.unshift(...snapshots);
    if (existing.length > 200)
        existing.length = 200;
    writeJson(SNAPSHOTS_FILE, existing);
    return snapshots;
}
/** Record a provider incident */
function recordIncident(opts) {
    const incidents = readJson(INCIDENTS_FILE, []);
    const incident = {
        incident_id: uid('pi'), provider_id: opts.provider_id,
        incident_type: opts.incident_type, severity: opts.severity || 'medium',
        detail: opts.detail, domain: opts.domain, project_id: opts.project_id,
        resolved: false, created_at: new Date().toISOString(),
    };
    incidents.unshift(incident);
    if (incidents.length > 200)
        incidents.length = 200;
    writeJson(INCIDENTS_FILE, incidents);
    return incident;
}
function getIncidentsForProvider(providerId) {
    return readJson(INCIDENTS_FILE, []).filter(i => i.provider_id === providerId);
}
function getAllIncidents() {
    return readJson(INCIDENTS_FILE, []);
}
function getSnapshots(providerId) {
    const all = readJson(SNAPSHOTS_FILE, []);
    return providerId ? all.filter(s => s.provider_id === providerId) : all;
}
module.exports = { computeReliability, recordIncident, getIncidentsForProvider, getAllIncidents, getSnapshots };
//# sourceMappingURL=provider-reliability.js.map