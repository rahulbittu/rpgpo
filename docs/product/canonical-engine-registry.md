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

### Migration plan
1. **Phase 1 (done):** Canonical mapping layer + behavior events use canonical IDs
2. **Phase 2 (next):** Migrate routing layer to canonical-first with legacy adapter
3. **Phase 3 (future):** Update types.ts Domain union to canonical IDs
4. **Phase 4 (future):** Migrate stored tasks (add canonical_domain field alongside legacy domain)

Historical tasks in `intake-tasks.json` will retain their legacy domain field permanently. They can be read through the `toCanonical()` adapter.

## Artifacts

- `artifacts/testing/canonical-engine-mapping.json` — Machine-readable mapping
- `artifacts/testing/legacy-engine-id-audit.json` — Where every legacy ID appears
- `04-Dashboard/app/lib/canonical-engines.ts` — Runtime mapping layer
