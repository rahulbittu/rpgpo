// GPO Schema Encoder — Contract → JSON Schema + envelope

import type { GPO_SchemaEnvelope } from '../types';

const crypto = require('crypto') as typeof import('crypto');

interface FieldDef {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  items?: any;
}

/** Canonical JSON for deterministic hashing */
function canonicalize(obj: unknown): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']';
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  return '{' + sorted.map(k => JSON.stringify(k) + ':' + canonicalize((obj as Record<string, unknown>)[k])).join(',') + '}';
}

function stableHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('base64url').slice(0, 16);
}

/** Map engine contract fields to JSON Schema properties */
function fieldsToJsonSchema(fields: string[], engineId: string): { properties: Record<string, any>; required: string[] } {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  // Known field schemas from structured-deliverables and output-contracts
  const FIELD_SCHEMAS: Record<string, any> = {
    rankedItems: { type: 'array', items: { type: 'object', properties: { rank: { type: 'number' }, headline: { type: 'string' }, summary: { type: 'string' }, source: { type: 'object', properties: { name: { type: 'string' }, url: { type: 'string' } } } }, required: ['headline', 'summary'] } },
    items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'string' }, vendor: { type: 'string' }, pros: { type: 'array', items: { type: 'string' } }, cons: { type: 'array', items: { type: 'string' } } }, required: ['name'] } },
    comparisonKeys: { type: 'array', items: { type: 'string' } },
    diffs: { type: 'array', items: { type: 'object', properties: { filePath: { type: 'string' }, diff: { type: 'string' }, description: { type: 'string' } }, required: ['filePath'] } },
    sections: { type: 'array', items: { type: 'object', properties: { heading: { type: 'string' }, content: { type: 'string' } }, required: ['heading', 'content'] } },
    recommendations: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, rationale: { type: 'string' }, priority: { type: 'string' } }, required: ['label', 'rationale'] } },
    events: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' }, notes: { type: 'string' } }, required: ['title', 'start'] } },
    artifacts: { type: 'array', items: { type: 'object', properties: { type: { type: 'string' }, content: { type: 'string' }, title: { type: 'string' } }, required: ['type', 'content'] } },
    findings: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, detail: { type: 'string' }, severity: { type: 'string' } }, required: ['label', 'detail'] } },
    charts: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, data: { type: 'object' } } } },
    steps: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, description: { type: 'string' }, owner: { type: 'string' }, status: { type: 'string' } }, required: ['description'] } },
    risks: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, severity: { type: 'string' }, mitigation: { type: 'string' } } } },
    title: { type: 'string' },
    methodology: { type: 'string' },
    testNotes: { type: 'string' },
    references: { type: 'array', items: { type: 'string' } },
    // Output contract fields (snake_case → mapped)
    ranked_items: { type: 'array', items: { type: 'object', properties: { headline: { type: 'string' }, summary: { type: 'string' } }, required: ['headline'] } },
    summaries: { type: 'array', items: { type: 'string' } },
    source_links: { type: 'array', items: { type: 'string' } },
    ranked_products: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'string' }, vendor: { type: 'string' } } } },
    price_vendor: { type: 'array', items: { type: 'object', properties: { product: { type: 'string' }, price: { type: 'string' }, vendor: { type: 'string' } } } },
    pros_cons: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, pros: { type: 'array', items: { type: 'string' } }, cons: { type: 'array', items: { type: 'string' } } } } },
    implementation_plan: { type: 'string' },
    changed_files: { type: 'array', items: { type: 'string' } },
    diff_preview: { type: 'string' },
    extracted_facts: { type: 'array', items: { type: 'object', properties: { fact: { type: 'string' }, source: { type: 'string' } } } },
    evidence_map: { type: 'object' },
    draft_document: { type: 'string' },
    premise: { type: 'string' },
    beat_sheet: { type: 'array', items: { type: 'object', properties: { beat: { type: 'string' }, description: { type: 'string' } } } },
    composition_draft: { type: 'string' },
    lyrics_or_structure: { type: 'string' },
    recommended_slots: { type: 'array', items: { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' }, notes: { type: 'string' } } } },
    calendar_diff: { type: 'object' },
    briefing: { type: 'string' },
    priorities: { type: 'array', items: { type: 'string' } },
    next_actions: { type: 'array', items: { type: 'string' } },
    polished_document: { type: 'string' },
    plan: { type: 'string' },
    analysis: { type: 'string' },
    data_summary: { type: 'string' },
    itinerary: { type: 'object' },
    options: { type: 'array', items: { type: 'object' } },
    cost_comparison: { type: 'object' },
    thesis: { type: 'string' },
    evidence: { type: 'array', items: { type: 'object', properties: { claim: { type: 'string' }, support: { type: 'string' } } } },
    recommendation: { type: 'string' },
    comparison: { type: 'object' },
    polished_draft: { type: 'string' },
    tone_variants: { type: 'array', items: { type: 'object', properties: { tone: { type: 'string' }, content: { type: 'string' } } } },
  };

  for (const field of fields) {
    const schema = FIELD_SCHEMAS[field];
    if (schema) {
      properties[field] = schema;
    } else {
      properties[field] = { type: 'string' };
    }
    required.push(field);
  }

  // Always include title
  if (!properties.title) {
    properties.title = { type: 'string' };
  }

  return { properties, required };
}

/** Encode an engine contract into a GPO_SchemaEnvelope */
export function encodeContractToSchema(engineId: string): GPO_SchemaEnvelope {
  // Gather fields from both structured-deliverables and output-contracts
  const allFields: string[] = [];
  let contractVersion = 'v1';
  let exampleDeliverable = '';

  try {
    const sd = require('../structured-deliverables') as { getDeliverableSchema(id: string): { kind: string; fields: string[] } };
    const schema = sd.getDeliverableSchema(engineId);
    allFields.push(...schema.fields);
  } catch { /* */ }

  try {
    const oc = require('../output-contracts') as { getContract(id: string): { required_fields: string[]; example_deliverable: string } | null };
    const contract = oc.getContract(engineId);
    if (contract) {
      for (const f of contract.required_fields) {
        if (!allFields.includes(f)) allFields.push(f);
      }
      exampleDeliverable = contract.example_deliverable;
    }
  } catch { /* */ }

  if (allFields.length === 0) {
    allFields.push('sections');
  }

  const { properties, required } = fieldsToJsonSchema(allFields, engineId);

  const jsonSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  };

  const canonical = canonicalize(jsonSchema);
  const schemaHash = stableHash(canonical);

  const schemaSummary = allFields.map(f => {
    const p = properties[f];
    const typeStr = p.type === 'array' ? `array<${p.items?.type || 'object'}>` : p.type;
    return `${f}: ${typeStr}`;
  }).join(', ');

  return {
    contractId: `contract_${engineId}`,
    version: contractVersion,
    schemaHash,
    jsonSchema,
    schemaSummary: schemaSummary + (exampleDeliverable ? ` | Example: ${exampleDeliverable}` : ''),
  };
}

module.exports = { encodeContractToSchema, canonicalize, stableHash };
