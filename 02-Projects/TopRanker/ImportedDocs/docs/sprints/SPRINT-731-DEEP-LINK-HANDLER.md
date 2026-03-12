# Sprint 731 — Deep Link Handler + URL Scheme

**Date:** 2026-03-11
**Theme:** Beta Readiness — Shareable Links
**Story Points:** 2

---

## Mission Alignment

"Best biryani in Irving" links need to open the app directly on the business page. Universal links (`https://topranker.com/business/biryani-palace`) and custom scheme links (`topranker://business/biryani-palace`) both need to navigate correctly. This sprint wires the URL listener, adds `topranker.io` domain support, and tracks deep link opens via analytics.

---

## Team Discussion

**Derek Liu (Mobile):** "Universal links are the gold standard for iOS. When someone taps a topranker.com link in WhatsApp, iOS opens the app directly instead of Safari. This is critical for the WhatsApp-first marketing strategy."

**Jasmine Taylor (Marketing):** "Every share link we generate — from ratings, search, dish leaderboards — now actually works as a deep link. A user shares 'Best biryani in Irving' in a WhatsApp group, someone taps it, and they land on that exact business page."

**Sarah Nakamura (Lead Eng):** "The implementation uses Expo's Linking API with both `addEventListener` for hot links and `getInitialURL()` for cold-start links. Analytics and breadcrumbs are wired for every deep link open."

**Amir Patel (Architecture):** "Adding topranker.io to associatedDomains and getDeepLinkParams means both our domains work for deep linking. The SHARE_DOMAINS array is now 4 entries: .com, www.com, .io, www.io."

**Marcus Chen (CTO):** "Deep links close the WhatsApp loop. Share → Tap → Open in app → Rate. This is the core growth mechanic for Phase 1 marketing."

---

## Changes

| File | Change |
|------|--------|
| `app/_layout.tsx` | Added Linking URL listener for universal links with cold-start handling, analytics, breadcrumbs |
| `app.json` | Added `applinks:topranker.io` to associatedDomains |
| `lib/sharing.ts` | Added topranker.io to SHARE_DOMAINS and getDeepLinkParams domain whitelist |
| `__tests__/sprint731-deep-link-handler.test.ts` | 20 tests: layout wiring (9), domains (2), URL parsing (5), share domains (3), loader (1) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,595 pass / 541 files |

---

## What's Next (Sprint 732)

App Store metadata preparation — screenshot dimensions, description strings, keyword optimization.
