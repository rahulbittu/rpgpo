// GPO Structured Evidence Recorder — Logs schema, prompt, parse, and mapping evidence

import type { GPO_SchemaEnvelope, GPO_PromptEnvelope, GPO_StructuredExtraction, GPO_FieldMappingResult } from '../types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EVIDENCE_BASE = path.resolve(__dirname, '..', '..', '..', 'state', 'evidence');

interface StructuredEvidenceArgs {
  deliverableId: string;
  taskId: string;
  schema: GPO_SchemaEnvelope;
  envelope: GPO_PromptEnvelope;
  extraction: GPO_StructuredExtraction<any>;
  mapping?: GPO_FieldMappingResult;
}

/**
 * Record structured extraction evidence to state/evidence/{deliverableId}/{taskId}/structured-{timestamp}.json
 */
export function recordStructuredEvidence(args: StructuredEvidenceArgs): void {
  const { deliverableId, taskId, schema, envelope, extraction, mapping } = args;

  const dir = path.join(EVIDENCE_BASE, sanitize(deliverableId || 'unknown'), sanitize(taskId || 'unknown'));
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch { return; }

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
  } catch { /* non-fatal */ }
}

function sanitize(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

module.exports = { recordStructuredEvidence };
