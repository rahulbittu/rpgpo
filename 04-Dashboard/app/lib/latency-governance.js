"use strict";
// GPO Latency Governance — Latency-aware provider routing decisions
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatencyProfiles = getLatencyProfiles;
exports.getLatencyProfile = getLatencyProfile;
exports.evaluateLatency = evaluateLatency;
exports.getLatencyDecisions = getLatencyDecisions;
exports.getGovernanceSummary = getGovernanceSummary;
const fs = require('fs');
const path = require('path');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'latency-decisions.json');
function uid() { return 'ld_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Built-in Latency Profiles
// ═══════════════════════════════════════════
const LATENCY_PROFILES = [
    { provider_id: 'claude', avg_latency_ms: 500, p95_latency_ms: 2000, recent_samples: 0, classification: 'fast', updated_at: new Date().toISOString() },
    { provider_id: 'openai', avg_latency_ms: 1500, p95_latency_ms: 5000, recent_samples: 0, classification: 'acceptable', updated_at: new Date().toISOString() },
    { provider_id: 'gemini', avg_latency_ms: 800, p95_latency_ms: 3000, recent_samples: 0, classification: 'fast', updated_at: new Date().toISOString() },
    { provider_id: 'perplexity', avg_latency_ms: 2000, p95_latency_ms: 8000, recent_samples: 0, classification: 'acceptable', updated_at: new Date().toISOString() },
];
function getLatencyProfiles() { return LATENCY_PROFILES; }
function getLatencyProfile(providerId) {
    return LATENCY_PROFILES.find(p => p.provider_id === providerId) || null;
}
// ═══════════════════════════════════════════
// Latency Thresholds by Lane
// ═══════════════════════════════════════════
function getThreshold(lane) {
    switch (lane) {
        case 'dev': return 10000; // 10s
        case 'beta': return 5000; // 5s
        case 'prod': return 3000; // 3s
    }
}
// ═══════════════════════════════════════════
// Latency Evaluation
// ═══════════════════════════════════════════
/** Evaluate latency governance for a provider */
function evaluateLatency(providerId, role, lane, domain, projectId) {
    const profile = getLatencyProfile(providerId);
    const threshold = getThreshold(lane);
    const currentLatency = profile?.avg_latency_ms || 1000;
    let outcome = 'proceed';
    let reason = 'Latency within threshold';
    if (currentLatency > threshold * 2) {
        outcome = lane === 'prod' ? 'block' : 'fallback';
        reason = `Latency ${currentLatency}ms exceeds ${threshold * 2}ms (2x threshold for ${lane})`;
    }
    else if (currentLatency > threshold) {
        outcome = lane === 'prod' ? 'reroute' : 'warn';
        reason = `Latency ${currentLatency}ms exceeds ${threshold}ms threshold for ${lane}`;
    }
    // Local provider (Claude) always fast
    if (providerId === 'claude') {
        outcome = 'proceed';
        reason = 'Local provider — no latency concern';
    }
    const decision = {
        decision_id: uid(), provider_id: providerId, role, lane,
        current_latency_ms: currentLatency, threshold_ms: threshold,
        outcome, reason, created_at: new Date().toISOString(),
    };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    return decision;
}
function getLatencyDecisions(providerId) {
    const all = readJson(DECISIONS_FILE, []);
    return providerId ? all.filter(d => d.provider_id === providerId) : all;
}
// ═══════════════════════════════════════════
// Provider Governance Summary
// ═══════════════════════════════════════════
/** Build unified provider governance summary */
function getGovernanceSummary() {
    const providers = ['claude', 'openai', 'gemini', 'perplexity'];
    const summaries = [];
    for (const pid of providers) {
        let reliability = 'healthy';
        let incidents = 0;
        try {
            const pr = require('./provider-reliability');
            const snaps = pr.getSnapshots(pid);
            if (snaps.length > 0)
                reliability = snaps[0].health;
            incidents = pr.getIncidentsForProvider(pid).length;
        }
        catch { /* */ }
        let costTier = 'medium';
        try {
            const cg = require('./cost-governance');
            const cp = cg.getCostProfile(pid);
            if (cp)
                costTier = cp.cost_tier;
        }
        catch { /* */ }
        const latProfile = getLatencyProfile(pid);
        const latClass = latProfile?.classification || 'acceptable';
        const routing = {
            provider_id: pid,
            reliability_ok: reliability === 'healthy' || reliability === 'watch',
            cost_ok: costTier !== 'high',
            latency_ok: latClass === 'fast' || latClass === 'acceptable',
            overall: 'clear',
        };
        if (!routing.reliability_ok || !routing.cost_ok || !routing.latency_ok) {
            routing.overall = !routing.reliability_ok ? 'blocked' : 'constrained';
            if (!routing.reliability_ok)
                routing.fallback_provider = 'claude';
        }
        summaries.push({
            provider_id: pid, reliability, cost_tier: costTier,
            latency_class: latClass,
            routing, incidents, created_at: new Date().toISOString(),
        });
    }
    return summaries;
}
module.exports = { getLatencyProfiles, getLatencyProfile, evaluateLatency, getLatencyDecisions, getGovernanceSummary };
//# sourceMappingURL=latency-governance.js.map