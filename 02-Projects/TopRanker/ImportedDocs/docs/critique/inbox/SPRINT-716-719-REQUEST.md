# Critique Request — Sprints 716–719

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 716–719

---

## Summary

Four post-beta infrastructure sprints:

1. **Sprint 716 (TestFlight Submission Support):** Added iOS privacy manifest (NSPrivacyAccessedAPICategoryUserDefaults with CA92.1 reason). Created pre-submit-check.sh validation script. Made ASC App ID placeholder explicit.

2. **Sprint 717 (Crash Analytics):** Wired global error handler via ErrorUtils in _layout.tsx. Added breadcrumb tracking for notification taps. Sentry abstraction buffers 50 breadcrumbs, routes to captureException when initialized.

3. **Sprint 718 (Performance Monitoring):** New perf-tracker.ts module with markAppStart/markAppReady, recordApiCall, recordScreenMount, and startMark. Wired startup timing in _layout.tsx splash flow.

4. **Sprint 719 (Feedback Collection):** Enhanced feedback form with device context (platform, OS, version, build number). Added haptic feedback on all interactions. Tracks feedback_submitted analytics event.

---

## Questions for External Review

1. **Privacy manifest (Sprint 716):** We only declared UserDefaults. expo-image, expo-notifications, and expo-location may also use APIs that require declaration. Should we audit all Expo packages for additional required API types?

2. **Global error handler (Sprint 717):** We capture the original ErrorUtils handler and restore it on cleanup. Is there a risk of handler chain corruption if multiple error boundary HOCs mount/unmount?

3. **Performance tracking (Sprint 718):** We buffer API times in memory (200 samples). For a beta of 5-25 users, is this sufficient or should we persist to AsyncStorage for cross-session analysis?

4. **Feedback device context (Sprint 719):** We send OS version and build number with feedback. Should we also capture device model (iPhone 15, Pixel 8) for hardware-specific bug reports?

5. **Code freeze recommendation:** The lead engineer formally recommends full code freeze until beta users are live. The marketing team notes seed data is going stale. Is this the right tradeoff?

---

## Metrics

| Metric | Sprint 716 | Sprint 719 |
|--------|-----------:|-----------:|
| Tests | 12,382 | 12,439 |
| Build | 662.3kb | 662.3kb |
| Audit grade | — | A (#175) |
