"use strict";
// GPO Cost Optimizer — Analyze spending patterns and suggest optimizations
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCostInsights = getCostInsights;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
function getCostInsights() {
    const insights = [];
    const costs = readJson(path.join(STATE_DIR, 'costs.json'), []);
    if (costs.length === 0)
        return insights;
    // Group by provider
    const byProvider = {};
    for (const c of costs) {
        const p = c.provider || 'unknown';
        if (!byProvider[p])
            byProvider[p] = { total: 0, count: 0 };
        byProvider[p].total += c.cost || c.totalCost || 0;
        byProvider[p].count++;
    }
    // Check if one provider dominates
    const totalCost = Object.values(byProvider).reduce((s, p) => s + p.total, 0);
    for (const [provider, data] of Object.entries(byProvider)) {
        if (data.total > totalCost * 0.7 && Object.keys(byProvider).length > 1) {
            insights.push({
                id: 'ci_provider_concentration',
                type: 'recommendation',
                title: `${provider} accounts for ${((data.total / totalCost) * 100).toFixed(0)}% of spend`,
                description: 'Consider diversifying provider usage to reduce cost concentration risk.',
                impact: 'medium',
                savingsEstimate: data.total * 0.2,
                action: 'Route more tasks to cheaper providers when quality is comparable',
            });
        }
    }
    // Check for expensive tasks
    const recentCosts = costs.slice(-50);
    const avgCostPerCall = totalCost / Math.max(1, costs.length);
    const expensiveCalls = recentCosts.filter((c) => (c.cost || c.totalCost || 0) > avgCostPerCall * 3);
    if (expensiveCalls.length > 3) {
        insights.push({
            id: 'ci_expensive_calls',
            type: 'alert',
            title: `${expensiveCalls.length} expensive calls detected (3x+ average)`,
            description: 'Some calls are significantly more expensive than average. Consider optimizing prompts or using cheaper models.',
            impact: 'high',
            action: 'Review prompt length and model selection for high-cost tasks',
        });
    }
    // Daily spending trend
    const dayTotals = {};
    for (const c of costs) {
        const day = new Date(c.timestamp || c.created_at || '').toISOString().slice(0, 10);
        if (day && day !== 'Inva')
            dayTotals[day] = (dayTotals[day] || 0) + (c.cost || c.totalCost || 0);
    }
    const days = Object.entries(dayTotals).sort(([a], [b]) => a.localeCompare(b));
    if (days.length >= 3) {
        const recent3 = days.slice(-3).map(([, v]) => v);
        const avgRecent = recent3.reduce((s, v) => s + v, 0) / 3;
        const older = days.slice(0, -3).map(([, v]) => v);
        const avgOlder = older.length > 0 ? older.reduce((s, v) => s + v, 0) / older.length : avgRecent;
        if (avgRecent > avgOlder * 1.5) {
            insights.push({
                id: 'ci_spending_increase',
                type: 'trend',
                title: 'Daily spending increased 50%+ recently',
                description: `Recent daily average: $${avgRecent.toFixed(4)} vs prior: $${avgOlder.toFixed(4)}`,
                impact: 'medium',
                action: 'Review task volume and model choices',
            });
        }
    }
    // Gemini vs OpenAI cost comparison
    if (byProvider.openai && byProvider.gemini) {
        const openaiAvg = byProvider.openai.total / Math.max(1, byProvider.openai.count);
        const geminiAvg = byProvider.gemini.total / Math.max(1, byProvider.gemini.count);
        if (openaiAvg > geminiAvg * 3 && byProvider.openai.count > 10) {
            insights.push({
                id: 'ci_model_savings',
                type: 'recommendation',
                title: 'OpenAI costs 3x+ more per call than Gemini',
                description: 'For tasks where quality is comparable, routing to Gemini could save significantly.',
                impact: 'high',
                savingsEstimate: (byProvider.openai.total - byProvider.openai.total / 3) * 0.5,
                action: 'Use Gemini for strategy/analysis tasks where it performs well',
            });
        }
    }
    return insights;
}
function readJson(f, fb) {
    try {
        if (fs.existsSync(f))
            return JSON.parse(fs.readFileSync(f, 'utf-8'));
    }
    catch { /* */ }
    return fb;
}
module.exports = { getCostInsights };
//# sourceMappingURL=cost-optimizer.js.map