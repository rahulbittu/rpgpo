"use strict";
// GPO Orchestrator Events — Evidence emission for workflow transitions
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvidence = createEvidence;
exports.getWorkflowEvidence = getWorkflowEvidence;
const fs = require('fs');
const path = require('path');
const EVIDENCE_DIR = path.resolve(__dirname, '..', '..', 'state', 'evidence', 'orchestrator');
function createEvidence(args) {
    const evidenceId = `we_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const record = {
        evidenceId,
        kind: args.kind,
        workflowId: args.workflowId,
        transition: { from: args.from, to: args.to },
        trigger: args.trigger,
        by: args.by,
        note: args.note,
        createdAt: new Date().toISOString(),
    };
    try {
        if (!fs.existsSync(EVIDENCE_DIR))
            fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
        const file = path.join(EVIDENCE_DIR, `${args.workflowId}-${evidenceId}.json`);
        fs.writeFileSync(file, JSON.stringify(record, null, 2));
    }
    catch { /* non-fatal */ }
    return evidenceId;
}
function getWorkflowEvidence(workflowId) {
    const results = [];
    try {
        if (!fs.existsSync(EVIDENCE_DIR))
            return [];
        const files = fs.readdirSync(EVIDENCE_DIR).filter((f) => f.startsWith(workflowId) && f.endsWith('.json'));
        for (const file of files) {
            try {
                results.push(JSON.parse(fs.readFileSync(path.join(EVIDENCE_DIR, file), 'utf-8')));
            }
            catch { /* skip */ }
        }
    }
    catch { /* */ }
    return results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
module.exports = { createEvidence, getWorkflowEvidence };
//# sourceMappingURL=orchestrator-events.js.map