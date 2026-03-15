// GPO Field Populator — Map structured extraction to deliverable fields via merge policy

import type { GPO_StructuredExtraction, GPO_FieldMappingResult, StructuredDeliverable, MergePolicy } from '../types';

/**
 * Populate deliverable fields from a structured extraction result.
 * Respects merge policies and governance immutability rules.
 * Does not mutate inputs — returns new object via caller.
 */
export function populateDeliverableFromStructured(args: {
  deliverable: StructuredDeliverable;
  parsed: GPO_StructuredExtraction<any>;
  mergePolicy?: MergePolicy;
}): GPO_FieldMappingResult {
  const { deliverable, parsed, mergePolicy } = args;
  const result: GPO_FieldMappingResult = {
    updatedFields: [],
    skippedFields: [],
    rejectedFields: [],
    diffs: {},
  };

  if (!parsed.ok || !parsed.value || typeof parsed.value !== 'object') {
    return result;
  }

  const target = deliverable as unknown as Record<string, unknown>;
  const source = parsed.value as Record<string, unknown>;
  const strategies = mergePolicy?.fieldStrategies || {};

  // Immutable fields that should never be overwritten
  const IMMUTABLE = new Set(['kind', 'engineId']);

  for (const [field, incoming] of Object.entries(source)) {
    if (incoming === undefined || incoming === null) continue;

    // Check immutability
    if (IMMUTABLE.has(field)) {
      result.skippedFields.push(field);
      continue;
    }

    // Validate: reject obviously wrong types
    const existing = target[field];
    if (existing !== undefined && existing !== null) {
      if (Array.isArray(existing) && !Array.isArray(incoming)) {
        result.rejectedFields.push(field);
        continue;
      }
    }

    // Record diff
    const before = existing !== undefined ? JSON.parse(JSON.stringify(existing)) : undefined;

    // Apply merge strategy
    const strategy = strategies[field] || 'replace';
    try {
      target[field] = applyFieldStrategy(strategy, existing, incoming);
      result.updatedFields.push(field);
      result.diffs[field] = { before, after: JSON.parse(JSON.stringify(target[field])) };
    } catch {
      result.rejectedFields.push(field);
    }
  }

  // Update timestamp
  target.generatedAt = new Date().toISOString();

  return result;
}

function applyFieldStrategy(strategy: string, existing: unknown, incoming: unknown): unknown {
  switch (strategy) {
    case 'replace':
      return incoming;

    case 'append':
      if (Array.isArray(existing) && Array.isArray(incoming)) {
        return [...existing, ...incoming];
      }
      if (typeof existing === 'string' && typeof incoming === 'string') {
        return existing ? existing + '\n\n' + incoming : incoming;
      }
      return incoming;

    case 'union_dedupe':
      if (Array.isArray(existing) && Array.isArray(incoming)) {
        const seen = new Set(existing.map(i => JSON.stringify(i)));
        const merged = [...existing];
        for (const item of incoming) {
          const key = JSON.stringify(item);
          if (!seen.has(key)) { merged.push(item); seen.add(key); }
        }
        return merged;
      }
      return incoming;

    case 'pick_best':
      if (Array.isArray(incoming) && Array.isArray(existing)) {
        return incoming.length >= (existing as unknown[]).length ? incoming : existing;
      }
      return incoming;

    case 'structural_merge':
      if (typeof existing === 'object' && typeof incoming === 'object' && existing !== null && incoming !== null && !Array.isArray(existing) && !Array.isArray(incoming)) {
        return { ...(existing as Record<string, unknown>), ...(incoming as Record<string, unknown>) };
      }
      return incoming;

    default:
      return incoming;
  }
}

module.exports = { populateDeliverableFromStructured };
