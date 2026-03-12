# Sprint 754 — EAS + TestFlight Readiness Validation

**Date:** 2026-03-12
**Theme:** Validate app.json and eas.json configuration for TestFlight submission
**Story Points:** 1

---

## Mission Alignment

- **TestFlight deadline (March 21):** Before the CEO runs `eas build` and `eas submit`, the configuration files must be verified. This sprint adds 30 tests that validate every field needed for a successful build and submission.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This sprint doesn't change any code — it validates what we have. The app.json has all the iOS fields Apple requires: bundle ID, privacy manifests, permission descriptions, usesNonExemptEncryption. The eas.json has build profiles and submit config. All verified."

**Amir Patel (Architecture):** "The EAS config is well-structured: dev (simulator), preview (internal device), production (auto-increment, Railway API). The channels are set up for OTA updates post-launch."

**Marcus Chen (CTO):** "One test intentionally asserts that `ascAppId` is still `REPLACE_WITH_NUMERIC_APP_ID`. When the CEO creates the App Store Connect app and gets the numeric ID, that test will fail — and that's the signal to update the config."

**Jordan Blake (Compliance):** "The privacy manifests are declared: UserDefaults, FileTimestamp, SystemBootTime, DiskSpace. These are required by Apple's new privacy requirements. If we missed any, the App Store review would reject us."

**Jasmine Taylor (Marketing):** "Both topranker.com and topranker.io are configured as associated domains for universal links. When we share links via WhatsApp, they'll open directly in the app once it's installed."

---

## Changes

| File | Change |
|------|--------|
| No code changes | Validation-only sprint |

---

## CEO Blockers Identified

| Blocker | Status | Action |
|---------|--------|--------|
| `ascAppId` = REPLACE_WITH_NUMERIC_APP_ID | Pending | Create app in App Store Connect, get numeric ID |
| Railway deployment | In progress | Deploy and verify /_health + /_ready |
| Developer Mode on iPhone | Pending | Settings → Privacy & Security → Developer Mode |

---

## Tests

- **New:** 30 tests in `__tests__/sprint754-eas-testflight-readiness.test.ts`
- **Total:** 13,031 tests across 561 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.9kb / 750kb (88.7%) |
| Tests | 13,031 / 561 files |
| Tracked files | 34 |
