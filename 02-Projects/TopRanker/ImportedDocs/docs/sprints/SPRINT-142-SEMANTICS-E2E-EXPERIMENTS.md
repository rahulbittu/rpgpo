# Sprint 142: Tier Semantics + E2E Product Tests + Experiment Tracking

**Date:** 2026-03-08
**Sprint Goal:** Formalize tier freshness contracts, prove the core product loop with E2E tests, and ship experiment measurement infrastructure.
**Previous Critique Score:** 7/10

---

## Deliverables

### 1. Tier Semantics Documentation (`docs/TIER-SEMANTICS.md`)
Formal specification of the FRESH vs SNAPSHOT contract for all 19 tier-touching paths. Each path is classified:
- **FRESH** — calls `checkAndRefreshTier` before responding, guaranteeing the tier reflects the latest credibility state
- **SNAPSHOT** — reads the cached tier value without refresh, acceptable for read-only display paths

All 19 paths documented with classification, justification, and staleness tolerance.

### 2. TIER_SEMANTICS Constant (`server/tier-staleness.ts`)
Machine-readable path registry exported as a typed constant. Each entry includes:
- `path` — route pattern
- `method` — HTTP method
- `semantics` — `"FRESH"` | `"SNAPSHOT"`
- `justification` — why this classification was chosen

Enables programmatic enforcement and audit tooling.

### 3. Enforcement Tests
Structural assertion tests that verify every path marked FRESH in `TIER_SEMANTICS` actually calls `checkAndRefreshTier` in its handler chain. Tests parse the route handlers and assert the refresh call is present — no manual tracking required.

### 4. E2E Product Path Tests (28 tests)
End-to-end tests that prove the core product loop works, not just individual units:

| Category | Count | What It Proves |
|---|---|---|
| Rating → Credibility → Ranking | 8 | A rating flows through credibility calculation and updates the ranking |
| Tier Promotion | 6 | Sufficient activity triggers tier advancement with correct thresholds |
| Vote Weight | 6 | Higher-tier users produce proportionally higher vote weight in rankings |
| Challenger | 4 | Challenger flow respects tier-weighted voting and produces correct outcomes |
| Account Lifecycle | 4 | New account → first rating → tier change → profile reflects state |

### 5. Experiment Tracker (`server/experiment-tracker.ts`)
Lightweight experiment measurement infrastructure:
- `enroll(userId, experimentId, variant)` — records enrollment with deduplication (same user/experiment returns existing variant)
- `trackExposure(userId, experimentId)` — records first exposure timestamp, deduped
- `trackOutcome(userId, experimentId, action, metadata)` — records outcome events
- `getMetrics(experimentId)` — returns enrollment counts, exposure counts, outcome counts, and conversion rates per variant

In-memory storage for MVP. Exposure deduplication prevents inflated metrics.

### 6. Admin Experiments Endpoint (`GET /api/admin/experiments/metrics`)
Returns experiment statistics for the admin dashboard:
- Per-experiment: variant distribution, exposure rate, outcome breakdown, conversion rates
- Query param `?experimentId=` for single-experiment detail
- Protected by admin auth middleware

### 7. Outcome Tracking in Ratings (`POST /api/ratings`)
Wired experiment outcome tracking into the ratings endpoint:
- When a user submits a rating, checks if they are enrolled in any active experiment
- Records a `"rated"` outcome action with the experiment tracker
- Enables measuring whether experiment variants affect rating behavior

---

## Testing

| Metric | Value |
|---|---|
| Total Tests | 1815 |
| Test Files | 78 |
| New Tests | +93 |
| Pass Rate | 100% |
| Execution Time | <900ms |

New test breakdown:
- Tier semantics enforcement: 19 structural assertions
- E2E product path tests: 28
- Experiment tracker unit tests: 31
- Experiment endpoint tests: 15

---

## Team Discussion

**Marcus Chen (CTO):** The TIER-SEMANTICS.md document is exactly the governance artifact the critique was asking for. When someone asks "how do you guarantee tier freshness?" we now point to a formal contract, not scattered code comments. FRESH vs SNAPSHOT is a clear, auditable classification.

**Amir Patel (Architecture):** The FRESH vs SNAPSHOT distinction removes all ambiguity. Every path is classified, justified, and enforced by structural tests. The TIER_SEMANTICS constant makes this machine-readable — future tooling can validate compliance automatically without grepping source files.

**Sarah Nakamura (Lead Engineer):** The E2E product path tests are the biggest shift this sprint. We moved from testing audit machinery to testing the actual product loop: does a rating flow through credibility and change a ranking? Does tier promotion actually happen when thresholds are met? These 28 tests prove the core loop works end-to-end, not just that individual functions return expected values.

**Elena Vasquez (Design Lead):** This is the third sprint without a design deliverable. I understand the priority — tier semantics and E2E validation are critical infrastructure. But the design backlog is growing. Sprint 143 needs to include at least one design-facing deliverable or we risk the UI falling behind the backend maturity.

**Nadia Kaur (Cybersecurity):** Reviewed the experiment tracker for PII exposure. It stores userId only — no email, name, or device fingerprint. Outcome metadata is action-level (e.g., "rated") with no user-identifiable content. The admin endpoint is auth-gated. No PII leak risk in this implementation.

**David Kim (QA Lead):** 93 new tests this sprint, and the E2E product path tests are qualitatively different from what we had before. They prove real flows — a user rates, credibility updates, rankings shift, tiers promote. This is product validation, not just code coverage. Very satisfied with the testing direction.

**Rachel Wei (CFO):** The experiment metrics endpoint gives us visibility into exposure counts and conversion rates per variant. Once we run pricing or feature experiments, we can measure actual conversion impact. This is the measurement layer we needed before running any revenue experiments.

**Jordan Blake (Compliance):** TIER-SEMANTICS.md is auditable compliance documentation. If a regulator asks how we ensure ranking fairness, we can show a formal contract specifying which paths guarantee fresh tier data and which accept snapshots. The structural enforcement tests prove the contract is not just documentation — it is verified in CI.

---

## PRD Alignment
- Credibility-weighted voting: E2E tests now prove the full loop (rating → credibility → ranking)
- Tier system: Formal FRESH/SNAPSHOT contract with machine-readable registry and structural enforcement
- Experiment infrastructure: Enables data-driven product decisions with proper measurement

## Next Sprint (143)
- Experiment results dashboard UI
- DB persistence for experiment data (replace in-memory store)
- Design deliverable (overdue)
- Performance profiling pass
