# Critique Request — Sprints 721–724

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 721–724

---

## Summary

Four critique-driven sprints addressing findings from the 711–714 and 716–719 external review responses:

1. **Sprint 721 (Release Hardening):** Completed iOS privacy manifest (4 API types: UserDefaults, FileTimestamp, SystemBootTime, DiskSpace). Added useRef mount guard to prevent ErrorUtils handler chain corruption. Added device model (Device.modelName, Device.brand) to feedback. Updated pre-submit-check.sh to validate 4 API types.

2. **Sprint 722 (Accessibility + Lifecycle):** Added AccessibilityInfo.isReduceMotionEnabled() to onboarding — skips animation and haptics. Wired app_open and app_background via AppState listener. Added Analytics.appOpen() and Analytics.appBackground() convenience functions.

3. **Sprint 723 (City Analytics + Splash A11y):** Wired city_change analytics in CityProvider context (fires on every city selection). Extended reduced motion to splash animation — shows content instantly with 800ms pause, no motion.

4. **Sprint 724 (Seed Data Integrity):** 25 validation tests covering data completeness, uniqueness (no duplicate slugs), Indian restaurant seed (5+ Indian restaurants in Irving/Plano/Frisco), cuisine diversity (8+ cuisines, 3+ per major cuisine), score consistency (weighted >= raw, valid ranges), and price range distribution.

---

## Questions for External Review

1. **Privacy manifest reason codes (Sprint 721):** We used DDA9.1 (FileTimestamp), 35F9.1 (SystemBootTime), E174.1 (DiskSpace). Are these the correct reason codes for Expo's usage patterns, or should we use different reasons?

2. **ErrorUtils mount guard (Sprint 721):** The useRef guard prevents re-installation on StrictMode double-mount. Is there an edge case where the guard could prevent legitimate re-installation after a true unmount/remount cycle?

3. **Reduced motion coverage (Sprints 722–723):** We cover onboarding and splash. Individual screen entering animations (Reanimated FadeInDown, etc.) still fire. Is this an App Store rejection risk, or is covering the main animated surfaces sufficient?

4. **Analytics provider (Sprint 722):** Events still log to console. The critique has flagged this twice. Should this be a pre-beta blocker, or is console logging acceptable for a 5-25 user beta?

5. **Seed data freshness (Sprint 724):** Tests validate structure but can't verify real-world accuracy. What's the minimum viable verification process before the WhatsApp launch?

---

## Metrics

| Metric | Sprint 721 | Sprint 724 |
|--------|-----------:|-----------:|
| Tests | 12,457 | 12,510 |
| Build | 662.3kb | 662.3kb |
| Audit grade | — | A (#180) |
| Critique items closed | 3/6 | 6/6 |
