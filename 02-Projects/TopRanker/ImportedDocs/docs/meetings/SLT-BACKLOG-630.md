# SLT Backlog Prioritization — Sprint 630

**Date:** 2026-03-11
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)

## Agenda

1. Decision-to-Action Layer Review (Sprints 626-630)
2. CEO Feedback Items Status (Sprint 622-631)
3. Roadmap: Sprints 632-636
4. Technical Debt Assessment

## 1. Decision-to-Action Layer Review

**Marcus Chen:** "Five sprints to build a complete action layer: schema, business detail CTAs, card quick-links, seed data, analytics attribution. Zero regressions. This is the quality bar."

**Rachel Wei:** "The analytics funnel (impression → tap → conversion) gives us the data to pitch Business Pro. 'Your restaurant got X orders from TopRanker' is the value proposition."

**Amir Patel:** "Architecture is clean. Action fields on the schema, conditional rendering everywhere, impression tracking via useEffect. No over-engineering — the layer appears only when data exists."

**Sarah Nakamura:** "Build is stable at 629.9kb (84% of 750kb ceiling). 11,661 tests across 499 files. 30 tracked files, 0 violations."

## 2. CEO Feedback Items Status

| Item | Sprint | Status |
|------|--------|--------|
| Horizontal alignment off | 622 | COMPLETE |
| Best In links don't work | 623 | COMPLETE |
| Empty city shows nothing | 623 | COMPLETE |
| Cards need 3-6 photos | 624 | COMPLETE |
| Map needs current location | 624 | COMPLETE |
| Profile name "First L." | 625 | COMPLETE |
| Action CTAs (schema) | 626 | COMPLETE |
| Action CTAs (detail UI) | 627 | COMPLETE |
| Action CTAs (card UI) | 628 | COMPLETE |
| Seed action data | 629 | COMPLETE |
| Action analytics | 630 | COMPLETE |

**All 11 CEO feedback items addressed in 9 sprints.** Decision-to-Action layer is the flagship deliverable.

## 3. Roadmap: Sprints 632-636

| Sprint | Focus | Points |
|--------|-------|--------|
| 632 | Owner dashboard action URL editor | 3 |
| 633 | Search result relevance tuning (city + category weighting) | 3 |
| 634 | Rating flow UX polish (step transitions, progress indicator) | 2 |
| 635 | Governance (SLT-635 + Audit + Critique) | 2 |
| 636 | Share card visual redesign (og:image generation) | 3 |

## 4. Technical Debt Assessment

| Item | Priority | Notes |
|------|----------|-------|
| `(biz as any)` casts in seed.ts | LOW | 6 casts for action URLs, seed-only |
| api.ts at 97.9% ceiling (558/570) | MEDIUM | Extraction needed before next API additions |
| No server-side analytics aggregation | MEDIUM | All analytics are client-side console logs |
| Card impression tracking (intersection observer) | LOW | Only business detail tracks impressions |

**Decision:** api.ts extraction is the top P1 for Sprint 633-634 timeframe.

## Next SLT: Sprint 635
