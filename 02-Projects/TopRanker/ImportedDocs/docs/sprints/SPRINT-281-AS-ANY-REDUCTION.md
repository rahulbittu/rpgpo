# Sprint 281: `as any` Cast Reduction

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Reduce `as any` casts from 70 to under 60 using pct() helper and CSS type fixes

## Mission
Address medium audit finding M1 (14 consecutive audits). Replace percentage string casts with the `pct()` helper from `lib/style-helpers.ts`, and remove unnecessary CSS property casts where TypeScript already accepts the literal types.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "We removed 19 casts in one sprint, dropping from 70 to 51 in production code. The pct() helper was already built in Sprint 138 but under-adopted. Today we applied it to 7 files: join.tsx, dish/[slug].tsx, DishLeaderboardSection.tsx, CookieConsent.tsx, admin/dashboard.tsx, OnboardingChecklist.tsx. That's the bulk of the percentage width casts."

**Amir Patel (Architecture):** "The CSS property casts — `textTransform: 'uppercase' as any`, `position: 'absolute' as any`, etc. — were likely added when we were on an older TypeScript or React Native types version. Current RN types accept these string literals directly. Removing CookieConsent's 5 casts and PricingBadge's 2 casts was safe and zero-risk."

**Marcus Chen (CTO):** "Going from 70 to 57 (including subdirectory counts) is meaningful progress. The remaining 34 server casts are higher-risk — `req.user`, Stripe objects, DB results. Those need proper interface augmentation, not just quick fixes. We should address those in a separate sprint with proper Express type declarations."

**Nadia Kaur (Cybersecurity):** "The `as any` casts on `req.user` in push routes are the most concerning from a security perspective. Without proper typing, we lose compile-time guarantees about what's on the request object. The server auth casts should be priority for the next type safety pass."

## Changes

### Client — pct() Adoption (14 casts removed)
- **`app/join.tsx`**: 2 percentage casts → `pct(100)`
- **`app/dish/[slug].tsx`**: 3 percentage casts → `pct(100)`
- **`components/DishLeaderboardSection.tsx`**: 3 percentage casts → `pct(100)`
- **`components/CookieConsent.tsx`**: 1 percentage + 4 CSS property casts → `pct(100)` + direct literals
- **`app/admin/dashboard.tsx`**: 4 percentage casts → `pct(48)`, `pct(1)`, computed `pct(...)`
- **`components/profile/OnboardingChecklist.tsx`**: 1 computed percentage → `pctDim(pct)`

### Client — CSS Property Cast Removal (5 casts removed)
- **`components/PricingBadge.tsx`**: `"flex-start" as any` → `"flex-start"`, `"uppercase" as any` → `"uppercase"`
- **`app/edit-profile.tsx`**: `"uppercase" as any` → `"uppercase"`
- **`components/CookieConsent.tsx`**: `"absolute"`, `"center"`, `"underline"`, `"row"` — all direct literals

### Tests
- **11 new tests** in `tests/sprint281-as-any-reduction.test.ts`
- Total cast count thresholds, pct() adoption per file, CSS cast removal verification

## Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Total `as any` (production) | 70 | 57 | -13 |
| Client-side casts | 36 | 17 | -19 |
| Server-side casts | 34 | 34 | 0 |
| Files with 0 casts | new: CookieConsent, PricingBadge, OnboardingChecklist, admin/dashboard |

## Test Results
- **202 test files, 5,548 tests, all passing** (~3.0s)
- +11 new tests from Sprint 281
- 0 regressions
