# Critique Request: Sprints 471–474

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Filter preset chips UI, admin auth middleware, search pagination, date range filter

## Context

Sprints 471–474 delivered all four items from the SLT-470 roadmap: filter presets UI, admin auth for enrichment endpoints (NON-NEGOTIABLE), server-side search pagination, and rating history date range filtering.

## Questions for External Review

### 1. Admin Auth Pattern Duplication
Sprint 472 added `requireAdmin` as a local function in both routes-admin-enrichment.ts and routes-admin-enrichment-bulk.ts. This duplicates the same pattern from routes-admin.ts and routes-admin-experiments.ts. Four files now define their own `requireAdmin`. Should this be extracted to shared middleware alongside `requireAuth`? Does the duplication pose a maintenance risk?

### 2. `as any` Threshold Creep
The total `as any` threshold has drifted from 55→70→75→80 over 4 governance cycles. Each bump was individually justified (Ionicon casts, filter preset types, etc.), but the trend is concerning. At what point does this become architectural debt rather than acceptable type pragmatism?

### 3. RatingHistorySection Growth Pattern
RatingHistorySection went from 177 LOC to 319 LOC in a single sprint (Sprint 474). This is a 80% increase. The date range filter added state, useMemo, UI, and styles. Should features of this magnitude always start as separate components, even when the integration is tight?

### 4. Pagination Count Query Duplication
Sprint 473's `countBusinessSearch` duplicates the WHERE clause from `searchBusinesses`. If one query is updated (e.g., new filter condition), the other must be updated identically. Is this an acceptable trade-off for simpler code, or should they share a query builder?

### 5. Preset Chips + Filter State Ownership
Sprint 471's PresetChips component delegates all state management to the parent SearchScreen. This means applying a preset requires calling 7+ setter functions. Is this the right boundary? Would a filter state reducer (useReducer) be cleaner for managing compound filter changes?
