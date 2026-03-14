"use strict";
// GPO Deliverable Merge — Contract-aware merge of scaffold/fragments into canonical deliverable
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMergePolicy = getMergePolicy;
exports.mergeScaffold = mergeScaffold;
exports.validateMerged = validateMerged;
exports.diff = diff;
exports.getStrategies = getStrategies;
const crypto = require('crypto');
/** Default merge policies per variant */
const DEFAULT_POLICIES = {
    newsroom: { rankedItems: 'union_dedupe', methodology: 'replace', title: 'replace' },
    shopping: { items: 'union_dedupe', comparisonKeys: 'union_dedupe', title: 'replace' },
    code_change: { diffs: 'append', testNotes: 'structural_merge', title: 'replace' },
    document: { sections: 'append', references: 'union_dedupe', title: 'replace' },
    recommendation: { recommendations: 'append', title: 'replace' },
    schedule: { events: 'union_dedupe', title: 'replace' },
    creative_draft: { artifacts: 'append', title: 'replace' },
    analysis: { findings: 'append', charts: 'append', title: 'replace' },
    action_plan: { steps: 'append', risks: 'append', title: 'replace' },
};
/** Get merge policy for a variant */
function getMergePolicy(variant) {
    return { variant: variant, fieldStrategies: DEFAULT_POLICIES[variant] || { title: 'replace' } };
}
/** Merge a scaffold with fragments from subtasks */
function mergeScaffold(base, fragments, policy) {
    const effectivePolicy = policy || getMergePolicy(base.kind);
    const merged = JSON.parse(JSON.stringify(base));
    const fieldsUpdated = [];
    const fieldsSkipped = [];
    const conflicts = [];
    const provenance = {};
    for (const fragment of fragments) {
        for (const [field, value] of Object.entries(fragment.content)) {
            if (value === undefined || value === null)
                continue;
            if (field === 'kind' || field === 'engineId' || field === 'generatedAt')
                continue;
            const strategy = effectivePolicy.fieldStrategies[field] || 'replace';
            const existing = merged[field];
            const fieldHash = computeFieldHash(value);
            // Initialize provenance
            if (!provenance[field])
                provenance[field] = [];
            provenance[field].push({ subtaskId: fragment.subtaskId, stepType: fragment.stepType, fieldHash });
            try {
                merged[field] = applyStrategy(strategy, existing, value, field, conflicts);
                fieldsUpdated.push(field);
            }
            catch {
                fieldsSkipped.push(field);
                conflicts.push({ field, reason: 'Merge failed', resolution: 'Kept existing value' });
            }
        }
    }
    merged.generatedAt = new Date().toISOString();
    return { merged: merged, fieldsUpdated, fieldsSkipped, conflicts, provenance };
}
function applyStrategy(strategy, existing, incoming, field, conflicts) {
    switch (strategy) {
        case 'replace':
            return incoming;
        case 'append':
            if (Array.isArray(existing) && Array.isArray(incoming)) {
                return [...existing, ...incoming];
            }
            if (typeof existing === 'string' && typeof incoming === 'string') {
                return existing + '\n\n' + incoming;
            }
            return incoming;
        case 'union_dedupe':
            if (Array.isArray(existing) && Array.isArray(incoming)) {
                const seen = new Set(existing.map(item => JSON.stringify(item)));
                const merged = [...existing];
                for (const item of incoming) {
                    const key = JSON.stringify(item);
                    if (!seen.has(key)) {
                        merged.push(item);
                        seen.add(key);
                    }
                }
                return merged;
            }
            return incoming;
        case 'pick_best':
            // Prefer incoming if it has more content
            if (Array.isArray(incoming) && Array.isArray(existing)) {
                return incoming.length >= existing.length ? incoming : existing;
            }
            if (typeof incoming === 'string' && typeof existing === 'string') {
                return incoming.length >= existing.length ? incoming : existing;
            }
            return incoming;
        case 'structural_merge':
            if (typeof existing === 'string' && typeof incoming === 'string') {
                if (existing.includes(incoming))
                    return existing;
                if (incoming.includes(existing))
                    return incoming;
                return existing + '\n\n---\n\n' + incoming;
            }
            if (typeof existing === 'object' && typeof incoming === 'object' && existing !== null && incoming !== null) {
                return { ...existing, ...incoming };
            }
            conflicts.push({ field, reason: 'Structural merge not possible', resolution: 'Replaced with incoming' });
            return incoming;
        default:
            return incoming;
    }
}
/** Compute a field hash for provenance tracking */
function computeFieldHash(value) {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
}
/** Validate merged content against contract at merge time */
function validateMerged(engineId, content) {
    const violations = [];
    const warnings = [];
    try {
        const sd = require('./structured-deliverables');
        const missing = sd.listMissingFields(engineId, content);
        for (const f of missing) {
            violations.push({ field: f, message: `Required field "${f}" is empty or missing after merge` });
        }
    }
    catch { /* */ }
    // Variant-specific checks
    const obj = content;
    if (content.kind === 'newsroom') {
        const items = obj.rankedItems;
        if (items && items.length > 0) {
            for (const item of items) {
                if (!item.headline)
                    warnings.push({ field: 'rankedItems[].headline', message: 'Missing headline in ranked item' });
            }
        }
    }
    if (content.kind === 'code_change') {
        const diffs = obj.diffs;
        if (diffs && diffs.length > 0) {
            for (const diff of diffs) {
                if (!diff.filePath)
                    warnings.push({ field: 'diffs[].filePath', message: 'Missing file path in diff' });
            }
        }
    }
    if (content.kind === 'schedule') {
        const events = obj.events;
        if (events && events.length > 0) {
            for (const event of events) {
                if (!event.start || !event.end)
                    warnings.push({ field: 'events[].start/end', message: 'Missing time in schedule event' });
            }
        }
    }
    return { passed: violations.length === 0, violations, warnings };
}
/** Diff two deliverables field by field */
function diff(a, b) {
    const changes = [];
    const aObj = a;
    const bObj = b;
    const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
    for (const key of allKeys) {
        if (key === 'generatedAt')
            continue;
        const aVal = JSON.stringify(aObj[key]);
        const bVal = JSON.stringify(bObj[key]);
        if (aVal !== bVal) {
            changes.push({ path: key, from: aObj[key], to: bObj[key] });
        }
    }
    return changes;
}
/** Get all available merge strategies */
function getStrategies() {
    return [
        { key: 'replace', description: 'Replace existing value with incoming' },
        { key: 'append', description: 'Append incoming to existing array/string' },
        { key: 'union_dedupe', description: 'Union arrays, deduplicate by content' },
        { key: 'pick_best', description: 'Pick whichever has more content' },
        { key: 'structural_merge', description: 'Deep merge objects, concatenate strings with separator' },
    ];
}
module.exports = { getMergePolicy, mergeScaffold, validateMerged, diff, getStrategies };
//# sourceMappingURL=deliverable-merge.js.map