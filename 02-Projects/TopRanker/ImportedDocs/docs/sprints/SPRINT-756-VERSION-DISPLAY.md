# Sprint 756 — Version Display in Profile

**Date:** 2026-03-12
**Theme:** Add app version + build number to profile screen for beta debugging
**Story Points:** 1

---

## Mission Alignment

- **Beta readiness:** When beta testers report issues, we need to know which version they're running. The version label in the profile screen makes this instantly visible.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Simple but essential for beta. The version label shows `TopRanker v1.0.0 (1) · ios` at the bottom of the profile. Beta testers can screenshot it when reporting bugs, and we can immediately correlate with OTA update versions."

**Jasmine Taylor (Marketing):** "This also builds transparency. Users can see we're actively updating. The label is small and unobtrusive — 11px tertiary color at the bottom of the profile scroll."

**Amir Patel (Architecture):** "We already had `APP_VERSION` and `BUILD_NUMBER` exported from `lib/app-env.ts`. And the feedback form already sends both values. This just makes them visible to the user."

**Marcus Chen (CTO):** "When we push an OTA update, the version number changes. The user can verify they're on the latest version just by scrolling to the bottom of their profile."

---

## Changes

| File | Change |
|------|--------|
| `components/profile/ProfileBottomSection.tsx` | Added version label after legal links (120→129 LOC) |

---

## Tests

- **New:** 13 tests in `__tests__/sprint756-version-display.test.ts`
- **Updated:** 1 test file for ProfileBottomSection LOC threshold
- **Total:** 13,067 tests across 563 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.9kb / 750kb (88.7%) |
| Tests | 13,067 / 563 files |
| Tracked files | 34 |
