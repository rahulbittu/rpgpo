# SLT Backlog Meeting — Sprint 610

**Date:** 2026-03-11
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Status:** Sprint 606-609 review + Sprint 611-615 planning

## Sprint 606-609 Review

| Sprint | Feature | Status | Notes |
|--------|---------|--------|-------|
| 606 | Receipt section extraction | Done | RatingExtrasStep 629→501 LOC, ReceiptUploadCard extracted (153 LOC) |
| 607 | In-memory stores documentation | Done | 21 stores documented, closes 3-audit carryover |
| 608 | Share prompt on confirmation | Done | WhatsApp-first "Best [dish] in [city]" format, +getRatingShareText |
| 609 | Discover "Rate this" CTA | Done | Direct rate button on BusinessCard, reduces friction |

**Delivery rate:** 4/4 (100%) — 16th consecutive full-delivery cycle

## Core-Loop Impact Assessment

Sprints 608-609 directly strengthen the rate → consequence → ranking loop:
- **Sprint 608:** After rating, prompt to share → organic user acquisition → more ratings
- **Sprint 609:** Discover cards have rate CTA → lower friction → more ratings
- Both reduce steps between intent and action

## Current Metrics

- **Tests:** 11,327 across 484 files
- **Server build:** 730.0kb / 750kb (97.3%)
- **Schema:** 896/960 LOC (64 lines headroom)
- **Tracked files:** 26, 0 violations
- **RatingExtrasStep:** 501/550 LOC (91% — healthy headroom)
- **RatingConfirmation:** 449 LOC (no ceiling set)
- **sharing.ts:** 136/150 LOC

## Roadmap: Sprints 611-615

| Sprint | Feature | Owner | Points |
|--------|---------|-------|--------|
| 611 | MapBusinessCard rate CTA + analytics events | Priya | 2 |
| 612 | Photo verification confidence — visual indicator on photos | James | 3 |
| 613 | Business detail page confidence indicator | Sarah | 3 |
| 614 | Search suggestions refresh (stale suggestions cleanup) | Amir | 2 |
| 615 | Governance (SLT-615 + Audit #615 + Critique) | Sarah | 3 |

## Key Decisions

1. **MapBusinessCard rate CTA (Sprint 611):** Extend the discover rate CTA pattern to map view cards. Also add analytics events for rate_cta_discover_tap and share_whatsapp_tap.

2. **Photo verification visual (Sprint 612):** When a rating has verified photos, show a small verified badge on photo thumbnails across all surfaces. Builds on the verification system — makes the value of photo upload visually obvious.

3. **Business detail confidence (Sprint 613):** Per Sarah's note in SLT-605 — confidence indicators should extend to the business detail page hero. One-sprint addition, not a multi-sprint project.

4. **Search suggestions refresh (Sprint 614):** Search suggestions are pre-built on startup. Add a periodic refresh (every 30 min) to keep them current as new businesses and ratings come in.

5. **Core-loop ratio:** 3/5 sprints are core-loop (611, 612, 613). 1 infrastructure (614). 1 governance (615). Within the max-3-infrastructure rule.

## Team Notes

**Marcus Chen:** "The share prompt + rate CTA combo is exactly what we need for Phase 1. Every touchpoint in the app should either lead to a rating or lead to sharing. We're getting there."

**Rachel Wei:** "Sprint 608's share prompt is our first organic growth feature. I want to see WhatsApp share rates before we invest in paid acquisition. If the organic loop works, we defer paid spending."

**Amir Patel:** "RatingExtrasStep is in great shape at 501/550. The extraction sprint bought us exactly the headroom we needed. Next capacity concern will be RatingConfirmation at 449 LOC if we keep adding to the confirmation screen."

**Sarah Nakamura:** "The confidence indicator rollout should be systematic: HeroCard (done, Sprint 603), business detail (Sprint 613), then discover cards already have it. That covers all high-traffic surfaces."
