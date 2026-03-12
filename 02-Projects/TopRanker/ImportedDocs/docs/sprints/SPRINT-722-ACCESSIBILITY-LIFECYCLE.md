# Sprint 722 — Reduced Motion Accessibility + App Lifecycle Analytics

**Date:** 2026-03-11
**Theme:** Critique-Driven Beta Readiness
**Story Points:** 2

---

## Mission Alignment

Two remaining critique items from the 711–714 response: onboarding must respect reduced motion accessibility preferences, and app lifecycle events (app_open, app_background) must be wired for funnel analysis. Both are beta-critical — accessibility for App Store compliance, lifecycle events for understanding user retention.

---

## Team Discussion

**Priya Sharma (Design):** "Reduced motion isn't just compliance — it's respect. Users who enable reduced motion often have vestibular disorders. Our onboarding was animating progress bars and firing haptics on every slide. Now we check the preference and skip both."

**Derek Liu (Mobile):** "AccessibilityInfo.isReduceMotionEnabled() gives us the current state, and the addEventListener for reduceMotionChanged handles the edge case where a user toggles the setting while in-app. Belt and suspenders."

**Sarah Nakamura (Lead Eng):** "App lifecycle events are the most basic analytics gap we had. Without app_open and app_background, we can't measure session length, daily active users, or retention. These two events power every growth metric."

**Amir Patel (Architecture):** "The AppState listener pattern is clean — fires on mount for initial open, then listens for state transitions. Cleanup removes the listener. The Analytics.appOpen and appBackground convenience functions keep the layout code simple."

**Marcus Chen (CTO):** "Two critiques closed, zero complexity added. The reduced motion check is 6 lines. The lifecycle wiring is 8 lines. This is what critique-driven development should look like."

**Jordan Blake (Compliance):** "Apple's accessibility review can flag apps that don't respect reduced motion. This was a potential rejection risk we've now eliminated."

---

## Changes

| File | Change |
|------|--------|
| `app/onboarding.tsx` | Added AccessibilityInfo.isReduceMotionEnabled() check, skips animation + haptics when enabled |
| `app/_layout.tsx` | Added AppState listener for app_open (active) and app_background lifecycle events |
| `lib/analytics.ts` | Added Analytics.appOpen() and Analytics.appBackground() convenience functions |
| `__tests__/sprint711-onboarding-polish.test.ts` | Updated progress bar assertion for new reduced-motion conditional |
| `__tests__/sprint722-accessibility-lifecycle.test.ts` | 16 tests: reduced motion (7), lifecycle (6), convenience functions (2), loader (1) |

---

## Critique Items Closed

| Critique Finding | Status |
|------------------|--------|
| Onboarding doesn't respect reduced motion | ✅ Checks isReduceMotionEnabled, skips animation + haptics |
| app_open and app_background not wired | ✅ AppState listener fires on mount and state changes |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,473 pass / 534 files |

---

## What's Next (Sprint 723)

Remaining critique items: city_change analytics event and onboarding performance on older devices.
