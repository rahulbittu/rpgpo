# Sprint 789 — Remove Unused Android Permissions

**Date:** 2026-03-12
**Theme:** Remove RECORD_AUDIO permission — unnecessary and potential store rejection risk
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **App Store readiness:** Unused permissions cause review flags and unnecessary user prompts
- **Trust:** Requesting microphone access for a restaurant ranking app erodes user trust

---

## Problem

`app.json` declared `android.permission.RECORD_AUDIO` in the Android permissions list, but:

1. No code in the app records audio (audio modules only PLAY sounds)
2. Server security headers explicitly block `microphone=()` via Permissions-Policy
3. iOS side correctly has NO audio recording permission
4. Google Play would flag this as an unused sensitive permission, requiring justification

## Fix

Removed `android.permission.RECORD_AUDIO` from the Android permissions list.

---

## Team Discussion

**Derek Okonkwo (Mobile):** "RECORD_AUDIO is a dangerous permission on Android. Google Play's automated checks flag apps that declare sensitive permissions without corresponding usage. This would have been caught in review."

**Nadia Kaur (Cybersecurity):** "Principle of least privilege. Our Permissions-Policy header already blocks microphone access on web — the Android manifest should be consistent."

**Jordan Blake (Compliance):** "Every declared permission has to be justified in the App Store privacy disclosure. RECORD_AUDIO with no actual recording would be a red flag for reviewers."

**Sarah Nakamura (Lead Eng):** "Quick find — the audio modules play sounds via expo-av, they don't record. The RECORD_AUDIO was likely a copy-paste from a boilerplate."

---

## Changes

| File | Change |
|------|--------|
| `app.json` | Removed `android.permission.RECORD_AUDIO` from permissions array |
| `__tests__/sprint789-unused-permissions.test.ts` | 8 tests |

---

## Tests

- **New:** 8 tests in `__tests__/sprint789-unused-permissions.test.ts`
- **Total:** 13,347 tests across 594 files — all passing
- **Build:** 666.8kb (max 750kb)
