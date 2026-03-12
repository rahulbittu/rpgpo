# Retrospective: Sprint 126 — Credibility UX & Data Honesty

**Date:** 2026-03-08
**Duration:** 1 sprint
**Facilitator:** Sarah Nakamura

## What Went Well

**James Park:** "The influence label system was a surgical change — same backend math, completely different emotional impact. New users will now see 'Starter Influence' instead of 'x0.10'. That's the difference between feeling welcomed and feeling dismissed."

**Amir Patel:** "The rank confidence system is properly layered. Backend tracks totalRatings as always, the confidence function is pure logic with no side effects, and the UI adapts. No database changes needed."

**Rachel Wei:** "Fixing the '0% would return' on a 1-rating restaurant was overdue. That single stat could kill a business owner's trust in the platform before they even engage."

## What Could Improve

- The confidence system currently uses fixed thresholds (3, 10, 25). These should eventually be calibrated per category — a niche category might need fewer ratings to feel confident.
- The influence labels are English-only. When we internationalize, these need i18n support.
- We still show raw weight multipliers in the tier journey score ranges (10-99, 100-299, etc.). Users shouldn't need to see the internal point system.
- The profile page is still too long — too many sections fighting for attention. A future sprint should prioritize sections by user lifecycle stage.

## Action Items

| Action | Owner | Target Sprint |
|--------|-------|---------------|
| Calibrate confidence thresholds per category | Amir Patel | Sprint 130 |
| i18n support for influence labels | Mei Lin | Sprint 132 |
| Profile page section prioritization by user stage | James Park | Sprint 128 |
| Add "your last rating moved X" consequence text to profile impact card | James Park | Sprint 127 |

## Team Morale: 7/10

Honest assessment: this sprint was about admitting the product was technically correct but emotionally wrong. That's uncomfortable but necessary. The team recognized that trust UX is not just about the algorithm — it's about how the algorithm makes people feel. Morale is solid but grounded, not inflated.
