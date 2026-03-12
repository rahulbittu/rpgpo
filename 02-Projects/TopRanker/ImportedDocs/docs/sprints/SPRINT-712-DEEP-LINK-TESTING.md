# Sprint 712 — Deep Link Testing Across All Routes

**Date:** 2026-03-11
**Theme:** Beta Preparation (2 of 4)
**Story Points:** 2

---

## Mission Alignment

Deep links are how users arrive from WhatsApp shares, push notifications, and QR codes. Before beta, every shareable route must resolve correctly. This sprint adds missing routes to the native intent handler and Android intent filters, then validates all paths with 33 tests.

---

## Team Discussion

**Derek Liu (Mobile):** "Found two gaps: dish deep links weren't handled in native-intent.tsx, and Android intent filters only covered /business/ and /join. Added /dish/ route handling and expanded Android filters to include /share/ and /dish/."

**Sarah Nakamura (Lead Eng):** "33 tests covering every deep link path: business, share, dish, tabs, fallbacks, Android intent filters, iOS universal links, and URL scheme. This is the most comprehensive deep link test suite we've had."

**Amir Patel (Architecture):** "The native intent handler now covers all 5 dynamic route types: business/[id], share/[slug], dish/[slug], plus tab redirects for challenger, profile, and search/discover. Query params are stripped correctly."

**Marcus Chen (CTO):** "WhatsApp shares will be our primary user acquisition channel. Deep links must work flawlessly. This sprint closes the last gaps."

**Nadia Kaur (Cybersecurity):** "Intent filters use autoVerify:true which requires Digital Asset Links JSON at topranker.com/.well-known/assetlinks.json. We need to ensure this is deployed before Android beta."

**Priya Sharma (Design):** "The share landing page at /share/[slug] is the first thing WhatsApp users see. Good that it's now in the Android intent filter."

---

## Changes

| File | Change |
|------|--------|
| `app/+native-intent.tsx` | Added /dish/ route handling (Sprint 712) |
| `app.json` | Added /share/ and /dish/ to Android intent filters |
| `__tests__/sprint712-deep-link-testing.test.ts` | 33 tests: business, share, dish, tabs, fallback, intent filters, universal links, scheme |

---

## Deep Link Coverage Matrix

| Route Pattern | Native Intent | Android Filter | iOS Universal | Notification |
|---------------|:---:|:---:|:---:|:---:|
| /business/:id | ✅ | ✅ | ✅ | ✅ |
| /share/:slug | ✅ | ✅ (new) | ✅ | — |
| /dish/:slug | ✅ (new) | ✅ (new) | ✅ | ✅ |
| /challenger | ✅ | — | ✅ | ✅ |
| /profile | ✅ | — | ✅ | ✅ |
| /search | ✅ | — | ✅ | ✅ |
| /join | — | ✅ | ✅ | — |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,287 pass / 526 files |

---

## What's Next (Sprint 713)

Push notification end-to-end testing — verify all 6 notification templates trigger, display, and deep link correctly.
