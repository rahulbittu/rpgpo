# GPO Local Retrieval Guide

## What It Does

GPO's local retrieval system reduces unnecessary file reads and API calls by caching stable context and retrieving only relevant chunks when needed.

## Context Categories

| Category | Examples | Refresh Strategy |
|---|---|---|
| **Stable User Truths** | Writing style, format preferences, dislikes | Reuse until contradicted |
| **Semi-Stable Context** | Current project priorities, engine focus | Freshness check weekly |
| **Time-Sensitive Facts** | News, prices, market data | Always refresh via API |
| **One-Off Requests** | Temporary session formatting | Do not persist |

## How It Works

1. **At task start:** Load operator profile and active signals from cache
2. **At deliberation:** Retrieve engine-specific context and recent task history
3. **At execution:** Inject relevant prior outputs if the task relates to previous work
4. **At synthesis:** Use format/depth preferences from learned signals

## Retrieval Method

- **Primary:** Keyword/BM25-style search (fast, cheap, predictable)
- **Fallback:** Full file read (when keyword search insufficient)
- **Future:** Semantic/vector retrieval (deferred until keyword proves insufficient)

## Cost Reduction Targets

| Waste Pattern | Solution |
|---|---|
| Re-reading operator profile every task | Cache in session memory |
| Re-reading mission context every task | Index once, retrieve by engine |
| Redundant web searches for similar queries | Check recent search cache |
| Loading full state files | Chunked retrieval for large JSON |

## Artifacts

- `artifacts/retrieval/index-manifest.json` — What is indexed and how
- `artifacts/retrieval/retrieval-policy.json` — Retrieval rules and categories
