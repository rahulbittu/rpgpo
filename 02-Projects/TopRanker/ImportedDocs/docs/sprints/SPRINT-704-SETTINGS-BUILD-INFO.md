# Sprint 704 — Settings Build Info for Beta

**Date:** 2026-03-11
**Theme:** Beta Readiness
**Story Points:** 1

---

## Mission Alignment

Beta testers need to report which build they're using when they find bugs. The settings About section only showed the version number. This sprint adds build number (from Expo Constants) and environment indicator (Local vs Production) so bug reports always include environment context.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "When a beta tester screenshots their settings screen, we now see version, build number, and environment in one place. No more asking 'which build are you on?' in WhatsApp threads."

**Derek Liu (Mobile):** "Uses `expo-constants` to pull build number from the native config — works for both iOS and Android. Falls back to 'dev' for local development."

**Amir Patel (Architecture):** "The environment detection is simple — checks if the API URL contains 'localhost'. Production shows 'Production', local dev shows 'Local'. No new dependencies, just uses the existing `getApiUrl` function."

**Jasmine Taylor (Marketing):** "When we start WhatsApp beta, I can tell testers: 'Open Settings → scroll to About → screenshot it' for any bug report. One screenshot captures everything."

---

## Changes

| File | Change |
|------|--------|
| `app/settings.tsx` | Added `expo-constants` import |
| `app/settings.tsx` | Added Build number row in About section |
| `app/settings.tsx` | Added Environment indicator (Local/Production) |
| `__tests__/sprint537-settings-extraction.test.ts` | Updated LOC threshold (370→380) |
| `__tests__/sprint704-settings-build-info.test.ts` | 17 tests for build info, existing features, accessibility |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,171 pass / 520 files |

---

## What's Next (Sprint 705)

Governance (SLT-705, Audit #160, critique 701-704).
