"use strict";
// GPO Provider Router — Smart provider selection using learning data + capabilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectProvider = selectProvider;
function selectProvider(domain, taskKind) {
    // Check learning store for historical best
    try {
        const ls = require('./learning-store');
        const best = ls.getBestProvider({ engineId: domain, taskKind, contractName: domain });
        if (best && best.score > 0.6) {
            return { providerId: best.providerId, reason: `Learning: best historical performance (score: ${best.score.toFixed(2)})`, confidence: best.score, alternates: [] };
        }
    }
    catch { /* */ }
    // Default routing by task kind
    const defaults = {
        research: { provider: 'perplexity', reason: 'Perplexity has web search for current data' },
        audit: { provider: 'perplexity', reason: 'Research-first audit via web search' },
        strategy: { provider: 'gemini', reason: 'Gemini excels at strategic analysis' },
        decide: { provider: 'gemini', reason: 'Gemini for decision frameworks' },
        implement: { provider: 'claude', reason: 'Claude for code implementation' },
        report: { provider: 'openai', reason: 'OpenAI for synthesis and report writing' },
        chief: { provider: 'openai', reason: 'OpenAI for executive synthesis' },
        builder: { provider: 'claude', reason: 'Claude for code execution' },
    };
    const match = defaults[taskKind] || defaults.report;
    return {
        providerId: match.provider,
        reason: match.reason,
        confidence: 0.7,
        alternates: Object.entries(defaults).filter(([k]) => k !== taskKind).slice(0, 2).map(([, v]) => ({ providerId: v.provider, score: 0.5 })),
    };
}
module.exports = { selectProvider };
