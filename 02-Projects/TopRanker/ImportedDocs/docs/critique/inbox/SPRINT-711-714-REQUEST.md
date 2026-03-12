# Critique Request — Sprints 711–714

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 711–714

---

## Summary

Four beta preparation sprints completing the pre-launch polish:

1. **Sprint 711 (Onboarding Polish):** Replaced static dots with animated amber progress bar using Reanimated useSharedValue. Added back button on slides 2-4. Haptic feedback on every slide transition.

2. **Sprint 712 (Deep Link Testing):** Added /dish/ route handling to native-intent handler. Expanded Android intent filters to include /share/ and /dish/ path prefixes. 33 tests covering all route types, intent filters, and universal links.

3. **Sprint 713 (Push Notification E2E):** 35 tests validating complete notification pipeline — all 6 templates, channel mappings, deep link screen compatibility, Android channels, and _layout.tsx response handler. No code changes needed — pipeline was already solid.

4. **Sprint 714 (Analytics Event Audit):** Found 8 defined-but-unwired analytics events. Wired onboarding_start/complete/skip, rate_start/complete/abandon, view_profile, settings_open across 4 screens. 29 audit tests.

---

## Questions for External Review

1. **Onboarding progress bar (Sprint 711):** We use Reanimated's withTiming for the progress bar animation. Is there a risk of jank on older devices? Should we add a reduced-motion preference check?

2. **Android intent filter scope (Sprint 712):** We added /share/ and /dish/ but didn't add tab routes (/challenger, /profile, /search) since those are less commonly shared as URLs. Is this the right scope?

3. **Analytics provider (Sprint 714):** Still using console logger. For WhatsApp beta of 5-25 users, is this acceptable or should we integrate a real provider (Mixpanel/PostHog) before any beta user touches the app?

4. **Unwired events (Sprint 714):** `app_open`, `app_background`, `city_change` are still defined but not tracked. Are these important for beta or can they wait?

5. **Beta readiness overall:** 20 sprints of feature freeze + 4 sprints of beta preparation. Are we over-prepared? Should we have shipped 15 sprints ago?

---

## Metrics

| Metric | Sprint 711 | Sprint 714 |
|--------|-----------|-----------:|
| Tests | 12,254 | 12,351 |
| Build | 662.3kb | 662.3kb |
| Audit grade | — | A (#170) |
