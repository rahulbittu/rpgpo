# Sprint 724 — Seed Data Integrity Validation

**Date:** 2026-03-11
**Theme:** Pre-Beta Data Quality
**Story Points:** 2

---

## Mission Alignment

The 15-restaurant seed is the foundation of every beta user's first impression. Jasmine flagged in SLT-720 that seed data is aging — prices may have changed, one restaurant may have closed. This sprint creates a validation test suite that ensures seed data integrity: structure, uniqueness, score consistency, and Phase 1 marketing alignment.

---

## Team Discussion

**Cole Anderson (Backend):** "25 tests validate every aspect of seed data integrity: uniqueness, required fields, score ranges, cuisine diversity, and the Indian restaurant seed that's critical for Phase 1 marketing."

**Jasmine Taylor (Marketing):** "The Indian restaurant seed is the most important data in the app right now. Irving, Plano, Frisco — those are the WhatsApp groups where we'll launch. If Spice Garden or Bawarchi have wrong info, we lose credibility on day one."

**Amir Patel (Architecture):** "The validation tests check structural integrity — no duplicate slugs, all businesses have coordinates and phone numbers, scores are in valid ranges. This catches data rot before it reaches beta users."

**Sarah Nakamura (Lead Eng):** "Score consistency is validated: weightedScore >= rawAvgScore for every business, all scores between 3.0-5.0, positive rank positions. These invariants protect the leaderboard from garbage data."

**Marcus Chen (CTO):** "The seed validator module (Sprint 237) validates individual records and datasets. The new tests validate the actual SEED_BUSINESSES array against the same constraints. Belt and suspenders for data quality."

**Priya Sharma (Design):** "Price range distribution is validated — all four price points ($, $$, $$$, $$$$) are represented. Beta users need to see diversity, not just expensive or cheap restaurants."

---

## Changes

| File | Change |
|------|--------|
| `__tests__/sprint724-seed-data-integrity.test.ts` | 25 tests: completeness (6), uniqueness (2), Indian seed (4), cuisine diversity (2), categories (1), score consistency (5), validator module (3), price range (1), loader (1) |

---

## Validation Coverage

| Category | Tests | What's Checked |
|----------|-------|----------------|
| Data completeness | 6 | 30+ businesses, slugs, photos, coordinates, phone numbers |
| Uniqueness | 2 | No duplicate slugs, unique identifiers |
| Indian seed (Phase 1) | 4 | 5+ Indian restaurants, Irving/Plano/Frisco neighborhoods, key restaurant names |
| Cuisine diversity | 2 | 8+ cuisines, 3+ per major cuisine |
| Score consistency | 5 | Valid ranges, weighted >= raw, positive ranks and ratings |
| Validator module | 3 | validateSeedBusiness, validateSeedDataset, duplicate detection |
| Price range | 1 | All 4 price tiers represented |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,510 pass / 536 files |

---

## What's Next (Sprint 725)

Governance: SLT-725, Audit #180, Critique 721-724.
