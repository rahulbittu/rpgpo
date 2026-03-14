# Part 60: Deliverable Identity + Versioned Store + Migration

## Modules
- `deliverable-id.ts` — Deterministic ID computation, key creation, parsing, content hashing
- `deliverable-store.ts` — Versioned append-only store with atomic writes, index, migration, reindex

## Store Layout
```
state/deliverables-store/
  index.json                    — O(1) lookup for latest/approved per deliverable
  {deliverableId}/
    meta.json                   — key + version history vector
    v0001.json, v0002.json, ... — full version payloads (never overwritten)
```

## Deliverable Identity
`dlv_{project}_{task}_{variant}_{sha256-8chars}` — deterministic from DeliverableKey

## Status Lifecycle
draft → proposed → approved | rejected
approved may be superseded by a later approved version

## Atomic Writes
Write to tmp file then rename — no partial writes. Index updated synchronously after version write.

## Migration
`migrateFlatStore()` converts legacy `state/deliverables/:taskId.json` to versioned store entries.
`reindex()` rebuilds index.json from folder contents.
