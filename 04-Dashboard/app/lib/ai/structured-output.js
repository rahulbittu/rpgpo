"use strict";
// GPO Structured Output Parser — Extract and validate JSON from provider responses
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStructured = parseStructured;
exports.canonicalize = canonicalize;
exports.executeWithParseRetry = executeWithParseRetry;
/**
 * Parse structured output from a provider response.
 * Pipeline: native parse → sentinel extract → fenced block → balanced braces → validate
 */
function parseStructured(raw, mode, schema, cfg) {
    const base = {
        ok: false,
        errors: [],
        raw: raw.slice(0, cfg.maxResponseBytes),
        usedMode: mode,
        schema,
        promptId: '',
        attempts: 0,
    };
    if (raw.length > cfg.maxResponseBytes) {
        base.errors.push(`Response exceeds maxResponseBytes (${raw.length} > ${cfg.maxResponseBytes})`);
        return base;
    }
    let parsed = null;
    let parseErrors = [];
    // Step 1: Try mode-specific parsing
    if (mode === 'native-json' || mode === 'mime-json') {
        const result = tryJsonParse(raw.trim());
        if (result.ok) {
            parsed = result.value;
        }
        else {
            parseErrors.push(`Direct JSON parse failed: ${result.error}`);
        }
    }
    if (mode === 'prompt-sentinel' && !parsed) {
        const extracted = extractBetweenSentinels(raw, cfg.sentinel.start, cfg.sentinel.end);
        if (extracted) {
            const result = tryJsonParse(extracted.trim());
            if (result.ok) {
                parsed = result.value;
            }
            else {
                parseErrors.push(`Sentinel JSON parse failed: ${result.error}`);
            }
        }
        else {
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
            }
            else {
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
                }
                else {
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
            value: parsed,
            errors: validationErrors,
            attempts: 1,
        };
    }
    return {
        ...base,
        ok: true,
        value: parsed,
        errors: [],
        attempts: 1,
    };
}
/** Canonicalize an object for deterministic diffing */
function canonicalize(obj) {
    if (obj === null || obj === undefined || typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj))
        return obj.map(canonicalize);
    const sorted = {};
    for (const key of Object.keys(obj).sort()) {
        sorted[key] = canonicalize(obj[key]);
    }
    return sorted;
}
// ── Helpers ──
function tryJsonParse(text) {
    try {
        const value = JSON.parse(text);
        if (typeof value !== 'object' || value === null) {
            return { ok: false, error: 'Parsed value is not an object' };
        }
        return { ok: true, value };
    }
    catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
}
function extractBetweenSentinels(text, start, end) {
    const startIdx = text.indexOf(start);
    if (startIdx === -1)
        return null;
    const contentStart = startIdx + start.length;
    const endIdx = text.indexOf(end, contentStart);
    if (endIdx === -1)
        return null;
    return text.slice(contentStart, endIdx);
}
function extractFencedJson(text) {
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    return match ? match[1] : null;
}
function extractBalancedBraces(text, maxBytes) {
    const start = text.indexOf('{');
    if (start === -1)
        return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length && (i - start) < maxBytes; i++) {
        const ch = text[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (ch === '\\' && inString) {
            escape = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString)
            continue;
        if (ch === '{')
            depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0)
                return text.slice(start, i + 1);
        }
    }
    return null;
}
function validateAgainstSchema(obj, schema) {
    const errors = [];
    if (!schema || !schema.properties)
        return errors;
    // Check required fields
    const required = schema.required || [];
    for (const field of required) {
        if (!(field in obj) || obj[field] === undefined) {
            errors.push(`Missing required field: ${field}`);
        }
        else if (obj[field] === null && schema.properties[field]?.type !== 'null') {
            // null is ok if schema doesn't explicitly disallow
        }
    }
    // Check types for present fields
    for (const [field, value] of Object.entries(obj)) {
        const fieldSchema = schema.properties?.[field];
        if (!fieldSchema)
            continue;
        if (value === null || value === undefined)
            continue;
        const expectedType = fieldSchema.type;
        if (expectedType === 'array' && !Array.isArray(value)) {
            errors.push(`Field "${field}" should be array, got ${typeof value}`);
        }
        else if (expectedType === 'string' && typeof value !== 'string') {
            errors.push(`Field "${field}" should be string, got ${typeof value}`);
        }
        else if (expectedType === 'number' && typeof value !== 'number') {
            errors.push(`Field "${field}" should be number, got ${typeof value}`);
        }
        else if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
            errors.push(`Field "${field}" should be object, got ${Array.isArray(value) ? 'array' : typeof value}`);
        }
    }
    return errors;
}
/**
 * Execute structured output with parse retry and backoff.
 * Loops up to maxParseAttempts. Records evidence per attempt.
 */
async function executeWithParseRetry(args) {
    const { loadContractAwareConfig } = require('../config/ai-io');
    const { decideProviderRouting } = require('./provider-capabilities');
    const { buildContractAwarePrompt } = require('../prompt/contract-aware');
    const { callProviderStructured } = require('./providers');
    const { computeBackoffMs, sleepMs } = require('./backoff');
    const { recordStructuredEvidence } = require('../evidence/structured');
    const cfg = loadContractAwareConfig();
    const routing = decideProviderRouting(args.preferredProvider, cfg, args.context || 'subtask');
    const attempts = [];
    let lastParsed = null;
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
        const attempt = {
            attempt: i,
            mode: routing.mode,
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
            }
            catch { /* non-fatal */ }
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
        }
        catch (e) {
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
function buildStatus(args, routing, attempts, parsed, status) {
    const totalMs = attempts.reduce((sum, a) => sum + (a.durationMs || 0), 0);
    const lastAttempt = attempts[attempts.length - 1];
    return {
        enabled: routing.featureFlagActive,
        taskId: args.taskId,
        phase: args.phase,
        providerId: routing.providerId,
        providerMode: routing.mode,
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
//# sourceMappingURL=structured-output.js.map