# Sprint 208 — App Store Submission Prep + Launch Checklist

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Prepare for public launch. App store metadata, launch checklist, and performance budget real measurement complete the operational readiness picture. Sprint 210 SLT meeting will use these artifacts for the GO/NO-GO decision.

## Team Discussion

**Marcus Chen (CTO):** "The launch checklist is our single source of truth for launch readiness. Engineering, product, business, legal — every domain has checkboxes. If it's not checked, we don't launch."

**Jasmine Taylor (Marketing):** "App store description leads with the trust narrative: 'your opinion actually matters.' Keywords target the gap between Yelp frustration and our credibility-weighted approach. Six screenshots covering the core experience."

**Leo Hernandez (Frontend):** "iOS and Android metadata are aligned. Same description, same feature set, same screenshots. The adaptive icon for Android uses our navy/amber brand colors."

**Rachel Wei (CFO):** "The launch checklist revenue section confirms our targets: Challenger $99, Business Pro $49/mo, break-even at $247/mo. If Wave 3 gives us 2 paying features, we're profitable."

**Amir Patel (Architecture):** "getBudgetReport now accepts actual measurements. Pass in server perf stats and get a status report with ok/warning/exceeded per metric. Warning triggers at 80% of budget — gives us margin before exceeding."

**Nadia Kaur (Security):** "Pre-launch security audit is on the checklist. I'll run a full OWASP assessment before Sprint 210. No new attack surface since Sprint 206."

**Jordan Blake (Compliance):** "App store privacy policy URL points to topranker.com/privacy. Data safety form for Google Play needs the data retention specifics we documented in Sprint 203. Age rating: 4+ / Everyone."

## Deliverables

### App Store Metadata (`docs/APP-STORE-METADATA.md`)
- iOS App Store listing: name, subtitle, description, keywords, screenshots, privacy URL
- Google Play Store listing: short/full description, feature graphic specs
- Submission checklists for both platforms

### Launch Checklist (`docs/LAUNCH-CHECKLIST.md`)
- Engineering readiness: infrastructure, testing, security, monitoring
- Product readiness: core features, beta validation
- Business readiness: revenue, legal, marketing, app store
- Launch day plan: T-7 through T+1

### Performance Budget Enhancement (`lib/performance-budget.ts`)
- `getBudgetReport(actuals)` — accepts real measurements
- Warning at 80% threshold, exceeded above budget
- Returns metric, status, budget, actual, unit per entry

## Tests

- 30 new tests in `tests/sprint208-app-store-launch.test.ts`
- Full suite: **3,644+ tests across 138 files, all passing**
