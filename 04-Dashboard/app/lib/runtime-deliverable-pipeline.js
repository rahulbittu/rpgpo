"use strict";
// GPO Runtime Deliverable Pipeline — Wire structured deliverables into live task execution
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTaskStart = onTaskStart;
exports.onSubtaskComplete = onSubtaskComplete;
exports.onTaskComplete = onTaskComplete;
exports.getState = getState;
exports.getSummary = getSummary;
const fs = require('fs');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '..', '..', 'state', 'runtime-deliverable-state.json');
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Hook: Called when a task starts — creates deliverable scaffold from engine contract */
function onTaskStart(taskId, engineId, projectId = 'rpgpo') {
    // Build contract context
    let deliverableId = '';
    try {
        const did = require('./deliverable-id');
        const sd = require('./structured-deliverables');
        const schema = sd.getDeliverableSchema(engineId);
        const key = { projectId, taskId, variant: schema.kind, contractVersion: 'v1' };
        deliverableId = did.computeDeliverableId(key);
        // Init scaffold via contract-enforcement
        const ce = require('./contract-enforcement');
        const ctx = ce.buildBoardContractContext(engineId);
        ce.initDeliverableScaffold(taskId, ctx);
    }
    catch { /* scaffold creation optional */ }
    const state = {
        task_id: taskId, deliverable_id: deliverableId, engine_id: engineId,
        scaffold_created: !!deliverableId, fields_populated: [], fields_missing: [],
        contract_status: 'pending', merge_count: 0, last_merge_at: null,
        created_at: new Date().toISOString(),
    };
    saveState(taskId, state);
    return state;
}
/** Hook: Called when a subtask completes — merges output into deliverable */
function onSubtaskComplete(taskId, subtaskId, output, engineId, structuredResult) {
    const state = getState(taskId);
    if (!state)
        return null;
    // Part 67: If structured extraction succeeded, use field-level population
    if (structuredResult?.parsed?.ok && structuredResult?.mapping) {
        try {
            const ce = require('./contract-enforcement');
            const deliverable = ce.getDeliverable(taskId);
            if (deliverable) {
                // Structured path: field-level mapping was already applied by executeStructuredSubtask
                // Just write the updated deliverable back
                const fsp = require('fs');
                const pp = require('path');
                const delivPath = pp.resolve(__dirname, '..', '..', 'state', 'deliverables', `${taskId}.json`);
                fsp.writeFileSync(delivPath, JSON.stringify(deliverable, null, 2));
                state.merge_count++;
                state.last_merge_at = new Date().toISOString();
            }
        }
        catch { /* fall through to heuristic */ }
    }
    // Heuristic merge fallback (existing path)
    if (!structuredResult?.parsed?.ok) {
        try {
            const ce = require('./contract-enforcement');
            ce.mergeSubtaskOutput(taskId, subtaskId, output);
            state.merge_count++;
            state.last_merge_at = new Date().toISOString();
        }
        catch { /* merge optional */ }
    }
    // Re-evaluate contract satisfaction
    updateContractStatus(taskId, engineId, state);
    saveState(taskId, state);
    return state;
}
/** Hook: Called when task completes — validates contract satisfaction and gates closure */
function onTaskComplete(taskId, engineId) {
    let state = getState(taskId);
    if (!state) {
        state = { task_id: taskId, deliverable_id: '', engine_id: engineId, scaffold_created: false, fields_populated: [], fields_missing: ['no_runtime_state'], contract_status: 'violated', merge_count: 0, last_merge_at: null, created_at: new Date().toISOString() };
    }
    updateContractStatus(taskId, engineId, state);
    saveState(taskId, state);
    const gatePassed = state.contract_status === 'satisfied' || state.contract_status === 'partial';
    const closureReason = state.contract_status === 'satisfied' ? 'Contract fully satisfied'
        : state.contract_status === 'partial' ? `Partial: missing ${state.fields_missing.join(', ')}`
            : `Contract violated: missing ${state.fields_missing.join(', ')}`;
    // Record enforcement evidence
    try {
        const ee = require('./enforcement-evidence');
        ee.recordEvidence('runtime_deliverable', 'runtime-deliverable-pipeline', state.contract_status, closureReason.slice(0, 50), 'task', taskId, engineId, '');
    }
    catch { /* */ }
    return { state, gate_passed: gatePassed, closure_reason: closureReason };
}
/** Get runtime state for a task */
function getState(taskId) {
    const all = readJson(STATE_FILE, {});
    return all[taskId] || null;
}
/** Get summary across all tasks */
function getSummary() {
    const all = readJson(STATE_FILE, {});
    const states = Object.values(all);
    return {
        total_tasks: states.length,
        with_deliverables: states.filter(s => s.scaffold_created).length,
        satisfied: states.filter(s => s.contract_status === 'satisfied').length,
        partial: states.filter(s => s.contract_status === 'partial').length,
        pending: states.filter(s => s.contract_status === 'pending').length,
        violated: states.filter(s => s.contract_status === 'violated').length,
    };
}
function updateContractStatus(taskId, engineId, state) {
    try {
        const ce = require('./contract-enforcement');
        const result = ce.enforceAtCompletion(taskId, engineId);
        state.fields_missing = result.missingFields;
        if (result.status === 'pass')
            state.contract_status = 'satisfied';
        else if (result.status === 'soft_fail')
            state.contract_status = 'partial';
        else
            state.contract_status = 'violated';
        // Populate fields_populated by checking what's in the scaffold
        try {
            const sd = require('./structured-deliverables');
            const schema = sd.getDeliverableSchema(engineId);
            state.fields_populated = schema.fields.filter(f => !result.missingFields.includes(f));
        }
        catch { /* */ }
    }
    catch {
        state.contract_status = 'pending';
    }
}
function saveState(taskId, state) {
    const all = readJson(STATE_FILE, {});
    all[taskId] = state;
    writeJson(STATE_FILE, all);
}
module.exports = { onTaskStart, onSubtaskComplete, onTaskComplete, getState, getSummary };
//# sourceMappingURL=runtime-deliverable-pipeline.js.map