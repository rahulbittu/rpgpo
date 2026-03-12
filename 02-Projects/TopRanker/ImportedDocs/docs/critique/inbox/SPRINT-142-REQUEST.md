# Critique Request: Sprint 142 — Tier Semantics + E2E Product Tests + Experiment Tracking

**Previous Score:** 7/10
**Date:** 2026-03-08

---

## What Was Delivered

### 1. Tier Semantics Documentation (FRESH vs SNAPSHOT Contract)
Formal specification covering all 19 tier-touching paths. Each path classified as either:
- **FRESH** — calls `checkAndRefreshTier` before responding, guaranteeing current tier state
- **SNAPSHOT** — reads cached tier, acceptable for read-only display

Delivered as both human-readable documentation (`docs/TIER-SEMANTICS.md`) and a machine-readable `TIER_SEMANTICS` constant in `server/tier-staleness.ts`. Structural enforcement tests verify every FRESH path actually calls the refresh function.

### 2. E2E Product Path Tests (28 Tests)
Tests that prove the core product loop works end-to-end:
- **Rating → Credibility → Ranking (8 tests):** A rating flows through credibility calculation and updates the ranking position
- **Tier Promotion (6 tests):** Sufficient activity triggers tier advancement at correct thresholds
- **Vote Weight (6 tests):** Higher-tier users produce proportionally higher vote weight
- **Challenger (4 tests):** Challenger flow respects tier-weighted voting
- **Account Lifecycle (4 tests):** New account through first rating, tier change, and profile state

These tests validate the product, not just individual functions.

### 3. Experiment Measurement Tracking
Full experiment tracking pipeline:
- Enrollment with deduplication (same user/experiment returns existing variant)
- Exposure tracking (deduplicated, prevents inflation)
- Outcome tracking wired to `POST /api/ratings` (records "rated" action for enrolled users)
- `GET /api/admin/experiments/metrics` — admin endpoint returning enrollment counts, exposure counts, outcome counts, and **conversion rates per variant**

### 4. Test Suite
- **1815 tests** across 78 files (+93 new)
- 100% pass rate, <900ms execution

---

## Critique Questions

1. **Does the formal FRESH/SNAPSHOT contract satisfy the "prove tier freshness" requirement?** The previous critique scored 7/10 partly because tier freshness was implicit. We now have a formal classification for all 19 paths, machine-readable enforcement, and structural tests. Is this sufficient governance, or is there still a gap?

2. **Do E2E product path tests demonstrate core-loop validation vs audit machinery?** The previous critique noted our tests were heavy on audit/infrastructure testing. These 28 tests prove the actual product loop: rating flows through credibility into rankings, tiers promote correctly, vote weight scales with tier. Does this shift adequately address the concern?

3. **Is the experiment tracking pipeline a meaningful addition or premature infrastructure?** We shipped enrollment, exposure dedup, outcome tracking, and conversion rate calculation before having active experiments. Is this prudent preparation or building ahead of need?

4. **What would move the score from 7/10 to 8+/10?** What specific gaps remain after this sprint's deliverables?
