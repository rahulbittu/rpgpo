"use strict";
// GPO Structured Evidence Recorder — Logs schema, prompt, parse, and mapping evidence
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordStructuredEvidence = recordStructuredEvidence;
const fs = require('fs');
const path = require('path');
const EVIDENCE_BASE = path.resolve(__dirname, '..', '..', '..', 'state', 'evidence');
/**
 * Record structured extraction evidence to state/evidence/{deliverableId}/{taskId}/structured-{timestamp}.json
 */
function recordStructuredEvidence(args) {
    const { deliverableId, taskId, schema, envelope, extraction, mapping } = args;
    const dir = path.join(EVIDENCE_BASE, sanitize(deliverableId || 'unknown'), sanitize(taskId || 'unknown'));
    try {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
    }
    catch {
        return;
    }
    // Redact sensitive content from prompts before logging
    const redactedEnvelope = {
        promptId: envelope.promptId,
        mode: envelope.mode,
        systemLength: envelope.system.length,
        userLength: envelope.user.length,
        instructionsLength: envelope.instructions.length,
        sentinelStart: envelope.sentinelStart,
        sentinelEnd: envelope.sentinelEnd,
    };
    const record = {
        recorded_at: new Date().toISOString(),
        deliverableId,
        taskId,
        schema: {
            contractId: schema.contractId,
            version: schema.version,
            schemaHash: schema.schemaHash,
            schemaSummary: schema.schemaSummary,
        },
        prompt: redactedEnvelope,
        extraction: {
            ok: extraction.ok,
            usedMode: extraction.usedMode,
            promptId: extraction.promptId,
            tokensIn: extraction.tokensIn,
            tokensOut: extraction.tokensOut,
            durationMs: extraction.durationMs,
            attempts: extraction.attempts,
            errors: extraction.errors,
            valueKeys: extraction.value ? Object.keys(extraction.value) : [],
            rawLength: extraction.raw.length,
        },
        mapping: mapping ? {
            updatedFields: mapping.updatedFields,
            skippedFields: mapping.skippedFields,
            rejectedFields: mapping.rejectedFields,
            diffCount: Object.keys(mapping.diffs).length,
        } : null,
    };
    const filename = `structured-${Date.now()}.json`;
    try {
        fs.writeFileSync(path.join(dir, filename), JSON.stringify(record, null, 2));
    }
    catch { /* non-fatal */ }
}
function sanitize(s) {
    return s.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}
module.exports = { recordStructuredEvidence };
//# sourceMappingURL=structured.js.map