"use strict";
// GPO Release Provider Gating — Provider governance checks before release approval
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateProviderGating = evaluateProviderGating;
exports.canReleaseProceed = canReleaseProceed;
function uid() { return 'rpg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
/** Evaluate provider health gates for a release */
function evaluateProviderGating(releaseId) {
    let providerHealth = 'unknown';
    let costOk = true;
    let latencyOk = true;
    let incidents = 0;
    // Check provider reliability scores
    try {
        const prs = require('./provider-reliability-scoring');
        const scores = prs.getScores();
        const unhealthy = scores.filter(s => s.reliability < 0.8);
        providerHealth = unhealthy.length === 0 ? 'all_healthy' : `${unhealthy.length}/${scores.length} degraded`;
    }
    catch {
        providerHealth = 'no_data';
    }
    // Check cost governance
    try {
        const clg = require('./cost-latency-governance');
        const cs = clg.getCostStatus();
        costOk = !cs.over_budget;
    }
    catch { /* assume ok */ }
    // Check latency governance
    try {
        const clg = require('./cost-latency-governance');
        const ls = clg.getLatencyStatus();
        latencyOk = !ls.breaching_sla;
    }
    catch { /* assume ok */ }
    // Check active incidents
    try {
        const inc = require('./incident-response');
        const active = inc.getActiveIncidents();
        incidents = active.filter(i => i.status === 'active' || i.status === 'investigating').length;
    }
    catch { /* */ }
    let outcome = 'clear';
    const details = [];
    if (incidents > 0) {
        outcome = 'blocked';
        details.push(`${incidents} active incident(s)`);
    }
    if (!costOk) {
        outcome = outcome === 'blocked' ? 'blocked' : 'warning';
        details.push('Cost budget exceeded');
    }
    if (!latencyOk) {
        outcome = outcome === 'blocked' ? 'blocked' : 'warning';
        details.push('SLA latency breach');
    }
    if (providerHealth.includes('degraded')) {
        outcome = outcome === 'blocked' ? 'blocked' : 'warning';
        details.push(`Provider health: ${providerHealth}`);
    }
    return {
        decision_id: uid(),
        release_id: releaseId,
        provider_health: providerHealth,
        cost_ok: costOk,
        latency_ok: latencyOk,
        incidents,
        outcome,
        detail: details.length ? details.join('; ') : 'All provider gates clear',
        created_at: new Date().toISOString(),
    };
}
/** Quick check if any release can proceed */
function canReleaseProceed(releaseId) {
    const decision = evaluateProviderGating(releaseId);
    return decision.outcome !== 'blocked';
}
module.exports = { evaluateProviderGating, canReleaseProceed };
//# sourceMappingURL=release-provider-gating.js.map