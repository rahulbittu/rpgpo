# SLT Backlog Meeting — Sprint 605

**Date:** 2026-03-11
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Status:** Sprint 601-604 review + Sprint 606-610 planning

## Sprint 601-604 Review

| Sprint | Feature | Status | Notes |
|--------|---------|--------|-------|
| 601 | Admin route consolidation | Done | 18 admin imports → single registerAllAdminRoutes entry point, routes.ts 386→353 LOC |
| 602 | Dish photo nudge | Done | Contextual "Got a photo of your [dish]?" after dish selection, +15% boost callout |
| 603 | HeroCard confidence indicator | Done | VERIFIED/PROVISIONAL pills on #1 ranked card, matching RankedCard pattern |
| 604 | Receipt verification UX | Done | Shield icon, proof list (visit/date/weight), "Verify with Receipt" framing |

**Delivery rate:** 4/4 (100%) — 15th consecutive full-delivery cycle

## Core-Loop Return Assessment

Sprints 602-604 were the first core-loop improvements since Sprint 590 (12-sprint gap). Impact:
- **Photo quality signal**: Dish photo nudge ties dish specificity to verification boost
- **Low-data honesty**: HeroCard now shows provisional status, completing confidence coverage across all ranking positions
- **Receipt adoption**: Redesigned UX communicates value of highest verification boost (+25%)

**These three sprints directly strengthen the rate → consequence → ranking loop.**

## Current Metrics

- **Tests:** 11,325 across 484 files
- **Server build:** 730.0kb / 750kb (97.3%)
- **Schema:** 896/960 LOC (64 lines headroom)
- **Tracked files:** 24, 0 violations
- **RatingExtrasStep:** 629/650 LOC (approaching ceiling — extraction candidate)

## Roadmap: Sprints 606-610

| Sprint | Feature | Owner | Points |
|--------|---------|-------|--------|
| 606 | Receipt section extraction from RatingExtrasStep | Sarah | 3 |
| 607 | In-memory stores documentation (audit carryover) | Amir | 2 |
| 608 | Rating confirmation screen — share prompt | James | 3 |
| 609 | Discover screen: "rate this" CTA on cards | Priya | 3 |
| 610 | Governance (SLT-610 + Audit #610 + Critique) | Sarah | 3 |

## Key Decisions

1. **Receipt extraction (Sprint 606):** RatingExtrasStep at 629/650 LOC. Extract receipt section into `components/rate/ReceiptUploadCard.tsx` before adding more features. Same pattern as Sprint 602's dish nudge — the extras step is doing too much.

2. **In-memory stores doc (Sprint 607):** Carried over from Audit #595 (3 audits ago). Must close this. Single markdown file documenting city cache, photo hash, pHash stores.

3. **Share prompt (Sprint 608):** After rating submission, prompt user to share their rating. "Best [dish] in [city]" format. WhatsApp-first per marketing strategy. This creates organic distribution.

4. **"Rate this" CTA (Sprint 609):** Discover screen cards currently show business info but no direct rating action. Adding a small "Rate" button on each card reduces friction — user can tap directly instead of navigating to business page first.

5. **Max 3 infrastructure sprints policy:** New rule from Retro 600. Sprints 606-607 are the infrastructure allocation. 608-609 must be core-loop.

## Team Notes

**Marcus Chen:** "Three core-loop sprints proved we can ship user-facing improvements at pace. The infrastructure streak was necessary but the team works best when shipping things users see. Keep this momentum."

**Rachel Wei:** "Sprint 608's share prompt is a revenue-adjacent feature — organic sharing drives user acquisition without ad spend. Highest-priority after the extraction."

**Amir Patel:** "RatingExtrasStep is the new capacity concern at 629/650. Sprint 606 extraction buys us headroom for the share prompt and any future extras step features."

**Sarah Nakamura:** "The confidence indicator work (Sprint 603) should extend to other surfaces — business detail page, discover cards. But let's not create a new multi-sprint project. One-sprint additions to each surface, scheduled organically."
