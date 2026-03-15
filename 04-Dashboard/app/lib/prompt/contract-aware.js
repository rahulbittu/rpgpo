"use strict";
// GPO Contract-Aware Prompt Builder — Injects schema into AI prompts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContractAwarePrompt = buildContractAwarePrompt;
const crypto = require('crypto');
function stableHash(input) {
    return crypto.createHash('sha256').update(input).digest('base64url').slice(0, 16);
}
function summarizePolicies(fieldPolicies) {
    return Object.entries(fieldPolicies)
        .map(([field, strategy]) => `${field}: ${strategy}`)
        .join('; ');
}
function buildSystemForTaskKind(taskKind, locale) {
    if (taskKind === 'board-deliberation') {
        return `You are the RPGPO Board of AI producing structured deliverable output. Your role is governance and synthesis. Return ONLY valid JSON matching the provided schema. No commentary, no markdown.${locale ? ` Locale: ${locale}` : ''}`;
    }
    return `You are a GPO worker executing a subtask. Return ONLY valid JSON matching the provided schema. No prose, no markdown, no code fences.${locale ? ` Locale: ${locale}` : ''}`;
}
function buildContractAwarePrompt(args) {
    const { loadContractAwareConfig } = require('../config/ai-io');
    const { encodeContractToSchema } = require('../contracts/schema-encoder');
    const cfg = loadContractAwareConfig();
    const schema = encodeContractToSchema(args.engineId);
    const mode = cfg.providerModes[args.provider] || 'prompt-sentinel';
    const instructions = [
        'You MUST return a single JSON object that validates against the following JSON Schema.',
        'Return ONLY the JSON object. No commentary, no markdown, no code fences.',
        mode === 'prompt-sentinel' ? `Wrap ONLY the JSON object between ${cfg.sentinel.start} and ${cfg.sentinel.end}.` : '',
        'If uncertain about a field, use empty values allowed by the schema (e.g., [], "", null where allowed).',
        '',
        'JSON Schema:',
        JSON.stringify(schema.jsonSchema, null, 2),
        '',
        args.fieldPolicies ? `Field policy constraints: ${summarizePolicies(args.fieldPolicies)}` : '',
    ].filter(Boolean).join('\n');
    const system = buildSystemForTaskKind(args.taskKind, args.locale);
    const user = args.taskDescription + (args.priorContext ? '\n\nContext:\n' + args.priorContext : '');
    const promptId = stableHash([args.provider, system, user, instructions, schema.schemaHash, mode].join('||'));
    return {
        envelope: {
            promptId,
            mode,
            system,
            user,
            instructions,
            sentinelStart: cfg.sentinel.start,
            sentinelEnd: cfg.sentinel.end,
            providerHints: {},
        },
        schema,
    };
}
module.exports = { buildContractAwarePrompt };
//# sourceMappingURL=contract-aware.js.map