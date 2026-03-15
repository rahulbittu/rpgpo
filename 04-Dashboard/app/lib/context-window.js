"use strict";
// GPO Context Window Manager — Optimize context injection for token efficiency
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOptimizedContext = buildOptimizedContext;
function buildOptimizedContext(rawRequest, domain, maxTokens = 3000) {
    const sections = [];
    const contextParts = [];
    // 1. Operator identity (high priority, small)
    const opContext = getOperatorContext();
    if (opContext) {
        const tokens = estimateTokens(opContext);
        sections.push({ name: 'Operator Profile', tokens, priority: 10, included: true });
        contextParts.push(opContext);
    }
    // 2. Domain context (high priority)
    const domainCtx = getDomainContext(domain);
    if (domainCtx) {
        const tokens = estimateTokens(domainCtx);
        sections.push({ name: 'Domain Context', tokens, priority: 9, included: true });
        contextParts.push(domainCtx);
    }
    // 3. Prior knowledge (medium priority)
    const knowledge = getKnowledgeContext(domain, rawRequest);
    if (knowledge) {
        const tokens = estimateTokens(knowledge);
        sections.push({ name: 'Prior Knowledge', tokens, priority: 7, included: tokens < maxTokens / 3 });
        if (tokens < maxTokens / 3)
            contextParts.push(knowledge);
    }
    // 4. Recent decisions (lower priority)
    const decisions = getRecentDecisions(domain);
    if (decisions) {
        const tokens = estimateTokens(decisions);
        sections.push({ name: 'Recent Decisions', tokens, priority: 5, included: false });
    }
    const usedTokens = contextParts.reduce((s, p) => s + estimateTokens(p), 0);
    // Trim if over budget
    let finalContext = contextParts.join('\n\n');
    if (usedTokens > maxTokens) {
        finalContext = finalContext.slice(0, maxTokens * 4); // rough char-to-token ratio
        sections.forEach(s => { if (s.priority < 7)
            s.included = false; });
    }
    return {
        context: finalContext,
        budget: { maxTokens, usedTokens: Math.min(usedTokens, maxTokens), sections },
    };
}
function estimateTokens(text) {
    return Math.ceil(text.length / 4); // rough estimate
}
function getOperatorContext() {
    try {
        const fs = require('fs');
        const path = require('path');
        const file = path.resolve(__dirname, '..', '..', 'state', 'context', 'operator-profile.json');
        if (!fs.existsSync(file))
            return null;
        const p = JSON.parse(fs.readFileSync(file, 'utf-8'));
        return `Operator: ${p.name} (${p.professional_context?.role || 'Operator'}). Priorities: ${(p.recurring_priorities || []).slice(0, 3).join('; ')}. Style: ${p.output_preferences?.style || 'Specific and actionable'}.`;
    }
    catch {
        return null;
    }
}
function getDomainContext(domain) {
    try {
        const fs = require('fs');
        const path = require('path');
        const file = path.resolve(__dirname, '..', '..', 'state', 'context', 'missions', domain, 'context.json');
        if (!fs.existsSync(file))
            return null;
        const ctx = JSON.parse(fs.readFileSync(file, 'utf-8'));
        return ctx.context_summary || null;
    }
    catch {
        return null;
    }
}
function getKnowledgeContext(domain, request) {
    try {
        const ce = require('./context-enrichment');
        const knowledge = ce.getRelevantKnowledge(request, domain);
        return knowledge || null;
    }
    catch {
        return null;
    }
}
function getRecentDecisions(domain) {
    try {
        const fs = require('fs');
        const path = require('path');
        const file = path.resolve(__dirname, '..', '..', 'state', 'context', 'missions', domain, 'context.json');
        if (!fs.existsSync(file))
            return null;
        const ctx = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (!ctx.recent_decisions?.length)
            return null;
        return ctx.recent_decisions.slice(0, 2).map((d) => d.title || d.decision || '').join('; ');
    }
    catch {
        return null;
    }
}
module.exports = { buildOptimizedContext };
