# Sprint 396: Extract BusinessBottomSection from business/[id].tsx

**Date:** 2026-03-09
**Type:** Code Health (P1 Extraction)
**Story Points:** 5

## Mission

Extract the bottom section (rate button, claim card, report link, claim link) from `app/business/[id].tsx` into `components/business/BusinessBottomSection.tsx`. The file was at 92% of its 650 LOC threshold — flagged as WATCH in Audit #61.

## Team Discussion

**Marcus Chen (CTO):** "business/[id].tsx was our second-highest file by threshold percentage. After the ChallengeCard extraction in Sprint 391, this is the natural follow-up. We're systematically eliminating threshold risks."

**Sarah Nakamura (Lead Eng):** "The bottom section is a clean extraction boundary: rate button logic, claim card, report link, claim link. All self-contained with clear props: businessName, businessSlug, isClaimed, isLoggedIn, hasExistingRating, memberDaysActive."

**Amir Patel (Architecture):** "596 → 476 LOC (73% of threshold). That's a -120 line reduction. The file is now comfortable for the next several feature additions."

**Priya Sharma (Frontend):** "Two test cascades (sprint115, sprint159). Both redirected cleanly to BusinessBottomSection.tsx. Also cleaned up unused Alert import from the parent."

## Changes

### Modified Files
- `app/business/[id].tsx` — Removed rate button, claim card, report/claim links + 8 styles. 596 → 476 LOC (-120, 73% of threshold). Removed unused Alert import.
- `tests/sprint115-revenue-analytics.test.ts` — Redirected dashboardUpgradeTap assertion to BusinessBottomSection.tsx
- `tests/sprint159-rate-gating-ux.test.ts` — Redirected rate gating assertions to BusinessBottomSection.tsx

### New Files
- `components/business/BusinessBottomSection.tsx` — Extracted component (165 LOC) with rate button, claim card, links + styles
- `tests/sprint396-bottom-section-extract.test.ts` — 14 tests

## Test Results
- **300 files**, **7,217 tests**, all passing
- Server build: **601.1kb**, 31 tables
