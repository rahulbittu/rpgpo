# Critique Request: Sprints 622-631

**Date:** 2026-03-11
**Scope:** CEO feedback response + Decision-to-Action layer

## Sprint Summary

| Sprint | Focus | Points |
|--------|-------|--------|
| 622 | Horizontal alignment + Discover white space | 2 |
| 623 | Best In links fix + Google Places fallback | 3 |
| 624 | Multi-photo strips (3→6) + Map current location | 3 |
| 625 | Profile name format "First L." + firstName/lastName | 3 |
| 626 | Schema + API for action fields (D2A Phase 1) | 3 |
| 627 | Business detail action CTAs (D2A Phase 2) | 3 |
| 628 | Card action quick-links (D2A Phase 3) | 3 |
| 629 | Seed real action URLs (D2A Phase 4) | 2 |
| 630 | Action CTA analytics attribution (D2A Phase 5) | 3 |
| 631 | Governance (SLT + Audit + Critique) | 2 |

## Questions for External Review

1. **Decision-to-Action layer architecture:** We built 5 phases (schema → detail UI → card UI → data → analytics) across 5 sprints. Is this progressive enhancement pattern sound, or should we have shipped all UI in one sprint?

2. **Action CTA placement on cards:** Compact 28px icon buttons (call, directions, order) on discover and ranked cards. Is this too subtle? Too cluttered? Should it be on long-press instead?

3. **Analytics funnel design:** impression → tap → conversion. We fire impression on mount via useEffect. Is this the right approach, or should we use intersection observer for true visibility tracking?

4. **Google Places fallback:** When a city+category has no TopRanker data, we show Google Places results with a "Rate" CTA. Does this dilute the brand or strengthen discovery?

5. **as-any cast trend:** Went from 114→122 in one sprint due to seed.ts action URLs. The SEED_BUSINESSES array isn't typed. Is this technical debt worth addressing or is seed-file typing low priority?

## Metrics

- Tests: 11,661 across 499 files
- Build: 629.9kb / 750kb (83.9%)
- Tracked files: 30, 0 violations
- CEO feedback items: 11/11 addressed
