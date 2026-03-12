# Sprint 778 — Accessibility Pass

**Date:** 2026-03-12
**Theme:** VoiceOver labels for Apple App Store review
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **TestFlight readiness:** Apple requires minimum accessibility for App Store approval
- **Constitution #3:** Everyone can use the product — accessible to screen reader users

---

## Problem

Tab bar lacked `tabBarAccessibilityLabel` — VoiceOver would only read "Rankings" instead of "Rankings tab — view restaurant leaderboards". Challenger screen had zero accessibility roles. Apple reviewers test with VoiceOver enabled.

## Fix

- Added descriptive `tabBarAccessibilityLabel` to all 4 tab bar items
- Added `accessibilityRole="header"` and `accessibilityLabel` to Challenger screen header and LIVE badge
- Validated existing accessibility on ErrorBoundary, NotFound, and NetworkBanner

---

## Team Discussion

**Derek Okonkwo (Mobile):** "Apple's accessibility audit checks tab bar labels first. Without descriptive labels, VoiceOver just reads the icon name which is meaningless."

**Victoria Ashworth (Compliance):** "Accessibility isn't just a nice-to-have — it's legally required under ADA. These labels are the minimum bar."

**Sarah Nakamura (Lead Eng):** "Good audit. The existing screens (ErrorBoundary, NotFound, NetworkBanner) already had proper roles. The tabs and challenger were the gaps."

**Marcus Chen (CTO):** "Small change, high impact. This is exactly the kind of polish that separates a professional app from a hack."

---

## Changes

| File | Change |
|------|--------|
| `app/(tabs)/_layout.tsx` | `tabBarAccessibilityLabel` on all 4 tabs |
| `app/(tabs)/challenger.tsx` | `accessibilityRole` + `accessibilityLabel` on header and LIVE badge |
| `__tests__/sprint778-accessibility.test.ts` | 15 tests |

---

## Tests

- **New:** 15 tests in `__tests__/sprint778-accessibility.test.ts`
- **Total:** 13,264 tests across 584 files — all passing
- **Build:** 665.8kb (max 750kb)
