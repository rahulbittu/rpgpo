# SLT Backlog Meeting — Sprint 265
**Date:** March 9, 2026
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng), Rahul Pitta (CEO)
**Facilitator:** Marcus Chen

## Opening — CEO Statement

Rahul: "Rating Integrity Phase 1 is wired end-to-end. Visit type selection, score engine, owner block, velocity detection — all integrated into the actual POST /api/ratings endpoint. This is not theoretical anymore. When a user submits a rating, the system now: validates visit type, computes a weighted composite score, checks if they're the business owner, checks velocity patterns, and applies weight reduction for flagged submissions. The formula from the Rating Integrity doc is live in production code."

## Agenda

### 1. Rating Integrity Phase 1 — Completion Assessment

**Phase 1a (Sprint 261):** Visit type selection + dimension gating UI — COMPLETE
**Phase 1b (Sprint 262):** Score calculation engine (shared/score-engine.ts) — COMPLETE
**Phase 1c (Sprint 263):** Owner block + velocity detection + thresholds — COMPLETE
**Phase 1d (Sprint 264):** Best In category wiring — COMPLETE
**Phase 1e (Sprint 265):** Integrity checks wired into POST /api/ratings — COMPLETE

Sarah: "The RETRO-263 action item to wire integrity checks into the actual endpoint is done. The route now calls checkOwnerSelfRating, checkVelocity, and logRatingSubmission before submitRating. The storage layer uses computeComposite from the score engine for visit-type weighted scoring. Velocity-flagged ratings get weight-reduced to 0.05x, never deleted."

Amir: "The schema validation now accepts visitType via insertRatingSchema. The q1/q2/q3 scores map to the dimensional scores contextually — food/service/vibe for dine-in, food/packaging/value for delivery, food/waitTime/value for takeaway. The composite is computed server-side using the exact weights from Rating Integrity Part 3."

### 2. Anti-Requirement Violations Status
- Sprint 253 business-responses: Still in codebase, NOT exposed in production UI
- Sprint 257 review-helpfulness: Still in codebase, NOT exposed in production UI
- No new violations introduced in Sprints 261-265

### 3. Arch Audit #35 Summary
- **Grade: A** (11th consecutive A-range)
- 0 Critical, 0 High
- 2 Medium: In-memory stores (known, acceptable at current scale), server_dist/index.js drift
- 2 Low: Pre-existing TS errors in non-critical files, test proximity regex window sizes
- Full audit: docs/audits/ARCH-AUDIT-35.md

### 4. Test Health
- **5,273 tests** across 188 files, all passing in ~2.7s
- +21 new tests for integrity wiring (Sprint 265)
- No regressions

### 5. Sprint Roadmap 266-270

| Sprint | Focus | Constitution Principle |
|--------|-------|----------------------|
| 266 | Rating Integrity Phase 2a: Photo upload in rating flow (optional, +15% verification boost) | Rating Integrity Part 4 |
| 267 | Rating Integrity Phase 2b: Verification boost computation + Verified Visit badge | Rating Integrity Part 6 Steps 2-4 |
| 268 | Rating Integrity Phase 2c: Score breakdown API + visit-type separation display | Rating Integrity Part 9 |
| 269 | Low-data honesty: provisional badges, early-state indicators, confidence intervals | Constitution #9 |
| 270 | SLT Q3 Review + Arch Audit #36 | Process |

### 6. Revenue Update (Rachel Wei)
Rachel: "Still pre-revenue. The integrity system being live is the prerequisite for any credible marketing. You can't tell people 'our rankings are trustworthy' if the system doesn't actually weight by credibility. Now it does. Marketing Phase 1 with WhatsApp groups can start once the CEO personal seed of 15 restaurants is complete."

### 7. Architecture Assessment (Amir Patel)
Amir: "Phase 2 will need photo storage infrastructure — either S3 or a CDN solution. The rating_photos table from the Rating Integrity doc Part 7 needs to be created. Also, the dimensional scores are currently stored as q1/q2/q3 — for Phase 2b we may want explicit columns (food_score, service_score, etc.) to enable the score breakdown API. Planning a schema migration for Sprint 266."

### 8. Action Items
- [ ] Photo upload infrastructure (S3/CDN) — Sprint 266 — Amir
- [ ] Schema migration: dimensional score columns — Sprint 266 — Marcus
- [ ] CEO personal seed: 15 restaurants — Rahul (ongoing, 8/15 complete)
- [ ] Verification boost computation spec review — Sprint 267 — Nadia
- [ ] Low-data display rules from Constitution #9 — Sprint 269 — Sarah

## Closing
Marcus: "Phase 1 is done. The formula works. The owner block works. The velocity detection works. Phase 2 is about verification — making the system even harder to game by rewarding proof of visit. Stay focused on the Rating Integrity doc. It's the spec, and it's right."
