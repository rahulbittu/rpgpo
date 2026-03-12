# SLT Backlog Meeting — Sprint 615

**Date:** 2026-03-11
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Status:** Sprint 611-614 review + Sprint 616-620 planning

## Sprint 611-614 Review

| Sprint | Feature | Status | Notes |
|--------|---------|--------|-------|
| 611 | MapBusinessCard rate CTA + analytics | Done | Rate button on map cards, analytics events for rate CTA + WhatsApp share |
| 612 | Photo verification badge | Done | Blue shield badge on verified photos in gallery + carousel |
| 613 | Business detail confidence | Done | VERIFIED RANKING badge for strong/established confidence |
| 614 | Search suggestions refresh | Done | DB-based build on startup + 30-min periodic refresh |

**Delivery rate:** 4/4 (100%) — 17th consecutive full-delivery cycle

## Core-Loop Scorecard (Sprints 606-614)

| Sprint | Type | Core-Loop Impact |
|--------|------|-----------------|
| 606 | Infrastructure | Indirect — headroom for future features |
| 607 | Documentation | None — pure docs |
| 608 | Core-Loop | Direct — share prompt drives organic distribution |
| 609 | Core-Loop | Direct — rate CTA reduces friction |
| 610 | Governance | None |
| 611 | Core-Loop | Direct — map rate CTA + analytics instrumentation |
| 612 | Core-Loop | Indirect — trust signal on photos |
| 613 | Core-Loop | Indirect — trust signal on rankings |
| 614 | Infrastructure | Indirect — fresh search suggestions |

**6/9 sprints directly or indirectly strengthen the core loop.** This is the best ratio in the project's history.

## Current Metrics

- **Tests:** 11,327 across 484 files
- **Server build:** 733.4kb / 750kb (97.8%)
- **Schema:** 896/960 LOC (64 lines headroom)
- **Tracked files:** 26, 0 violations
- **Build headroom:** 16.6kb (down from 20kb)

## Roadmap: Sprints 616-620

| Sprint | Feature | Owner | Points |
|--------|---------|-------|--------|
| 616 | Rating flow time-on-page indicator | James | 2 |
| 617 | Discover section: "Just Rated" feed | Priya | 3 |
| 618 | WhatsApp deep link landing page | Sarah | 3 |
| 619 | Server build size audit + pruning | Amir | 3 |
| 620 | Governance (SLT-620 + Audit #620 + Critique) | Sarah | 3 |

## Key Decisions

1. **Time-on-page indicator (Sprint 616):** Show users how long they've spent on the rating flow. Time plausibility (+5% boost) already exists but users don't see it. Visual indicator encourages spending enough time for the boost.

2. **"Just Rated" feed (Sprint 617):** New section on discover screen showing recently-rated businesses. Creates social proof and FOMO — "people are rating, I should too."

3. **WhatsApp landing page (Sprint 618):** When users tap a shared WhatsApp link, they land on a page optimized for conversion: see the business, see its rank, clear CTA to rate. Currently links go to the generic business page.

4. **Build size audit (Sprint 619):** At 733.4kb/750kb (97.8%), we need to investigate size reduction. Dead code elimination, tree-shaking audit, potential route code splitting for rarely-used admin routes.

5. **Max-3-infrastructure rule:** Sprint 616 (core-loop), 617 (core-loop), 618 (core-loop), 619 (infrastructure). 3:1 ratio — well within policy.

## Team Notes

**Marcus Chen:** "Build size is the new capacity concern at 97.8%. Sprint 619 must address this before we add more server features. The 750kb ceiling was set when we had 20kb headroom — now it's 16.6kb."

**Rachel Wei:** "Sprint 618's WhatsApp landing page closes the share-to-rate loop. This is the missing piece for organic growth. Share → land → rate → share. Each step should feel natural."

**Amir Patel:** "Build size audit in 619 is critical. I suspect there's dead code from deprecated features and unused admin modules. A focused pruning sprint could recover 10-20kb of headroom."

**Sarah Nakamura:** "The core-loop ratio is strong. 6 of the last 9 sprints directly improved the user experience. The team is in a great rhythm — infrastructure sprints are targeted, core-loop sprints are impactful."
