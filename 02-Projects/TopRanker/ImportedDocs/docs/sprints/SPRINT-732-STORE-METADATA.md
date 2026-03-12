# Sprint 732 — App Store Metadata Preparation

**Date:** 2026-03-11
**Theme:** Beta Readiness — Store Submission
**Story Points:** 2

---

## Mission Alignment

TestFlight submission requires App Store Connect metadata: name, subtitle, description, keywords, category, privacy policy, and screenshot specifications. This sprint centralizes all store listing content in a typed config file, validated by tests to ensure compliance with Apple's character limits.

---

## Team Discussion

**Jasmine Taylor (Marketing):** "The description leads with our core value prop: 'What's the BEST specific thing in your city?' Every line reinforces the anti-Yelp positioning: structured ratings, credibility-weighted, no paid placements."

**Marcus Chen (CTO):** "Keywords are strategic. We lead with 'restaurants' and 'rankings' for discoverability, but include 'biryani', 'indian', 'dallas', 'irving' for our Phase 1 market. 100-character limit means every word counts."

**Derek Liu (Mobile):** "Screenshot specs are locked: 6.7\" (1290x2796) and 5.5\" (1242x2208) are required. iPad is not required since supportsTablet is false. Six scenes cover the core loop: rank, detail, rate, discover, dish, profile."

**Sarah Nakamura (Lead Eng):** "The AASA config is included but needs to be deployed to topranker.com and topranker.io servers. Without it, universal links fall back to Safari. This is a Railway deployment task."

**Jordan Blake (Compliance):** "Privacy policy and support URLs point to topranker.io. These pages need to exist before App Store review. Content rating 4+ is correct — no user-generated media that could be objectionable."

---

## Changes

| File | Change |
|------|--------|
| `config/store-metadata.ts` | App Store metadata: name, subtitle, description, keywords, screenshots, AASA config |
| `__tests__/sprint732-store-metadata.test.ts` | 26 tests: required fields (10), keywords (3), description (4), screenshots (5), AASA (4) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,621 pass / 542 files |

---

## What's Next (Sprint 733)

Rate limiting + abuse prevention hardening for API endpoints.
