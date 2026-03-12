# Sprint 163: Rate Gate Analytics + Rating Sanitization E2E Tests

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Track why ratings are rejected, validate sanitization end-to-end

---

## Mission Alignment
If we don't know WHY ratings are being rejected, we can't tune the gating. Rate gate analytics close the feedback loop: rate → gate → measure → adjust. The sanitization E2E test ensures the Sprint 162 fix (parsed.data.score → q1/q2/q3) stays correct forever.

---

## Team Discussion

**Rachel Wei (CFO):** "We've been gating new accounts for 3 days and blocking duplicates, but we have zero data on how often these gates fire. If 40% of attempted ratings are being blocked by the age gate, that's a growth problem. Now we'll see it in the admin dashboard."

**Sarah Nakamura (Lead Eng):** "Five new FunnelEvent types: rating_submitted, rating_rejected_account_age, rating_rejected_duplicate, rating_rejected_suspended, rating_rejected_unknown. Clean extension of the existing analytics buffer — no new infrastructure needed."

**Jasmine Taylor (Marketing):** "The rejection rate metric is exactly what I need. If we're losing potential raters to the 3-day age gate, I need to know the magnitude before we discuss adjusting it. Data first, decisions second."

**Amir Patel (Architecture):** "getRateGateStats() computes on the fly from the existing circular buffer — no new storage, no new tables. The admin endpoint follows the same pattern as the other analytics endpoints. Simple and consistent."

**Nadia Kaur (Cybersecurity):** "The sanitization E2E test validates every edge case: NaN, null, undefined, objects, strings, boundary values. This is the kind of test that would have caught the parsed.data.score bug before it went live."

**Marcus Chen (CTO):** "This was a P1 from SLT-160 (rate gate analytics). Shipping it alongside the sanitization E2E test from RETRO-162's action items. Two birds, one sprint."

---

## Changes

### Rate Gate Analytics Events
- **File:** `server/analytics.ts`
- Extended `FunnelEvent` union with 5 new events: `rating_submitted`, `rating_rejected_account_age`, `rating_rejected_duplicate`, `rating_rejected_suspended`, `rating_rejected_unknown`
- Added `getRateGateStats()` — computes total submissions, total rejections, rejection rate %, breakdown by reason, recent 20 rejections

### Rate Gate Tracking in Rating Handler
- **File:** `server/routes.ts:615-628`
- Each catch branch now calls `trackEvent()` with the appropriate rejection reason
- Successful ratings track both `first_rating` (existing) and `rating_submitted` (new)

### Admin Rate Gate Stats Endpoint
- **File:** `server/routes-admin.ts`
- New `GET /api/admin/rate-gate-stats` — returns structured rejection analytics
- Uses existing requireAuth + requireAdmin middleware

### Rating Sanitization E2E Tests
- **File:** `tests/sprint163-rate-gate-analytics.test.ts`
- 28 tests covering:
  - Event tracking for all 5 rejection types
  - getRateGateStats computation (0%, 20%, 100% rejection rates)
  - sanitizeNumber edge cases (NaN, null, undefined, boundaries)
  - Structural verification: routes.ts tracks all rejection reasons
  - Structural verification: sanitization uses q1Score/q2Score/q3Score (not .score)

---

## Test Results
- **2199 tests** across 98 files — all passing, 1.60s
- 28 new tests added this sprint

---

## SLT Backlog Progress
- [x] **P1:** Rate gate analytics tracking (SLT-160, Sprint 162 target → delivered Sprint 163)
- [x] **Action Item:** End-to-end rating sanitization test (RETRO-162)
