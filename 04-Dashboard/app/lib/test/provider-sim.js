"use strict";
// GPO Provider Simulator — Deterministic, contract-aware simulated AI provider
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProviderSim = createProviderSim;
const crypto = require('crypto');
function seededRng(seed) {
    let s = seed;
    return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
    };
}
function createProviderSim(opts) {
    const state = { callCount: 0, rng: seededRng(opts.seed) };
    const behavior = opts.behavior || {};
    async function callProvider(provider, schemaId, prompt) {
        state.callCount++;
        const rand = state.rng();
        // Simulate latency
        const minLat = behavior.minLatencyMs || 50;
        const maxLat = behavior.maxLatencyMs || 500;
        const latency = minLat + rand * (maxLat - minLat);
        // Simulate errors
        if (behavior.errorRate && rand < behavior.errorRate) {
            throw new Error(`SimulatedProviderError: ${provider} call ${state.callCount} failed (seed=${opts.seed})`);
        }
        // Simulate slow
        if (behavior.slowRate && state.rng() < behavior.slowRate) {
            await new Promise(r => setTimeout(r, Math.min(latency * 3, 2000)));
        }
        // Simulate invalid JSON
        if (behavior.invalidJsonRate && state.rng() < behavior.invalidJsonRate) {
            return { text: 'This is not valid JSON at all. Sorry!', tokensIn: 100, tokensOut: 50, latencyMs: latency };
        }
        // Generate contract-conforming output
        const output = generateContractOutput(schemaId, state.rng);
        return { text: JSON.stringify(output), tokensIn: 200 + Math.floor(rand * 300), tokensOut: 100 + Math.floor(rand * 200), latencyMs: latency };
    }
    return {
        callProvider,
        getCallCount: () => state.callCount,
        reset: () => { state.callCount = 0; state.rng = seededRng(opts.seed); },
    };
}
function generateContractOutput(schemaId, rng) {
    switch (schemaId) {
        case 'topranker.leaderboard.v1':
            return {
                entries: Array.from({ length: 5 }, (_, i) => ({
                    businessId: `biz_sim_${i + 1}`, name: `Simulated Business ${i + 1}`,
                    rank: i + 1, score: 95 - i * 5, confidence: 0.9 - i * 0.05,
                    city: 'Austin', category: 'Coffee', verificationStatus: 'verified',
                    signals: { reviews: 100 + Math.floor(rng() * 200), avgRating: 4.0 + rng(), recencyBias: 0.8, wilsonScore: 0.85, volumeWeight: 0.8 },
                    rationale: `Simulated ranking rationale for position ${i + 1}`,
                    computedAt: new Date().toISOString(),
                })),
                evidence: ['Simulated Wilson score computation'],
            };
        case 'topranker.scorecard.v1':
            return { scorecards: [{ businessId: 'biz_sim_1', name: 'Sim Business', kpis: { trust: 0.9, responsiveness: 0.8, satisfaction: 0.85, consistency: 0.88 }, riskFlags: { suspiciousActivity: false, conflictingInfo: false, lowVolume: false }, notes: ['Simulated'], computedAt: new Date().toISOString() }], evidence: ['Simulated'] };
        case 'topranker.review-aggregation.v1':
            return { aggregations: [{ businessId: 'biz_sim_1', period: { from: '2026-01-01', to: '2026-03-01', windowDays: 60 }, sources: [{ source: 'google', count: 50, avgRating: 4.5 }], sentiment: { positive: 40, neutral: 8, negative: 2 }, sampleSnippets: [{ text: 'Great place!', sentiment: 'positive', source: 'google', capturedAt: new Date().toISOString() }], aggregationMethod: 'wilson', computedAt: new Date().toISOString() }], evidence: ['Simulated'] };
        default:
            // Generic document output
            return { sections: [{ heading: 'Simulated Output', content: `Generated output for schema ${schemaId}` }], title: 'Simulated Deliverable' };
    }
}
module.exports = { createProviderSim };
//# sourceMappingURL=provider-sim.js.map