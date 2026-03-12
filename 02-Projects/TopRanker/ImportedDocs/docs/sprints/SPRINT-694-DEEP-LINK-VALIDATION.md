# Sprint 694 — Deep Link Validation

**Date:** 2026-03-11
**Theme:** End-to-End Notification Deep Link Path Testing
**Story Points:** 3

---

## Mission Alignment

Notification deep links are the primary re-engagement mechanism. If a user taps "How was Biryani Palace?" and lands nowhere, we've broken trust AND lost an engagement. This sprint validates that every notification template produces data compatible with the deep link handler, and fixes a mismatch found in the `ratingReminder` template.

---

## Team Discussion

**Marcus Chen (CTO):** "This is the kind of bug that only shows up in production with real push notifications. The ratingReminder template was sending `screen: 'business/biryani-palace'` but the handler expected `screen: 'business'` + `slug: 'biryani-palace'` as separate fields. Tapping the notification would have silently done nothing."

**Sarah Nakamura (Lead Eng):** "The fix is one line — change `screen: \`business/\${slug}\`` to `screen: 'business', slug: businessSlug`. But the real value is the 36 tests that now validate template-handler compatibility. Every template's screen value is checked against the valid screen list. Every handler branch is verified to exist."

**Nadia Kaur (Security):** "The `isValidDeepLinkScreen` type guard prevents arbitrary navigation. A malicious push notification can't inject `screen: 'admin'` to navigate to admin screens. The guard rejects any value not in the allowlist."

**Amir Patel (Architecture):** "The compatibility matrix test is the most valuable — it iterates all 5 valid screens and confirms each has a handler, then scans all templates and confirms each uses only valid screens. This is a contract test between two separate files."

---

## Changes

| File | Change |
|------|--------|
| `lib/notifications.ts` | Fixed ratingReminder: `screen: "business", slug: businessSlug` (was compound path) |

### Bug Fix

**Before (broken):**
```typescript
data: { screen: `business/${businessSlug}` }
// isValidDeepLinkScreen("business/biryani-palace") → false → silent failure
```

**After (fixed):**
```typescript
data: { screen: "business", slug: businessSlug }
// isValidDeepLinkScreen("business") → true → router.push to /business/[id]
```

### Template-Handler Compatibility Matrix

| Template | Screen | Extra Data | Handler Branch | Status |
|----------|--------|-----------|---------------|--------|
| tierUpgrade | profile | — | `screen === "profile"` | Valid |
| challengerResult | challenger | — | `screen === "challenger"` | Valid |
| challengerStarted | challenger | — | `screen === "challenger"` | Valid |
| weeklyDigest | profile | — | `screen === "profile"` | Valid |
| dripReminder | search | — | `screen === "search"` | Valid |
| ratingReminder | business | slug | `screen === "business" && slug` | **Fixed Sprint 694** |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,022 pass / 512 files |

---

## What's Next (Sprint 695)

Governance sprint: SLT-695, Arch Audit #150, critique request for 691-694.
