# Sprint 562: Owner API Extraction — api.ts 691→550 LOC

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 23 new + 17 redirected (10,584 total across 452 files)

## Mission

Extract owner/member action API functions from lib/api.ts into `lib/api-owner.ts`. api.ts was at 691/710 LOC (97% threshold) — the second Low finding from Audit #70. This extraction reduces api.ts by 141 LOC to 550, with re-exports maintaining backward compatibility.

## Team Discussion

**Marcus Chen (CTO):** "Second extraction of the cycle, both Low findings from Audit #70 now addressed. api.ts went from 97% to 96% (550/570). Two extractions in two sprints — clean execution."

**Amir Patel (Architecture):** "141 LOC extracted — even more than the HoursEditor extraction. The pattern mirrors Sprint 524's admin extraction: move functions to a domain-specific file, re-export from api.ts. Now we have three API modules: api.ts (core), api-admin.ts (admin), api-owner.ts (owner/member actions)."

**Sarah Nakamura (Lead Eng):** "Six test redirections across 4 files: sprint192, sprint387, sprint548, sprint552, sprint554. All checked for `export async function` or `export interface` patterns that moved from api.ts to api-owner.ts. The re-exports ensure no import paths break across the codebase."

**Rachel Wei (CFO):** "The API module split makes ownership clearer. Core read functions in api.ts, admin operations in api-admin.ts, owner/member actions in api-owner.ts. Each file has a clear responsibility."

**Cole Richardson (City Growth):** "10,584 tests now. The extraction pattern is becoming second nature — extract, redirect, verify. Zero behavioral changes, just better organization."

## Changes

### New File: `lib/api-owner.ts` (198 LOC)
- Own apiFetch helper (mirrors api.ts pattern)
- Referral API: ReferralEntry, ReferralStats, fetchReferralStats, validateReferralCode
- Category suggestions: submitCategorySuggestion, CategorySuggestionItem, fetchCategorySuggestions, reviewCategorySuggestion
- Badge API: awardBadgeApi, fetchEarnedBadges, BadgeLeaderboardEntry, fetchBadgeLeaderboard
- Rating edit/delete: editRatingApi, deleteRatingApi
- Rating photos: RatingPhotoData, fetchRatingPhotos
- Owner hours: HoursUpdate, updateBusinessHours

### Modified: `lib/api.ts` (691→550 LOC, -141)
- Removed 6 interface definitions, 10 async functions, 3 section dividers
- Added re-export block: 18 named exports from api-owner.ts
- Existing admin re-exports from api-admin.ts unchanged

### Modified: `shared/thresholds.json`
- api.ts: maxLOC 710→570, current 691→550
- Added api-owner.ts: maxLOC 220, current 198

### Test Redirections (6 files)
- `sprint192-referral-ui.test.ts` — 12 assertions redirected to api-owner.ts
- `sprint387-rating-edit-delete.test.ts` — 5 assertions redirected to api-owner.ts
- `sprint548-rating-photos.test.ts` — 6 assertions redirected to api-owner.ts (+ 1 new re-export check)
- `sprint552-photo-carousel.test.ts` — 3 assertions redirected to api-owner.ts
- `sprint554-hours-update.test.ts` — 4 assertions redirected to api-owner.ts

## Test Summary

- `__tests__/sprint562-owner-api-extraction.test.ts` — 23 tests
  - Extracted file: 12 tests (exists, comment, referrals, category, badges, ratings, photos, hours, apiFetch, imports, LOC)
  - api.ts after: 8 tests (re-exports, types, functions, no inline defs, retains core, LOC bounds)
  - Thresholds: 3 tests (api.ts lowered, api-owner.ts tracked)
