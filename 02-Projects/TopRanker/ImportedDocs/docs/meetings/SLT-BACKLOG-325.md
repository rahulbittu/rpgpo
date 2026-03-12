# SLT + Architecture Backlog Meeting — Sprint 325

**Date:** March 9, 2026
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng), Rahul Pitta (CEO)
**Facilitator:** Marcus Chen

---

## Opening — CEO Statement

Rahul: "The CEO feedback was clear: the Rankings page was messy with too many filter rows. Category, cuisine, and dish should be one workflow. And the navigation should follow Uber/DoorDash/Grab — small top, big middle, small bottom. Sprints 323-325 executed that vision: removed broken features, added dish badges to ranking cards, and restructured the entire page layout."

## Agenda

### 1. Sprint 321-325 Review

| Sprint | Feature | Points | Status |
|--------|---------|--------|--------|
| 321 | Cuisine-aware empty states on Discover | 3 | Done |
| 322 | Business detail dish rankings | 5 | Done |
| 323 | Rankings page cleanup (remove broken subcategory chips) | 3 | Done |
| 324 | Dish leaderboard badges on ranking cards | 3 | Done |
| 325 | DoorDash-style navigation redesign | 5 | Done |

**Total:** 19 story points across 5 sprints. All shipped, all tests green.

**Marcus:** "Sprint 323 was critical — we removed a broken feature that was making the page messy. `selectedBestIn` was never wired to the query. That's the kind of dead code that erodes user trust in the UI."

**Rachel:** "The navigation redesign aligns with every major food app. Content above the fold. Users see rankings immediately instead of scrolling through filter rows."

### 2. Architecture Audit #47

**Grade: A** — 23rd consecutive A-range.

**Amir:** "Key metrics after Sprints 321-325:"

| Metric | Sprint 320 | Sprint 325 | Delta |
|--------|-----------|-----------|-------|
| Test files | 243 | 246 | +3 |
| Total tests | 6,146 | 6,181 | +35 |
| index.tsx LOC | 646 | 579 | -67 |
| search.tsx LOC | 961 | 961 | 0 |
| routes.ts LOC | 516 | 522 | +6 |
| SubComponents.tsx LOC | 520 | 531 | +11 |
| `as any` casts | 53 | 54 | +1 |

**Findings:**

| Severity | Finding | Action |
|----------|---------|--------|
| Medium | search.tsx at 961 LOC — approaching 1000 threshold | Apply same DoorDash redesign pattern |
| Medium | `as any` at 54 — slow creep | Hold. All are percentage width casts required by RN |
| Low | routes.ts at 522 LOC | Acceptable with batch dish query addition |
| Low | Missing database tables on Railway (dish_*) required manual creation | Add migration script |

**Grade justification:** Navigation redesign was architectural improvement. Removed dead code. Added batch query pattern. Test coverage grew. No critical or high findings.

### 3. Navigation Redesign Assessment

**Before (5 fixed rows, ~300px):**
1. Header (logo + city)
2. Search bar
3. Category chips
4. Cuisine picker
5. Dish shortcuts

**After (2 fixed rows, ~100px):**
1. Header (logo + city)
2. Search bar
3. [Everything else scrolls with content]

**Marcus:** "This is the DoorDash pattern. Content first. Filters are discoverable in the scroll, not blocking the view. Every major food app does this."

### 4. Database Schema Gap

**Amir:** "The dish_leaderboards, dish_leaderboard_entries, dishes, dish_votes, dish_suggestions, and dish_suggestion_votes tables were defined in schema but never pushed to Railway. We manually created them and seeded 27 dish leaderboards. This gap existed since Sprint 166 — 159 sprints of the dish pipeline working locally but not in production."

**Action:** Create a migration script that can be run against any database to ensure all schema tables exist.

### 5. Roadmap: Sprint 326-330

| Sprint | Feature | Points | Priority |
|--------|---------|--------|----------|
| 326 | Apply DoorDash pattern to Discover page | 3 | P1 |
| 327 | Sticky cuisine chips on scroll | 3 | P1 |
| 328 | Share button on business detail page | 3 | P2 |
| 329 | Seed data enrichment (more entries per dish leaderboard) | 3 | P1 |
| 330 | SLT Review + Arch Audit #48 | 5 | Governance |

**Approved unanimously.**

### 6. Anti-Requirement Violations

- Sprint 253 business-responses: Still exists, 72 sprints since flagged
- Sprint 257 review-helpfulness: Still exists, 68 sprints since flagged
- **Marcus:** "FINAL recommendation: remove both. They violate Part 10 of the Rating Integrity doc."
- **CEO action required.**

## Decisions

1. **DoorDash pattern is the navigation standard** — apply to all pages
2. **Database migration tooling needed** — schema gaps must never happen again
3. **Discover page needs same treatment** — Sprint 326
4. **Anti-requirement violations escalated** — CEO must decide

## Next SLT: Sprint 330
