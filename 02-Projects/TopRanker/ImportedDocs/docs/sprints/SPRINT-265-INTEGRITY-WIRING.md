# Sprint 265: Rating Integrity Wiring + SLT-265 + Arch Audit #35

**Date:** March 9, 2026
**Story Points:** 8
**Focus:** Wire Rating Integrity Phase 1 checks into POST /api/ratings + SLT meeting + Arch Audit

## Mission
Close the gap between the integrity modules (built in Sprints 261-263) and the actual rating submission endpoint. The score engine, owner block, and velocity detection existed as standalone modules — this sprint integrates them into the live request flow.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The RETRO-263 action item was clear: wire rating-integrity checks into POST /api/ratings. I structured it as three integration points: owner self-rating check before any processing, velocity detection before submission, and score engine composite calculation inside submitRating. The key design choice was passing an IntegrityContext object from the route layer into the storage layer — keeps concerns separated."

**Amir Patel (Architecture):** "The score engine integration is clean. The q1/q2/q3 columns map directly to the dimensional scores — food is always q1, but q2 and q3 change meaning based on visit type. We scale 1-5 to 2-10 for the engine, then normalize back for storage. No schema migration needed for Phase 1 — we'll add explicit dimensional columns in Phase 2."

**Nadia Kaur (Cybersecurity):** "Owner self-rating block now runs at the route level, before any database writes. The check uses both account ID matching and IP address matching against the business claim. Velocity detection flags are passed through as metadata — the rating still gets created, but at 0.05x weight. This matches the Rating Integrity doc's principle: weight, never delete."

**Marcus Chen (CTO):** "The SLT-265 meeting confirmed Phase 1 is complete. All five sub-phases delivered on schedule. The roadmap for 266-270 is Phase 2: photo verification, score breakdown API, and low-data honesty. Architecture is solid — 11th consecutive A-grade audit."

**Rachel Wei (CFO):** "Marketing Phase 1 can't start until the CEO personal seed is complete, but the integrity system being live is a major prerequisite. When we tell WhatsApp groups 'our rankings are trustworthy,' the system now actually backs that claim with visit-type weighting and anti-gaming."

**Jasmine Taylor (Marketing):** "The visit type separation is a differentiator. No other review platform distinguishes between dine-in and delivery experiences. This is messaging gold for the WhatsApp campaigns — 'Rate your actual experience, not a generic star.'"

## Changes

### Server — POST /api/ratings integrity integration
- **`server/routes.ts`**: Import and call `checkOwnerSelfRating`, `checkVelocity`, `logRatingSubmission` before `submitRating`
- Owner block returns 403 with user-friendly message
- Velocity flags passed as `IntegrityContext` to storage layer
- Added `rating_rejected_owner_self` to FunnelEvent type

### Server — Storage layer score engine integration
- **`server/storage/ratings.ts`**: Import `computeComposite` from score engine
- Raw score now computed via visit-type weighted composite (not simple average)
- q1→food, q2→dimension2, q3→dimension3 scaled 1-5 → 2-10
- Velocity weight reduction: flagged ratings capped at 0.05x
- New `IntegrityContext` interface for route→storage communication

### Schema — visitType validation
- **`shared/schema.ts`**: `insertRatingSchema` now accepts `visitType: z.enum(["dine_in", "delivery", "takeaway"])`

### Client — Error handling
- **`lib/hooks/useRatingSubmit.ts`**: Handle owner self-rating error with clear user message

### Analytics
- **`server/analytics.ts`**: Added `rating_rejected_owner_self` to `FunnelEvent` type

### Tests
- **21 new tests** in `tests/sprint265-integrity-wiring.test.ts`
- Structural assertions: integrity checks called before submitRating
- Integration: IntegrityContext passed correctly
- Score engine: visit-type composite calculations verified
- Updated 3 existing test files for regex window sizes

### Docs
- `docs/meetings/SLT-BACKLOG-265.md` — SLT Q2 meeting, roadmap 266-270
- `docs/audits/ARCH-AUDIT-35.md` — Grade A, 11th consecutive A-range

## Test Results
- **188 test files, 5,273 tests, all passing** (~2.7s)
- +21 new tests from Sprint 265
- 0 regressions

## PRD Gaps Closed
- [x] Wire rating-integrity into POST /api/ratings (RETRO-263 action item)
- [x] Score engine composite calculation in live submission flow
- [x] Velocity detection integrated into rating route
- [x] Owner self-rating block in rating route
