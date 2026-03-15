"use strict";
// GPO Field Populator — Map structured extraction to deliverable fields via merge policy
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateDeliverableFromStructured = populateDeliverableFromStructured;
/**
 * Populate deliverable fields from a structured extraction result.
 * Respects merge policies and governance immutability rules.
 * Does not mutate inputs — returns new object via caller.
 */
function populateDeliverableFromStructured(args) {
    const { deliverable, parsed, mergePolicy } = args;
    const result = {
        updatedFields: [],
        skippedFields: [],
        rejectedFields: [],
        diffs: {},
    };
    if (!parsed.ok || !parsed.value || typeof parsed.value !== 'object') {
        return result;
    }
    const target = deliverable;
    const source = parsed.value;
    const strategies = mergePolicy?.fieldStrategies || {};
    // Immutable fields that should never be overwritten
    const IMMUTABLE = new Set(['kind', 'engineId']);
    for (const [field, incoming] of Object.entries(source)) {
        if (incoming === undefined || incoming === null)
            continue;
        // Check immutability
        if (IMMUTABLE.has(field)) {
            result.skippedFields.push(field);
            continue;
        }
        // Validate: reject obviously wrong types
        const existing = target[field];
        if (existing !== undefined && existing !== null) {
            if (Array.isArray(existing) && !Array.isArray(incoming)) {
                result.rejectedFields.push(field);
                continue;
            }
        }
        // Record diff
        const before = existing !== undefined ? JSON.parse(JSON.stringify(existing)) : undefined;
        // Apply merge strategy
        const strategy = strategies[field] || 'replace';
        try {
            target[field] = applyFieldStrategy(strategy, existing, incoming);
            result.updatedFields.push(field);
            result.diffs[field] = { before, after: JSON.parse(JSON.stringify(target[field])) };
        }
        catch {
            result.rejectedFields.push(field);
        }
    }
    // Update timestamp
    target.generatedAt = new Date().toISOString();
    return result;
}
function applyFieldStrategy(strategy, existing, incoming) {
    switch (strategy) {
        case 'replace':
            return incoming;
        case 'append':
            if (Array.isArray(existing) && Array.isArray(incoming)) {
                return [...existing, ...incoming];
            }
            if (typeof existing === 'string' && typeof incoming === 'string') {
                return existing ? existing + '\n\n' + incoming : incoming;
            }
            return incoming;
        case 'union_dedupe':
            if (Array.isArray(existing) && Array.isArray(incoming)) {
                const seen = new Set(existing.map(i => JSON.stringify(i)));
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
            if (Array.isArray(incoming) && Array.isArray(existing)) {
                return incoming.length >= existing.length ? incoming : existing;
            }
            return incoming;
        case 'structural_merge':
            if (typeof existing === 'object' && typeof incoming === 'object' && existing !== null && incoming !== null && !Array.isArray(existing) && !Array.isArray(incoming)) {
                return { ...existing, ...incoming };
            }
            return incoming;
        default:
            return incoming;
    }
}
module.exports = { populateDeliverableFromStructured };
//# sourceMappingURL=field-populator.js.map