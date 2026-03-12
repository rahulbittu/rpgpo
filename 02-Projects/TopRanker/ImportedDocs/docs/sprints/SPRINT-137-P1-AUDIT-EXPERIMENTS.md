# Sprint 137 — Close P1 Audit Items + Server-Side Experiments + Input Sanitization

**Date**: 2026-03-08
**Theme**: P1 Audit Closure + Experiment Infrastructure
**Story Points**: 13
**Sprint Lead**: Sarah Nakamura
**Tests Added**: 119 (1488 total across 67 files)

---

## Mission Alignment

The external critique scored Sprint 136's core loop at 6/10 and identified three P1 gaps:
storage-layer test coverage, payment rate limiting, and server-side experiment assignment.
This sprint closes all three. Trust rankings depend on credibility math that was previously
untested — 100 new tests now verify the exact formulas that convert votes into rankings.
Server-side experiment assignment ensures bucketing parity before any feature flag activates.

---

## Team Discussion

**Marcus Chen (CTO)**: "Closing all three P1 audit items in one sprint — the team's ability
to absorb critique and execute is a competitive advantage. The server-side experiment endpoint
mirrors client DJB2 logic exactly, so we get deterministic bucketing on both sides. No more
client-only experiments that drift from what the server expects."

**Sarah Nakamura (Lead Eng)**: "100 new tests for the storage layer alone — 60 for members.ts
credibility engine, 40 for ratings.ts anomaly detection. These test the exact formulas that
determine how votes become rankings. We're not testing CRUD — we're testing the math that
makes TopRanker trustworthy."

**Amir Patel (Architecture)**: "Profile.tsx went from 1073 to 671 LOC — 6 components extracted:
ImpactCard, PaymentHistoryRow, CredibilityJourney, TierRewardsSection, NotificationPreferences,
and LegalLinksSection. SubComponents.tsx absorbed the code cleanly. Each component now has a
single responsibility and can evolve independently."

**Nadia Kaur (Cybersecurity)**: "Payment routes now have 20 req/min rate limiting, admin routes
30 req/min. Added keyPrefix to the rate limiter factory so each limiter tracks independent
counters — payment and admin don't share a bucket. Also sanitized 8 unsanitized req.query/body
params across routes.ts and routes-admin.ts. Defense in depth even with Drizzle parameterization."

**Jordan Blake (Compliance)**: "Input sanitization on city, category, and source parameters
closes the injection surface area the audit flagged. Even though Drizzle parameterizes SQL,
defense in depth matters — especially when those strings end up in logs, error messages, and
analytics pipelines where parameterization doesn't apply."

**Priya Sharma (Frontend)**: "Profile extraction was the trickiest part of this sprint.
CredibilityJourney and TierRewardsSection had deep style dependencies — shared colors, shared
spacing constants, shared animation timing. Moved all associated StyleSheet entries alongside
the components so each one is self-contained."

**Liam O'Brien (Analytics)**: "Server-side experiment assignment means we can now do proper
bucketing parity checks — client and server produce identical variants for the same
userId+experimentId. This eliminates the class of bugs where a user sees one variant on the
client but gets attributed to another in server-side analytics."

**Elena Rodriguez (Design)**: "With profile.tsx at 671 LOC, it's finally maintainable. The
component boundaries are cleaner — ImpactCard, CredibilityJourney, and TierRewardsSection
can each evolve independently. When we do the design polish sprint, we won't be fighting a
monolith."

---

## Changes

### 1. Storage-Layer Tests (P1 Audit Item #1)
- **60 tests** for `server/storage/members.ts` — credibility engine formulas, tier calculations,
  weight decay, edge cases for new/inactive/high-volume members
- **40 tests** for `server/storage/ratings.ts` — anomaly detection thresholds, duplicate
  detection, rating aggregation, time-weighted scoring
- Tests verify the core math that converts votes into trust rankings

### 2. Payment Rate Limiting (P1 Audit Item #2)
- `paymentRateLimiter` — 20 requests/min per IP on all payment routes
- `adminRateLimiter` — 30 requests/min per IP on all admin routes
- `keyPrefix` added to rate limiter factory for independent counter isolation
- Applied to `routes-payments.ts` and `routes-admin.ts`

### 3. Profile.tsx Extraction
- 1073 LOC reduced to 671 LOC (37% reduction)
- 6 components extracted to `components/profile/SubComponents.tsx`:
  - `ImpactCard` — user impact metrics display
  - `PaymentHistoryRow` — individual payment line items
  - `CredibilityJourney` — credibility score visualization with progress
  - `TierRewardsSection` — tier status and rewards breakdown
  - `NotificationPreferences` — notification settings panel
  - `LegalLinksSection` — privacy, terms, and legal links

### 4. Server-Side Experiment Assignment (P1 Audit Item #3)
- New file: `server/routes-experiments.ts`
- `GET /api/experiments` — list active experiments
- `GET /api/experiments/assign` — deterministic variant assignment using DJB2 hash
- Server-side DJB2 mirrors client-side implementation for bucketing parity
- 19 tests covering assignment determinism, variant distribution, and edge cases

### 5. Input Sanitization
- `sanitizeString` applied to 8 locations across `routes.ts` and `routes-admin.ts`
- Covers: city, category, source, and other user-supplied query/body params
- Defense in depth — protects logs, error messages, and analytics pipelines

---

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `server/storage/members.ts` | — | Tested, not modified |
| `server/storage/ratings.ts` | — | Tested, not modified |
| `server/rate-limiter.ts` | MODIFIED | keyPrefix, paymentRateLimiter, adminRateLimiter |
| `server/routes-payments.ts` | MODIFIED | Applied paymentRateLimiter middleware |
| `server/routes-admin.ts` | MODIFIED | Applied adminRateLimiter + sanitization |
| `server/routes.ts` | MODIFIED | Sanitized city/category params + experiment route registration |
| `server/routes-experiments.ts` | NEW | Server-side experiment assignment endpoint |
| `app/(tabs)/profile.tsx` | MODIFIED | 1073 to 671 LOC (6 components extracted) |
| `components/profile/SubComponents.tsx` | MODIFIED | +6 extracted components |
| `tests/sprint137-storage-members.test.ts` | NEW | 60 tests for credibility engine |
| `tests/sprint137-storage-ratings.test.ts` | NEW | 40 tests for anomaly detection |
| `tests/sprint137-experiments-api.test.ts` | NEW | 19 tests for experiment assignment |

---

## Test Summary

**1488 tests across 67 files** (+119 new), all passing in <1.1s

| Test File | Count | Coverage |
|-----------|-------|----------|
| sprint137-storage-members.test.ts | 60 | Credibility formulas, tier math, weight decay |
| sprint137-storage-ratings.test.ts | 40 | Anomaly detection, aggregation, time-weighting |
| sprint137-experiments-api.test.ts | 19 | DJB2 parity, determinism, variant distribution |

---

## External Critique Response

All 3 priorities from the Sprint 136 external critique (6/10 core-loop score) addressed:

| Priority | Status | Evidence |
|----------|--------|----------|
| Storage-layer test gaps | CLOSED | 100 new tests (members.ts + ratings.ts) |
| Payment rate limiting | CLOSED | 20 req/min payment, 30 req/min admin |
| Experiment pipeline | CLOSED | Server-side assignment with DJB2 parity |
