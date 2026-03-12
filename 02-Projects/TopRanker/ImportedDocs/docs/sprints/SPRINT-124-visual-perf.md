# Sprint 124: Visual Regression, Migration Tooling & Performance Budgets

**Date:** 2026-03-08
**Sprint Goal:** Lay foundations for visual regression testing, database migration tooling, and performance budget enforcement ahead of the Sprint 125 SLT meeting.

---

## Mission Alignment

These three utilities directly support TopRanker's reliability posture. Visual regression prevents UI regressions from shipping unnoticed. Migration tooling formalizes schema evolution. Performance budgets enforce the speed standards our users expect from a trust-first platform.

---

## Team Discussion

**Sarah Nakamura (Lead Engineer):** "The visual regression utility gives us the abstraction layer we need. Once we wire in pixelmatch, every PR will get automatic screenshot comparison against baselines. The 8 critical screens cover our entire user journey."

**Amir Patel (Architecture):** "The migration runner follows the same pattern we used for offline-sync — in-memory tracking now, database-backed later. The Set-based approach means zero external dependencies. When we add Drizzle migration support, we just swap the internals."

**Marcus Chen (CTO):** "Performance budgets are table stakes for any serious platform. TTFB at 200ms, FCP at 1.5s — these are aggressive but achievable. I want the Sprint 125 SLT meeting to review these numbers and decide if we tighten them further."

**Nadia Kaur (Cybersecurity):** "Migration tooling is a security surface I want to monitor. The apply/rollback functions should eventually require admin-level auth. For now, the in-memory approach keeps it safe since there's no production database exposure."

**Rachel Wei (CFO):** "The performance budget utility directly impacts conversion. Every 100ms of TTFB improvement is measurable revenue. I want these metrics wired into the admin dashboard by Sprint 127 so we can correlate performance with subscription conversions."

**Carlos Rivera (QA Lead):** "We're at 1147 tests across 57 files now. The visual regression tests validate structure and exports. When pixelmatch lands, we'll add pixel-level assertions. The CHANGELOG reverse-chronological ordering tests are a nice regression guard."

**Jasmine Taylor (Marketing):** "Fast load times are a marketing story. When we can show sub-200ms TTFB in our marketing materials, that differentiates us from Yelp. Performance is a feature our business users will pay for."

---

## Changes

### 1. Visual Regression Testing Utility (`lib/visual-regression.ts`)
- `ScreenshotConfig` interface with name, route, viewport
- `CRITICAL_SCREENS` array with 8 entries (home, search, challenger, profile, settings, business-detail, login, signup)
- `DIFF_THRESHOLD = 0.1` — max allowed pixel difference
- `generateScreenshotManifest()` — CI-consumable manifest with timestamp
- `compareScreenshots()` — placeholder returning match:true (pixelmatch integration pending)

### 2. Database Migration Runner (`server/migrate.ts`)
- `Migration` interface with id, name, up, down, appliedAt
- `migrations` array — empty registry for future schema changes
- `getMigrationStatus()` — returns applied/pending migration lists
- `applyMigration(id)` — marks migration as applied, sets timestamp
- `rollbackMigration(id)` — removes migration from applied set
- In-memory `Set<string>` tracking (no external dependencies)

### 3. Performance Budget Utility (`lib/performance-budget.ts`)
- `PerformanceBudget` interface with metric, budget, unit
- `BUDGETS` array: ttfb (200ms), fcp (1500ms), bundle_size (500kb), api_response (100ms)
- `checkBudget(metric, value)` — returns passed/failed with overage calculation
- `getBudgetReport()` — placeholder returning all "ok" until real measurements wired

### 4. CHANGELOG
- Added Sprint 121-124 entries in reverse chronological order

### 5. Tests (`tests/sprint124-visual-perf.test.ts`)
- Visual regression: 10 tests (file exists, exports, 8 screens, threshold, manifest, compare)
- Migration runner: 10 tests (file exists, interface, functions, Set tracking)
- Performance budget: 11 tests (file exists, interface, 4 budget entries, check/report functions)
- CHANGELOG: 6 tests (4 sprint entries present, reverse chronological ordering)

---

## PRD Gap Status
- Visual regression: NEW foundation (not in original PRD, platform maturity initiative)
- Migration tooling: NEW foundation (supports future schema evolution)
- Performance budgets: NEW foundation (supports SLT performance review)

---

## Next Sprint
Sprint 125 is an **SLT + Architecture backlog meeting** sprint. Marcus Chen, Rachel Wei, Amir Patel, and Sarah Nakamura will review Sprints 120-124, prioritize the next 5 sprints (125-129), and assess technical debt.
