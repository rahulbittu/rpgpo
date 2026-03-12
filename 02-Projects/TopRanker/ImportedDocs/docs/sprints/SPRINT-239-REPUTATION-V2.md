# Sprint 239 — Member Reputation Scoring v2

**Date**: 2026-03-09
**Theme**: Multi-Signal Reputation Engine + Admin Tooling
**Story Points**: 8
**Tests Added**: 36 (across static, runtime, admin routes, integration)

---

## Mission Alignment

Credibility-weighted voting is the core of TopRanker's trust model — not all votes are
equal. Sprint 239 introduces Reputation Scoring v2, a multi-signal engine that evaluates
members across 7 dimensions: rating count, rating consistency with consensus, account age,
email verification, profile completeness, helpful votes received, and report penalties.
Each signal is weighted, normalized, and combined into a 0-100 score that maps to one of
five tiers: newcomer, contributor, trusted, expert, authority. This replaces the simple
credibility score with a nuanced, auditable reputation model that directly serves the
trust mission.

---

## Team Discussion

**Marcus Chen (CTO)**: "Reputation scoring is the backbone of our credibility promise.
The v1 system was a single-dimensional credibility score — useful for launch, but too
blunt for a platform that wants to be the trusted standard. V2 gives us 7 distinct
signals with explicit weights, which means we can explain to users exactly why their
vote carries the weight it does. This transparency is a competitive moat — Yelp and
Google cannot explain their ranking algorithms. We can, and that is the TrustMe
differentiator."

**Sarah Nakamura (Lead Engineer)**: "The module follows our proven pattern: in-memory
Map with FIFO eviction at 5000 entries, pure exported functions, no database dependency.
The signal normalization is intentionally simple — linear scaling to known thresholds.
We could add sigmoid curves or log scaling later, but linear is interpretable and
debuggable. The report_penalty signal is the only negative contributor, which correctly
means that flagged users see their reputation degrade. The admin routes give ops
visibility into the reputation distribution across tiers."

**Amir Patel (Architecture)**: "The weight vector sums to exactly 1.0, which is a hard
invariant enforced by tests. This means the theoretical maximum score is 100 (all
positive signals maxed, zero penalties) and the minimum is below 0 (clamped to 0). The
tier thresholds are contiguous and non-overlapping — the test suite verifies this with
arithmetic checks on adjacent boundaries. If we ever add a new signal, the weights must
be rebalanced to maintain the 1.0 sum. I would recommend adding a startup assertion for
this in a future sprint."

**Cole Anderson (City Growth)**: "As we onboard Memphis and Nashville businesses, the
reputation system becomes the quality filter for reviews in new markets. Early adopters
in new cities will naturally be newcomers — low rating count, recent account age. The
tier system gives them a clear progression path: rate more businesses, verify your email,
complete your profile, and your influence grows. This gamification loop is what drives
engagement in new markets. I want to surface tier progression prominently in the city
launch onboarding flow."

**Jasmine Taylor (Marketing)**: "The five-tier naming — newcomer through authority — is
marketing-ready. We can build badge designs, email campaigns for tier upgrades, and
social sharing around 'I just reached Expert status on TopRanker.' The naming is
aspirational without being exclusionary. I would like to add a tier color palette in
Sprint 240: bronze, silver, gold, platinum, diamond — mapped to our brand system. The
tier badge becomes a status symbol that users display on their profiles."

**Rachel Wei (CFO)**: "Reputation tiers create natural upsell opportunities. Authority-tier
members could be offered early access to Challenger creation at the $99 price point.
Expert-tier members might be eligible for a 'Trusted Reviewer' badge that businesses
see when reading their reviews — increasing the perceived value of Business Pro
subscriptions. The reputation engine is not just a trust feature; it is a monetization
lever. I want to model the conversion funnel from tier upgrade to paid feature adoption
in Q2 revenue projections."

---

## Changes

### New Files
- `server/reputation-v2.ts` — Multi-signal reputation engine: 7 signals, weighted scoring, 5 tiers, cache with FIFO eviction
- `server/routes-admin-reputation.ts` — 4 admin endpoints: stats, leaderboard, member lookup, tier thresholds
- `tests/sprint239-reputation-v2.test.ts` — 36 tests (12 static + 14 runtime + 6 admin + 4 integration)

### Modified Files
- `server/routes.ts` — Import and register admin reputation routes

---

## PRD Gap Status

- **Credibility-Weighted Voting** — Now backed by multi-signal reputation engine (was single-dimension)
- **Member Tiers** — 5 named tiers with explicit score boundaries (was implicit)
- **Admin Reputation Dashboard** — New endpoints for stats, leaderboard, and member lookup

---

## Open Items

| Item | Owner | Target Sprint |
|------|-------|---------------|
| Surface tier progression in city launch onboarding | Cole Anderson | 240 |
| Tier color palette and badge designs | Jasmine Taylor | 240 |
| Model tier-to-revenue conversion funnel | Rachel Wei | 241 |
| Startup assertion for weight sum invariant | Amir Patel | 241 |
| Database-backed reputation when scale demands | Sarah Nakamura | TBD |
