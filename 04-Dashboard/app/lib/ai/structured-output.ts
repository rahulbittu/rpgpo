// GPO Structured Output Parser — Extract and validate JSON from provider responses

import type { GPO_StructuredMode, GPO_SchemaEnvelope, GPO_StructuredExtraction, GPO_ContractAwareConfig } from '../types';

/**
 * Parse structured output from a provider response.
 * Pipeline: native parse → sentinel extract → fenced block → balanced braces → validate
 */
export function parseStructured<T = any>(
  raw: string,
  mode: GPO_StructuredMode,
  schema: GPO_SchemaEnvelope,
  cfg: GPO_ContractAwareConfig
): GPO_StructuredExtraction<T> {
  const base: GPO_StructuredExtraction<T> = {
    ok: false,
    errors: [],
    raw: raw.slice(0, cfg.maxResponseBytes),
    usedMode: mode,
    schema,
    promptId: '',
    attempts: 0,
  };

  if (raw.length > cfg.maxResponseBytes) {
    base.errors!.push(`Response exceeds maxResponseBytes (${raw.length} > ${cfg.maxResponseBytes})`);
    return base;
  }

  let parsed: any = null;
  let parseErrors: string[] = [];

  // Step 1: Try mode-specific parsing
  if (mode === 'native-json' || mode === 'mime-json') {
    const result = tryJsonParse(raw.trim());
    if (result.ok) {
      parsed = result.value;
    } else {
      parseErrors.push(`Direct JSON parse failed: ${result.error}`);
    }
  }

  if (mode === 'prompt-sentinel' && !parsed) {
    const extracted = extractBetweenSentinels(raw, cfg.sentinel.start, cfg.sentinel.end);
    if (extracted) {
      const result = tryJsonParse(extracted.trim());
      if (result.ok) {
        parsed = result.value;
      } else {
        parseErrors.push(`Sentinel JSON parse failed: ${result.error}`);
      }
    } else {
      parseErrors.push('Sentinel markers not found in response');
    }
  }

  // Step 2: Fallbacks (if acceptNonStrict)
  if (!parsed && cfg.acceptNonStrict) {
    // Try fenced code block
    const fenced = extractFencedJson(raw);
    if (fenced) {
      const result = tryJsonParse(fenced.trim());
      if (result.ok) {
        parsed = result.value;
        parseErrors = [];
      } else {
        parseErrors.push(`Fenced JSON parse failed: ${result.error}`);
      }
    }

    // Try balanced braces
    if (!parsed) {
      const braced = extractBalancedBraces(raw, cfg.maxResponseBytes);
      if (braced) {
        const result = tryJsonParse(braced);
        if (result.ok) {
          parsed = result.value;
          parseErrors = [];
        } else {
          parseErrors.push(`Balanced braces JSON parse failed: ${result.error}`);
        }
      }
    }
  }

  if (!parsed) {
    base.errors = parseErrors.length > 0 ? parseErrors : ['No valid JSON found in response'];
    base.attempts = 1;
    return base;
  }

  // Step 3: Validate against schema (lightweight — check required fields)
  const validationErrors = validateAgainstSchema(parsed, schema.jsonSchema);

  if (validationErrors.length > 0) {
    // Still return the parsed value with warnings
    return {
      ...base,
      ok: true,
      value: parsed as T,
      errors: validationErrors,
      attempts: 1,
    };
  }

  return {
    ...base,
    ok: true,
    value: parsed as T,
    errors: [],
    attempts: 1,
  };
}

/** Canonicalize an object for deterministic diffing */
export function canonicalize<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize) as unknown as T;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
    sorted[key] = canonicalize((obj as Record<string, unknown>)[key]);
  }
  return sorted as T;
}

// ── Helpers ──

