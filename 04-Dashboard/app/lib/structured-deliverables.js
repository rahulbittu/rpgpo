"use strict";
// GPO Structured Deliverables — Schema, normalization, and validation per engine
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliverableSchema = getDeliverableSchema;
exports.normalizeDeliverable = normalizeDeliverable;
exports.validateDeliverable = validateDeliverable;
exports.listMissingFields = listMissingFields;
exports.computeDeliverableDiff = computeDeliverableDiff;
/** Engine to deliverable kind mapping */
const ENGINE_KIND_MAP = {
    newsroom: 'newsroom', shopping: 'shopping', startup: 'code_change', legal: 'document',
    screenwriting: 'creative_draft', music: 'creative_draft', calendar: 'schedule',
    chief_of_staff: 'action_plan', career: 'document', health: 'action_plan',
    finance: 'analysis', travel: 'action_plan', research: 'recommendation',
    home: 'recommendation', communications: 'document',
};
/** Required fields per kind */
const KIND_FIELDS = {
    newsroom: ['rankedItems'], shopping: ['items', 'comparisonKeys'], code_change: ['diffs'],
    document: ['sections'], recommendation: ['recommendations'], schedule: ['events'],
    creative_draft: ['artifacts'], analysis: ['findings'], action_plan: ['steps'],
};
/** Get deliverable schema for an engine */
function getDeliverableSchema(engineId) {
    const kind = ENGINE_KIND_MAP[engineId] || 'document';
    return { kind, fields: KIND_FIELDS[kind] || ['sections'] };
}
/** Normalize raw input into a StructuredDeliverable */
function normalizeDeliverable(engineId, input) {
    const schema = getDeliverableSchema(engineId);
    const base = { engineId, title: '', generatedAt: new Date().toISOString() };
    if (typeof input === 'object' && input !== null && 'kind' in input) {
        return input;
    }
    // Create empty scaffold based on kind
    switch (schema.kind) {
        case 'newsroom': return { ...base, kind: 'newsroom', rankedItems: [] };
        case 'shopping': return { ...base, kind: 'shopping', items: [], comparisonKeys: [] };
        case 'code_change': return { ...base, kind: 'code_change', diffs: [] };
        case 'document': return { ...base, kind: 'document', sections: [] };
        case 'recommendation': return { ...base, kind: 'recommendation', recommendations: [] };
        case 'schedule': return { ...base, kind: 'schedule', events: [] };
        case 'creative_draft': return { ...base, kind: 'creative_draft', artifacts: [] };
        case 'analysis': return { ...base, kind: 'analysis', findings: [] };
        case 'action_plan': return { ...base, kind: 'action_plan', steps: [] };
        default: return { ...base, kind: 'document', sections: [] };
    }
}
/** Validate a deliverable against its engine contract */
function validateDeliverable(engineId, d) {
    const missing = listMissingFields(engineId, d);
    if (missing.length === 0)
        return { status: 'pass', missingFields: [] };
    if (missing.length <= 2)
        return { status: 'soft_fail', missingFields: missing, suggestions: missing.map(f => `Populate ${f} from subtask outputs`) };
    return { status: 'hard_fail', missingFields: missing, details: missing.map(f => ({ field: f, message: `Required field "${f}" is empty or missing` })) };
}
/** List missing required fields */
function listMissingFields(engineId, d) {
    const schema = getDeliverableSchema(engineId);
    const missing = [];
    const obj = d;
    for (const field of schema.fields) {
        const val = obj[field];
        if (val === undefined || val === null) {
            missing.push(field);
            continue;
        }
        if (Array.isArray(val) && val.length === 0) {
            missing.push(field);
            continue;
        }
    }
    // Check contract-level required fields too
    try {
        const oc = require('./output-contracts');
        const contract = oc.getContract(engineId);
        if (contract) {
            for (const rf of contract.required_fields) {
                const schemaField = schema.fields.find(f => f.toLowerCase().includes(rf.replace(/_/g, '').toLowerCase()));
                if (!schemaField && !missing.includes(rf)) {
                    // Check if concept is represented in the deliverable content
                    const allText = JSON.stringify(d).toLowerCase();
                    if (!allText.includes(rf.replace(/_/g, ' ')))
                        missing.push(rf);
                }
            }
        }
    }
    catch { /* */ }
    return missing;
}
/** Compute diff between two deliverables */
function computeDeliverableDiff(prev, next) {
    if (!prev)
        return { changed: Object.keys(next).filter(k => k !== 'kind' && k !== 'engineId' && k !== 'generatedAt') };
    const changed = [];
    const p = prev;
    const n = next;
    for (const key of Object.keys(n)) {
        if (JSON.stringify(p[key]) !== JSON.stringify(n[key]))
            changed.push(key);
    }
    return { changed };
}
module.exports = { getDeliverableSchema, normalizeDeliverable, validateDeliverable, listMissingFields, computeDeliverableDiff };
//# sourceMappingURL=structured-deliverables.js.map