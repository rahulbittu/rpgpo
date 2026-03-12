# Sprint 206 — DB Activity Wiring + Performance Budget Consolidation

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

## Mission Alignment

Close the two most impactful medium findings from Audit #23: wire DB-backed active user tracking into the middleware (M4), and consolidate performance budgets into a single source of truth (M3). Add CI enforcement for performance budget definitions.

## Team Discussion

**Marcus Chen (CTO):** "Two audit findings closed in one sprint. The middleware now writes to both in-memory and DB — zero risk of data loss on server restart. Performance budgets are unified — one file, one truth."

**Amir Patel (Architecture):** "The shared BUDGETS array in lib/performance-budget.ts is now the canonical definition. Server perf-monitor reads from it instead of hardcoding. CI validates that all required metrics are defined. If someone removes a budget, CI catches it."

**Sarah Nakamura (Lead Eng):** "The middleware DB call is non-blocking — `.catch(() => {})`. If the DB is slow or down, it doesn't block the authenticated request. The in-memory tracker remains as fast-path fallback."

**Leo Hernandez (Frontend):** "The performance-budget.ts changes are backward-compatible — the BUDGETS export shape is the same, just with more entries. The checkBudget function works identically."

**Nadia Kaur (Security):** "Non-blocking DB write in the auth middleware is correct — authentication must never depend on analytics persistence. The catch swallows errors silently, which is appropriate for non-critical tracking."

**Jordan Blake (Compliance):** "User activity tracking is now durable. If a user requests their data under GDPR, we can provide accurate activity records even after server restarts."

## Deliverables

### Middleware DB Activity Wiring (`server/middleware.ts`)
- Added `recordUserActivityDb` import from storage
- Non-blocking DB upsert on every authenticated request
- In-memory tracking retained as fast-path

### Performance Budget Consolidation (`lib/performance-budget.ts`)
- Added `api_response_avg` (200ms), `api_response_max` (2000ms), `slow_request_rate` (5%)
- Added `%` unit type to PerformanceBudget interface
- Marked as "single source of truth"

### Server Perf Monitor Update (`server/perf-monitor.ts`)
- Imports BUDGETS from shared module
- `getPerformanceValidation()` reads budgets dynamically instead of hardcoding

### CI Pipeline Enhancement (`.github/workflows/ci.yml`)
- New "Performance budget validation" step
- Checks all required budget metrics are defined
- Reports missing budgets as CI warning

## Tests

- 28 new tests in `tests/sprint206-middleware-perf-consolidation.test.ts`
- Full suite: **3,596+ tests across 136 files, all passing**
