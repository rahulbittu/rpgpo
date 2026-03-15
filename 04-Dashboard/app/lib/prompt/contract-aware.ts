// GPO Contract-Aware Prompt Builder — Injects schema into AI prompts

import type { GPO_PromptEnvelope, GPO_SchemaEnvelope, GPO_StructuredMode, GPO_ContractAwareConfig } from '../types';

const crypto = require('crypto') as typeof import('crypto');

function stableHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('base64url').slice(0, 16);
}

interface BuildPromptArgs {
  provider: string;
  locale?: string;
  taskKind: 'board-deliberation' | 'subtask-execution';
  taskDescription: string;
  deliverableContract: any;
  priorContext?: string;
  fieldPolicies?: any;
  engineId: string;
}

function summarizePolicies(fieldPolicies: Record<string, string>): string {
  return Object.entries(fieldPolicies)
    .map(([field, strategy]) => `${field}: ${strategy}`)
    .join('; ');
}

function buildSystemForTaskKind(taskKind: string, locale?: string): string {
  if (taskKind === 'board-deliberation') {
    return `You are the RPGPO Board of AI producing structured deliverable output. Your role is governance and synthesis. Return ONLY valid JSON matching the provided schema. No commentary, no markdown.${locale ? ` Locale: ${locale}` : ''}`;
  }
  return `You are a GPO worker executing a subtask. Return ONLY valid JSON matching the provided schema. No prose, no markdown, no code fences.${locale ? ` Locale: ${locale}` : ''}`;
}

export function buildContractAwarePrompt(args: BuildPromptArgs): { envelope: GPO_PromptEnvelope; schema: GPO_SchemaEnvelope } {
  const { loadContractAwareConfig } = require('../config/ai-io') as { loadContractAwareConfig(): GPO_ContractAwareConfig };
  const { encodeContractToSchema } = require('../contracts/schema-encoder') as { encodeContractToSchema(id: string): GPO_SchemaEnvelope };

  const cfg = loadContractAwareConfig();
  const schema = encodeContractToSchema(args.engineId);
  const mode: GPO_StructuredMode = (cfg.providerModes[args.provider] as GPO_StructuredMode) || 'prompt-sentinel';

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
