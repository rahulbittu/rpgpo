# GPO Canonical Engine Registry

## The 15-Engine Model

GPO uses 15 specialized engines. Each engine has a **canonical ID** (the correct, permanent identifier) and may have **legacy IDs** (internal names from earlier development that still exist in some code paths).

| # | Canonical ID | Display Name | Legacy IDs | Status |
|---|---|---|---|---|
| 1 | `code` | Code & Product Engineering | `startup` | ID acceptable |
| 2 | `writing` | Writing & Documentation | — | Clean |
| 3 | `research` | Research & Analysis | — | Clean |
| 4 | `learning` | Learning & Tutoring | — | Clean |
| 5 | `ops` | Scheduling & Life Operations | `personalops` | **Legacy active** |
| 6 | `health` | Health & Wellness Coach | — | Clean |
| 7 | `shopping` | Shopping & Buying Advisor | — | Clean |
| 8 | `travel` | Travel & Relocation Planner | — | Clean |
| 9 | `finance` | Personal Finance & Investing | `wealthresearch` | **Legacy active** |
| 10 | `startup` | Startup & Business Builder | `topranker` | **Legacy active** |
| 11 | `career` | Career & Job Search | `careeregine` | **Legacy active** |
| 12 | `screenwriting` | Screenwriting & Story Development | — | Clean |
| 13 | `film` | Filmmaking & Video Production | `founder2founder` | **Legacy active** |
| 14 | `music` | Music & Audio Creation | — | Clean |
| 15 | `news` | News & Intelligence | `newsroom` | **Legacy active** |

Plus `general` — catch-all for unrouted tasks (not a real engine, should be minimized).

## Current State

**6 legacy IDs remain active** in the codebase:
- `careeregine` → should be `career`
- `wealthresearch` → should be `finance`
- `personalops` → should be `ops`
- `topranker` → should be `startup`
- `newsroom` → should be `news`
- `founder2founder` → should be `film`

These appear in routing, types, deliberation, signals, stored tasks, and UI.

## Migration Architecture

A **canonical mapping layer** exists at `04-Dashboard/app/lib/canonical-engines.ts`:

```typescript
toCanonical('careeregine')  // → 'career'
toLegacy('career')          // → 'careeregine'
getDisplayName('careeregine') // → 'Career & Job Search'
isLegacyId('careeregine')   // → true
```

### What uses canonical IDs now
- **New behavior events** — engine field normalized to canonical on write
- **Scoped context retrieval** — accepts both canonical and legacy
- **This registry doc and artifacts**

### What still uses legacy IDs (technical debt)
- `domain-router.ts` — routing keyword maps
- `intake.ts` — domain detection and keywords
- `types.ts` — Domain type union
- `engines.ts` — engine definitions
- `deliberation.ts` — domain context blocks
- `worker.js` — engine structure hints
- `app.js` — DOMAIN_LABELS
- `intake-tasks.json` — 1,200+ stored tasks
- `operator-signals.json` — existing signal scopeKeys

### Migration status

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | Canonical mapping layer + behavior events | **Done** |
| Phase 2 | Routing layer canonical-first | **Done** — `domain-router.ts` keyword tables use canonical IDs, returns both `domain` (canonical) and `legacyDomain` (compat) |
| Phase 3 | Types system | **Done** — `types.ts` now defines `CanonicalEngineId`, `LegacyDomain`, and `Domain` (union of both) |
| Phase 4 | API responses | **Done** — `/api/intake/tasks` and `/api/intake/task/:id` now include `engine` (canonical) and `engine_display` fields |
| Phase 5 | Stored task migration | **Deferred** — historical tasks retain legacy `domain` field, readable via `toCanonical()` adapter |

### What is canonical-first now
- **Routing keyword tables** (domain-router.ts) — keyed by canonical IDs
- **Behavior events** — engine field normalized to canonical on write
- **Behavior signal retrieval** — accepts both canonical and legacy
- **API responses** — include canonical `engine` field alongside legacy `domain`
- **Types** — `CanonicalEngineId` type defined as the target
- **Engine registry** — GET `/api/engines` returns canonical definitions

### What still uses legacy IDs (transitional)
- `intake.ts` fallback keywords — keyed by legacy IDs (used only when domain-router fails)
- `deliberation.ts` — DOMAIN_CONTEXT keys
- `worker.js` — engineStructure keys
- `app.js` — DOMAIN_LABELS keys (UI display adapter)
- `intake-tasks.json` — stored `domain` field on 1,300+ historical tasks

### What is historical-only
- Tasks stored before the migration retain their legacy `domain` field permanently
- Old seeded behavior events retain legacy engine field
- These are readable through the `toCanonical()` adapter and will not be rewritten

### Final target state
All new code should use `CanonicalEngineId`. Legacy IDs should only appear in:
1. The `toCanonical()` / `toLegacy()` adapter functions
2. Reading historical stored data
3. Transitional compatibility layers (to be removed over time)

## Artifacts

- `artifacts/testing/canonical-engine-mapping.json` — Machine-readable mapping
- `artifacts/testing/legacy-engine-id-audit.json` — Where every legacy ID appears
- `04-Dashboard/app/lib/canonical-engines.ts` — Runtime mapping layer
- `04-Dashboard/app/lib/domain-router.ts` — Canonical-first routing
