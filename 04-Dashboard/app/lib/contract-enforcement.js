"use strict";
// GPO Contract Enforcement — Plan-time and completion-time enforcement of output contracts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBoardContractContext = buildBoardContractContext;
exports.applyContractToPlan = applyContractToPlan;
exports.initDeliverableScaffold = initDeliverableScaffold;
exports.mergeSubtaskOutput = mergeSubtaskOutput;
exports.enforceAtCompletion = enforceAtCompletion;
exports.remediationFromFailures = remediationFromFailures;
exports.getDeliverable = getDeliverable;
const fs = require('fs');
const path = require('path');
const DELIVERABLES_DIR = path.resolve(__dirname, '..', '..', 'state', 'deliverables');
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Build board contract context for an engine */
function buildBoardContractContext(engineId) {
    let requiredFields = [];
    let outputType = 'document';
    let rubric = '';
    try {
        const oc = require('./output-contracts');
        const contract = oc.getContract(engineId);
        if (contract) {
            requiredFields = contract.required_fields;
            rubric = `Deliverable must include: ${requiredFields.join(', ')}. Example: ${contract.example_deliverable}`;
        }
    }
    catch { /* */ }
    try {
        const ec = require('./engine-catalog');
        const engine = ec.getEngine(engineId);
        if (engine)
            outputType = engine.default_output;
    }
    catch { /* */ }
    return { engineId, outputType, contractVersion: 'v1', requiredFields, rubric };
}
/** Apply contract to a subtask plan — adds Assemble + Validate terminal subtasks */
function applyContractToPlan(ctx, plan) {
    const augmented = [...plan];
    // Add assembly subtask
    augmented.push({ title: `Assemble ${ctx.outputType} deliverable`, stage: 'compile', assigned_role: 'assembler', contract_fields: ctx.requiredFields, contract_engine: ctx.engineId });
    // Add validation gate
    augmented.push({ title: 'Validate deliverable contract', stage: 'validate', assigned_role: 'validator', contract_engine: ctx.engineId });
    return augmented;
}
/** Initialize a deliverable scaffold for a task */
function initDeliverableScaffold(taskId, ctx) {
    try {
        const sd = require('./structured-deliverables');
        const scaffold = sd.normalizeDeliverable(ctx.engineId, {});
        scaffold.title = `${ctx.engineId} deliverable`;
        const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
        writeJson(filePath, scaffold);
        return scaffold;
    }
    catch {
        const scaffold = { kind: 'document', engineId: ctx.engineId, title: '', generatedAt: new Date().toISOString(), sections: [] };
        writeJson(path.join(DELIVERABLES_DIR, `${taskId}.json`), scaffold);
        return scaffold;
    }
}
/** Merge subtask output into existing deliverable scaffold */
function mergeSubtaskOutput(taskId, subtaskId, output) {
    const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
    let deliverable = readJson(filePath, null);
    if (!deliverable) {
        // Auto-init if missing
        const ctx = buildBoardContractContext('general');
        deliverable = initDeliverableScaffold(taskId, ctx);
    }
    // Merge based on kind — extract relevant data from output
    if (typeof output === 'string' && output.length > 0) {
        const d = deliverable;
        if (deliverable.kind === 'newsroom') {
            // Try to parse ranked items from text
            const items = d.rankedItems || [];
            if (items.length === 0) {
                d.rankedItems = [{ rank: 1, headline: output.slice(0, 100), summary: output.slice(0, 300), source: { name: 'subtask', url: '' } }];
            }
        }
        else if (deliverable.kind === 'document') {
            const sections = d.sections || [];
            sections.push({ heading: `From ${subtaskId}`, content: output });
            d.sections = sections;
        }
        else if (deliverable.kind === 'recommendation') {
            const recs = d.recommendations || [];
            recs.push({ label: subtaskId, rationale: output.slice(0, 500) });
            d.recommendations = recs;
        }
        else if (deliverable.kind === 'action_plan') {
            const steps = d.steps || [];
            steps.push({ id: subtaskId, description: output.slice(0, 300) });
            d.steps = steps;
        }
        else if (deliverable.kind === 'analysis') {
            const findings = d.findings || [];
            findings.push({ label: subtaskId, detail: output.slice(0, 500) });
            d.findings = findings;
        }
        else if (deliverable.kind === 'creative_draft') {
            const artifacts = d.artifacts || [];
            artifacts.push({ type: 'story', content: output });
            d.artifacts = artifacts;
        }
        deliverable.generatedAt = new Date().toISOString();
    }
    writeJson(filePath, deliverable);
    return { updated: deliverable };
}
/** Enforce contract at task completion */
function enforceAtCompletion(taskId, engineId) {
    const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
    const deliverable = readJson(filePath, null);
    if (!deliverable) {
        return { status: 'hard_fail', missingFields: ['deliverable_not_found'], details: [{ field: 'deliverable', message: 'No deliverable file exists for this task' }] };
    }
    try {
        const sd = require('./structured-deliverables');
        return sd.validateDeliverable(engineId, deliverable);
    }
    catch {
        return { status: 'soft_fail', missingFields: ['validation_unavailable'] };
    }
}
/** Generate remediation checklist from enforcement failures */
function remediationFromFailures(res) {
    return {
        items: res.missingFields.map((f, i) => ({
            id: `rem_${i}`, label: `Populate ${f}`, fixHint: `Re-run subtask targeting ${f} or manually provide data`, owner: 'agent',
        })),
    };
}
/** Get deliverable for a task */
function getDeliverable(taskId) {
    const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
    return readJson(filePath, null);
}
module.exports = { buildBoardContractContext, applyContractToPlan, initDeliverableScaffold, mergeSubtaskOutput, enforceAtCompletion, remediationFromFailures, getDeliverable };
//# sourceMappingURL=contract-enforcement.js.map