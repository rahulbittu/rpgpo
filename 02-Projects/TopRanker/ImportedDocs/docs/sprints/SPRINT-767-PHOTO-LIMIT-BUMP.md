# Sprint 767 — Photo Limit Bump: 5 Photos Per Restaurant

**Date:** 2026-03-12
**Theme:** Increase API photo limit from 3 to 5 per restaurant
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Rich experience (CEO feedback):** "I want to see rich things." The leaderboard was capped at 3 photos per restaurant despite storing 5. Bumping to 5 fills the photo strip completely.

---

## Problem

`getBusinessPhotosMap()` in `server/storage/photos.ts` had `length < 3` cap. Sprint 765 stored up to 5 Google Places photos per restaurant, but only 3 were served to the app.

## Fix

Changed `length < 3` to `length < 5`. Now all stored photos are available in the API response.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The 3-photo cap was from early days when we only had Unsplash placeholders. With real Google photos, more is better."

**Jasmine Taylor (Marketing):** "Photo strips are the first thing users see. 5 real photos vs 3 stock photos is a night-and-day difference for first impressions."

**Marcus Chen (CTO):** "Simple change, measurable impact. The swipeable photo strip now has 60% more content."

---

## Changes

| File | Change |
|------|--------|
| `server/storage/photos.ts` | Changed photo limit from 3 to 5 in `getBusinessPhotosMap()` |

---

## Tests

- **New:** 4 tests in `__tests__/sprint767-photo-limit-bump.test.ts`
- **Total:** 13,167 tests across 574 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.4kb / 750kb (88.7%) |
| Tests | 13,167 / 574 files |
| topranker.io | LIVE |
