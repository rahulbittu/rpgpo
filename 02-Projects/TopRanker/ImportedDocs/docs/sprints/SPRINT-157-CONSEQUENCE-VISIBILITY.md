# Sprint 157: Core Loop Consequence Visibility

**Date:** 2026-03-09
**Story Points:** 8
**Focus:** Make the consequence of rating VISIBLE — the missing link in the core loop

---

## Mission Alignment
Rate → consequence → ranking. The "consequence" step was technically working (scores recalculate, ranks update) but **users couldn't see it**. SSE was broadcasting to wrong query keys, and there was no "your vote mattered" feedback when returning to a business page.

---

## Team Discussion

**Marcus Chen (CTO):** "The SSE query key mismatch is a P0 — we've had real-time updates since Sprint 97, but they've been silently broken since we moved to semantic query keys. Rankings weren't refreshing on rating submission."

**Sarah Nakamura (Lead Eng):** "The fix is simple: SSE was invalidating `['/api/leaderboard']` but React Query uses `['leaderboard', city, category]`. Prefix matching only works if the key starts the same way. This was broken for leaderboard, trending, challengers, and businesses."

**Amir Patel (Architecture):** "The rating impact banner is lightweight — 40 lines of code, in-memory Map with 60-second TTL, no persistence. It only shows when you return to a business you just rated and the rank actually changed."

**Jasmine Taylor (Marketing):** "This is the feedback loop that makes rating addictive. Users rate, see their rank change on the confirmation screen, navigate back, and see 'Your rating moved this from #5 to #4.' That's the dopamine hit."

**Priya Sharma (Design):** "The banner is green (#1B5E20), with trending-up/down icon. Auto-dismisses after 10 seconds. Doesn't clutter the page but gives clear immediate feedback."

---

## Changes

### P0: Fix SSE Query Key Mismatch
- **File:** `lib/use-realtime.ts:25-31`
- **Root cause:** INVALIDATION_MAP used `/api/leaderboard`, `/api/trending`, etc. but actual queryKeys are `["leaderboard", city, category]`, `["trending", city]`, etc.
- **Fix:** Changed all keys to match: `["leaderboard"]`, `["trending"]`, `["challengers"]`, `["business"]`, `["featured"]`
- **Also fixed:** Native fallback polling (15s interval) had same mismatch
- **Impact:** Real-time ranking updates now actually work across all surfaces

### P1: "Your Rating Moved This" Banner
- **New file:** `lib/rating-impact.ts` — in-memory store with 60s TTL
- **Modified:** `app/rate/[id].tsx` — stores rank impact from API response on success
- **Modified:** `app/business/[id].tsx` — renders green impact banner with rank change
- **UX:** Banner shows "Your rating moved this from #5 to #4" with trending icon, auto-dismisses after 10s
- **Scope:** Only shows when rank actually changed (prevRank !== newRank)

### P1: SSE now invalidates challengers on rating_submitted
- Challenger cards refresh when any rating is submitted (votes may affect active challenges)

---

## Test Results
- **2147 tests** across 94 files — all passing, 1.60s
- +14 new tests: SSE key validation (6), rating impact module (5), business detail integration (3)

---

## Core Loop Status After This Sprint

| Stage | Before | After |
|-------|--------|-------|
| Rate | Working ✅ | Working ✅ |
| Consequence (server) | Working ✅ | Working ✅ |
| Consequence (visible) | Broken ❌ (SSE mismatch) | Fixed ✅ |
| Rankings refresh | Polling-only | Real-time via SSE ✅ |
| "Your vote mattered" | Only on confirmation screen | + Business detail banner ✅ |
