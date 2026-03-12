# Sprint 723 — City Change Analytics + Splash Reduced Motion

**Date:** 2026-03-11
**Theme:** Critique-Driven Beta Readiness
**Story Points:** 2

---

## Mission Alignment

Final critique items from the 711–714 and 716–719 responses: the city_change analytics event was defined but never wired, and the splash animation didn't respect reduced motion. Both closed in this sprint.

---

## Team Discussion

**Derek Liu (Mobile):** "city_change is one of the most important analytics events for a multi-city app. When we expand beyond Dallas, this tells us which cities users actually explore. Wiring it in the context provider means every city picker automatically tracks."

**Priya Sharma (Design):** "Splash reduced motion completes the accessibility pass. Users with vestibular disorders no longer see the crown bounce, ring expand, or zoom exit. They see the splash content immediately with a brief pause, then proceed to the app."

**Sarah Nakamura (Lead Eng):** "The splash reduced motion path is elegant — set all values to their final state instantly, pause 800ms so the branding is visible, then fade out. No jarring motion, but the user still sees the brand."

**Amir Patel (Architecture):** "Wiring city_change in the context provider rather than in individual city pickers is the right pattern. Single source of truth means we can't miss a tracking call."

**Marcus Chen (CTO):** "All 6 critique items from the last two responses are now closed. The external review process has driven 3 sprints of targeted, high-value work."

**Jordan Blake (Compliance):** "Full reduced motion coverage across onboarding and splash. This puts us in good standing for Apple's accessibility review."

---

## Changes

| File | Change |
|------|--------|
| `lib/city-context.tsx` | Added city_change analytics tracking in setCity callback |
| `app/_layout.tsx` | Added AccessibilityInfo check + reduceMotion prop to AnimatedSplash |
| `app/_layout.tsx` | Splash skips all animations when reduced motion enabled |
| `__tests__/sprint723-city-analytics-splash-a11y.test.ts` | 12 tests: city change (4), splash reduced motion (8) |

---

## Critique Items Closed (All 6/6)

| Critique Finding | Sprint | Status |
|------------------|--------|--------|
| Privacy manifest incomplete | 721 | ✅ |
| ErrorUtils handler chain corruption | 721 | ✅ |
| Device model missing from feedback | 721 | ✅ |
| Onboarding doesn't respect reduced motion | 722 | ✅ |
| app_open / app_background not wired | 722 | ✅ |
| city_change not wired + splash reduced motion | 723 | ✅ |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,485 pass / 535 files |

---

## What's Next (Sprint 724)

Seed data validation — verify 15-restaurant seed is still accurate before WhatsApp Week 2 rollout.
