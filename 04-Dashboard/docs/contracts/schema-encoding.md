# Schema Encoding — Contract to JSON Schema Mapping

**Part:** 67
**Module:** `lib/contracts/schema-encoder.ts`
**Last Updated:** 2026-03-14

## Overview

The schema encoder converts GPO engine contracts into JSON Schema draft-07 objects for injection into AI prompts. This enables providers to produce structured, validated JSON output that maps directly to deliverable fields.

## How It Works

### Input Sources

The encoder reads from two contract sources:

1. **`structured-deliverables.ts`** — `getDeliverableSchema(engineId)` returns `{ kind, fields[] }`
   - Maps engine → deliverable kind (e.g., `newsroom` → `newsroom`, `startup` → `code_change`)
   - Returns required fields per kind (e.g., newsroom: `['rankedItems']`)

2. **`output-contracts.ts`** — `getContract(engineId)` returns `{ required_fields[], example_deliverable }`
   - Engine-specific required fields (e.g., newsroom: `['ranked_items', 'summaries', 'source_links']`)
   - Example deliverable text for schema summary

### Merge Strategy

Both field sets are merged (union, no duplicates). If an engine has fields in both sources, both are included in the JSON Schema.

### Output: GPO_SchemaEnvelope

```typescript
{
  contractId: string;      // "contract_{engineId}"
  version: string;         // "v1" (from contract metadata)
  schemaHash: string;      // 16-char base64url SHA-256 of canonical JSON Schema
  jsonSchema: object;      // Full JSON Schema draft-07
  schemaSummary: string;   // Human-readable field list + example
}
```

## JSON Schema Generation

### Type Mapping

Each field is mapped to a JSON Schema type definition. Known fields have rich schemas:

| Field | JSON Schema Type | Items Schema |
|-------|-----------------|--------------|
| `rankedItems` | `array` | `{ rank: number, headline: string, summary: string, source: { name, url } }` |
| `items` | `array` | `{ name: string, price: string, vendor: string, pros: string[], cons: string[] }` |
| `sections` | `array` | `{ heading: string, content: string }` |
| `diffs` | `array` | `{ filePath: string, diff: string, description: string }` |
| `steps` | `array` | `{ id: string, description: string, owner: string, status: string }` |
| `recommendations` | `array` | `{ label: string, rationale: string, priority: string }` |
| `events` | `array` | `{ title: string, start: string, end: string, notes: string }` |
| `artifacts` | `array` | `{ type: string, content: string, title: string }` |
| `findings` | `array` | `{ label: string, detail: string, severity: string }` |
| `title` | `string` | — |
| `methodology` | `string` | — |
| Unknown fields | `string` | — |

### Schema Properties

- `$schema`: `"http://json-schema.org/draft-07/schema#"`
- `type`: `"object"`
- `additionalProperties`: `false` (strict mode — rejects unknown fields)
- `required`: all merged fields from both sources
- `title` field is always included (auto-added if not in contract)

## Deterministic Hashing

### Canonicalization

The `canonicalize()` function produces deterministic JSON:
- Object keys sorted alphabetically at every level
- Arrays maintain order
- Primitives serialized via `JSON.stringify`
- Null/undefined → `"null"`

### Hash Computation

```
canonical = canonicalize(jsonSchema)
hash = SHA-256(canonical) → base64url → first 16 characters
```

This hash is stable: same contract always produces the same hash, enabling:
- Evidence linking (evidence files reference schemaHash)
- Cache invalidation (detect when contract changes)
- Idempotent evidence deduplication

## Examples

### Newsroom Engine

```javascript
const schema = encodeContractToSchema('newsroom');
// schema.jsonSchema.properties:
//   rankedItems: { type: "array", items: { ... headline, summary, source } }
//   ranked_items: { type: "array", items: { ... headline, summary } }
//   summaries: { type: "array", items: { type: "string" } }
//   source_links: { type: "array", items: { type: "string" } }
//   title: { type: "string" }
```

### Shopping Engine

```javascript
const schema = encodeContractToSchema('shopping');
// schema.jsonSchema.properties:
//   items: { type: "array", items: { ... name, price, vendor, pros, cons } }
//   comparisonKeys: { type: "array", items: { type: "string" } }
//   ranked_products: { type: "array", ... }
//   price_vendor: { type: "array", ... }
//   pros_cons: { type: "array", ... }
//   title: { type: "string" }
```

### Unknown Engine (Fallback)

```javascript
const schema = encodeContractToSchema('unknown_engine');
// Falls back to document kind:
//   sections: { type: "array", items: { heading, content } }
//   title: { type: "string" }
```

## Conventions

1. **Field names match deliverable contracts** — `rankedItems` (camelCase from structured-deliverables) and `ranked_items` (snake_case from output-contracts) may both appear.

2. **Required fields are strict** — All fields from both sources are marked required. The AI should return empty arrays/strings for fields it can't populate.

3. **additionalProperties: false** — Prevents the AI from inventing extra fields. Schema validation will flag them.

4. **Schema summary** — `schemaSummary` is a one-line comma-separated field list with types, suitable for human review and compact logging.

## Adding New Field Schemas

To add a schema for a new field, add an entry to `FIELD_SCHEMAS` in `schema-encoder.ts`:

```typescript
const FIELD_SCHEMAS: Record<string, any> = {
  // ... existing
  my_new_field: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        value: { type: 'number' },
      },
      required: ['name'],
    },
  },
};
```

Unknown fields automatically get `{ type: "string" }` — this is safe but imprecise.

## Verification

```bash
# Verify schema for any engine
node -e "
  const se = require('./lib/contracts/schema-encoder');
  const engines = ['newsroom','shopping','startup','screenwriting','research','finance'];
  for (const e of engines) {
    const s = se.encodeContractToSchema(e);
    console.log(e + ':', s.contractId, 'hash=' + s.schemaHash, 'fields=' + Object.keys(s.jsonSchema.properties).length);
  }
"
```
