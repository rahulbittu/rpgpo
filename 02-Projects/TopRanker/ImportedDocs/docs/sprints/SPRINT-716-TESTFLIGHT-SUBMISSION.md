# Sprint 716 — TestFlight Submission Support

**Date:** 2026-03-11
**Theme:** Post-Beta Launch Infrastructure (1 of 4)
**Story Points:** 2

---

## Mission Alignment

Reduce friction for TestFlight submission. Add iOS privacy manifest (Apple requirement since Spring 2024), create a pre-submission checklist script, and make the `ascAppId` placeholder explicit so it's obvious what needs to be replaced.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The privacy manifest is now an Apple requirement. Without it, App Store review will reject or flag the build. We declare UserDefaults usage (AsyncStorage) with reason CA92.1 — accessing user preferences."

**Derek Liu (Mobile):** "The pre-submit-check.sh script validates 10+ items: bundle ID, version, encryption, privacy manifest, ASC App ID, Apple Team ID, tests passing, build size, and documentation presence. Run it before every `eas submit`."

**Amir Patel (Architecture):** "Changed `ascAppId` from 'topranker' (which was a string placeholder) to 'REPLACE_WITH_NUMERIC_APP_ID'. This makes it obvious that the CEO needs to create the app in App Store Connect first and paste the numeric ID."

**Marcus Chen (CTO):** "This sprint reduces the CEO's submission burden. Run the script, fix any red items, submit. No guessing."

**Nadia Kaur (Cybersecurity):** "Privacy manifest declares only UserDefaults. We don't use file timestamp, system boot time, or disk space APIs that Apple also requires declaring. Clean."

**Rachel Wei (CFO):** "Appreciate the explicit placeholder. It's now clear what's CEO-blocked: create app in App Store Connect → get numeric ID → paste into eas.json → run script → submit."

---

## Changes

| File | Change |
|------|--------|
| `app.json` | Added `privacyManifests` with UserDefaults API declaration |
| `eas.json` | Changed `ascAppId` to explicit REPLACE_WITH_NUMERIC_APP_ID placeholder |
| `scripts/pre-submit-check.sh` | Pre-submission validation script (10+ checks) |
| `__tests__/sprint716-testflight-submission.test.ts` | 31 tests: privacy manifest, submission fields, build profiles, OTA config |

---

## CEO Submission Checklist

1. Create app in App Store Connect → get numeric App ID
2. Replace `REPLACE_WITH_NUMERIC_APP_ID` in `eas.json`
3. Run `./scripts/pre-submit-check.sh`
4. Fix any red items
5. Run `npx eas-cli@latest build --profile production --platform ios`
6. Run `npx eas-cli@latest submit --platform ios`

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,382 pass / 529 files |

---

## What's Next (Sprint 717)

Crash analytics integration — Sentry or Bugsnag setup for production error monitoring.