function tryJsonParse(text: string): { ok: boolean; value?: any; error?: string } {
  try {
    const value = JSON.parse(text);
    if (typeof value !== 'object' || value === null) {
      return { ok: false, error: 'Parsed value is not an object' };
    }
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function extractBetweenSentinels(text: string, start: string, end: string): string | null {
  const startIdx = text.indexOf(start);
  if (startIdx === -1) return null;
  const contentStart = startIdx + start.length;
  const endIdx = text.indexOf(end, contentStart);
  if (endIdx === -1) return null;
  return text.slice(contentStart, endIdx);
}

function extractFencedJson(text: string): string | null {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return match ? match[1] : null;
}

function extractBalancedBraces(text: string, maxBytes: number): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length && (i - start) < maxBytes; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function validateAgainstSchema(obj: any, schema: any): string[] {
  const errors: string[] = [];
  if (!schema || !schema.properties) return errors;

  // Check required fields
  const required = schema.required || [];
  for (const field of required) {
    if (!(field in obj) || obj[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    } else if (obj[field] === null && schema.properties[field]?.type !== 'null') {
      // null is ok if schema doesn't explicitly disallow
    }
  }

  // Check types for present fields
  for (const [field, value] of Object.entries(obj)) {
    const fieldSchema = schema.properties?.[field];
    if (!fieldSchema) continue;
    if (value === null || value === undefined) continue;

    const expectedType = fieldSchema.type;
    if (expectedType === 'array' && !Array.isArray(value)) {
      errors.push(`Field "${field}" should be array, got ${typeof value}`);
    } else if (expectedType === 'string' && typeof value !== 'string') {
      errors.push(`Field "${field}" should be string, got ${typeof value}`);
    } else if (expectedType === 'number' && typeof value !== 'number') {
      errors.push(`Field "${field}" should be number, got ${typeof value}`);
    } else if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
      errors.push(`Field "${field}" should be object, got ${Array.isArray(value) ? 'array' : typeof value}`);
    }
  }

  return errors;
}

// ── Part 68: Parse retry with backoff ──

import type { GPO_StructuredIOAttempt, GPO_StructuredIOStatus, GPO_ProviderRoutingDecision, GPO_ProviderMode } from '../types';

interface RetryArgs {
  engineId: string;
  taskId: string;
  subtaskId?: string;
  deliverableId?: string;
  taskDescription: string;
  priorContext?: string;
  fieldPolicies?: Record<string, string>;
  preferredProvider?: string;
  context?: 'board' | 'worker' | 'subtask';
  phase?: string;
}

interface RetryResult {
  routingDecision: GPO_ProviderRoutingDecision;
  attempts: GPO_StructuredIOAttempt[];
  finalParsed?: GPO_StructuredExtraction<any>;
  status: GPO_StructuredIOStatus;
  error?: string;
}

/**
 * Execute structured output with parse retry and backoff.
 * Loops up to maxParseAttempts. Records evidence per attempt.
 */
export async function executeWithParseRetry(args: RetryArgs): Promise<RetryResult> {
  const { loadContractAwareConfig } = require('../config/ai-io') as { loadContractAwareConfig(): GPO_ContractAwareConfig };
  const { decideProviderRouting } = require('./provider-capabilities') as { decideProviderRouting(p: string | undefined, c: GPO_ContractAwareConfig, ctx: string): GPO_ProviderRoutingDecision };
  const { buildContractAwarePrompt } = require('../prompt/contract-aware') as any;
  const { callProviderStructured } = require('./providers') as any;
  const { computeBackoffMs, sleepMs } = require('./backoff') as any;
  const { recordStructuredEvidence } = require('../evidence/structured') as any;

  const cfg = loadContractAwareConfig();
  const routing = decideProviderRouting(args.preferredProvider, cfg, args.context || 'subtask');

  const attempts: GPO_StructuredIOAttempt[] = [];
  let lastParsed: GPO_StructuredExtraction<any> | null = null;

  const maxAttempts = routing.parseRetriesPlanned || cfg.maxParseAttempts;

  if (!routing.structuredPath) {
    return {
      routingDecision: routing,
      attempts: [],
      status: buildStatus(args, routing, [], null, 'disabled'),
    };
  }

  for (let i = 1; i <= maxAttempts; i++) {
    const attemptStart = new Date();
    const attempt: GPO_StructuredIOAttempt = {
      attempt: i,
      mode: routing.mode as GPO_ProviderMode,
      providerId: routing.providerId,
      startedAt: attemptStart.toISOString(),
      success: false,
    };

    try {
      const { envelope, schema } = buildContractAwarePrompt({
        provider: routing.providerId,
        taskKind: args.context === 'board' ? 'board-deliberation' : 'subtask-execution',
        taskDescription: args.taskDescription,
        deliverableContract: null,
        priorContext: args.priorContext,
        fieldPolicies: args.fieldPolicies,
        engineId: args.engineId,
      });

      const res = await callProviderStructured({
        provider: routing.providerId,
        envelope,
        schema,
      });

      const parsed = parseStructured(res.rawText, res.usedMode, schema, cfg);
      parsed.tokensIn = res.tokensIn;
      parsed.tokensOut = res.tokensOut;
      parsed.durationMs = res.durationMs;
      parsed.promptId = envelope.promptId;
      parsed.attempts = i;

      attempt.endedAt = new Date().toISOString();
      attempt.durationMs = Date.now() - attemptStart.getTime();
      attempt.success = parsed.ok;
      attempt.fieldsExtracted = parsed.value ? Object.keys(parsed.value).length : 0;
      attempt.fieldsMissing = parsed.errors?.filter(e => e.includes('Missing required')).map(e => e.replace('Missing required field: ', ''));

      if (!parsed.ok) {
        attempt.errorCode = 'PARSE_FAILED';
        attempt.errorMessage = (parsed.errors || []).join('; ').slice(0, 200);
      }

      // Record evidence
      try {
        recordStructuredEvidence({
          deliverableId: args.deliverableId || args.taskId,
          taskId: args.subtaskId || args.taskId,
          schema, envelope, extraction: parsed,
        });
        attempt.evidenceId = `${args.deliverableId || args.taskId}/${args.subtaskId || args.taskId}`;
      } catch { /* non-fatal */ }

      attempts.push(attempt);
      lastParsed = parsed;

      if (parsed.ok) {
        // Success — stop retrying
        return {
          routingDecision: routing,
          attempts,
          finalParsed: parsed,
          status: buildStatus(args, routing, attempts, parsed, 'complete'),
        };
      }
    } catch (e) {
      attempt.endedAt = new Date().toISOString();
      attempt.durationMs = Date.now() - attemptStart.getTime();
      attempt.errorCode = 'PROVIDER_ERROR';
      attempt.errorMessage = (e instanceof Error ? e.message : String(e)).slice(0, 200);
      attempts.push(attempt);
    }

    // Backoff before next attempt (skip after last attempt)
    if (i < maxAttempts) {
      const delay = computeBackoffMs({
        baseMs: cfg.backoffMs || 250,
        multiplier: cfg.backoffMultiplier || 1.7,
        jitter: cfg.backoffJitter || 0.2,
        attempt: i,
      });
      await sleepMs(delay);
    }
  }

  // All attempts exhausted
  return {
    routingDecision: routing,
    attempts,
    finalParsed: lastParsed || undefined,
    status: buildStatus(args, routing, attempts, lastParsed, 'failed'),
    error: `Structured parse failed after ${maxAttempts} attempts`,
  };
}

function buildStatus(
  args: RetryArgs,
  routing: GPO_ProviderRoutingDecision,
  attempts: GPO_StructuredIOAttempt[],
  parsed: GPO_StructuredExtraction<any> | null,
  status: GPO_StructuredIOStatus['status']
): GPO_StructuredIOStatus {
  const totalMs = attempts.reduce((sum, a) => sum + (a.durationMs || 0), 0);
  const lastAttempt = attempts[attempts.length - 1];

  return {
    enabled: routing.featureFlagActive,
    taskId: args.taskId,
    phase: args.phase,
    providerId: routing.providerId,
    providerMode: routing.mode as GPO_ProviderMode,
    attempts,
    maxAttempts: routing.parseRetriesPlanned,
    status,
    fieldsExtracted: parsed?.value ? Object.keys(parsed.value).length : undefined,
    fieldsMissing: lastAttempt?.fieldsMissing,
    lastErrorCode: lastAttempt?.errorCode,
    lastErrorMessage: lastAttempt?.errorMessage?.slice(0, 100),
    totalDurationMs: totalMs,
  };
}

module.exports = { parseStructured, canonicalize, executeWithParseRetry };
