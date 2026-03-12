# Retro 392: Search Result Relevance Scoring

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "The Sprint 347 infrastructure paid off. textRelevance and profileCompleteness were already tested and ready — we just wired them into the search endpoint. No new algorithm development needed."

**Priya Sharma:** "Clean integration. The SortChips component was designed for extensibility. Adding a new sort option was a type change + one conditional. The `showRelevant` prop keeps UX clean — the chip only appears when relevant."

**Marcus Chen:** "This closes a gap that's been open since Sprint 347. Our search now actually ranks by relevance, not just by score. For the 'Best biryani in Irving' use case, this is a meaningful improvement."

## What Could Improve

- **No A/B test yet** — We should compare relevance-sorted vs score-sorted results to measure user engagement. Future sprint.
- **Fuzzy matching not included** — "resturant" (typo) still won't match. Could add Levenshtein distance later.
- **Server bundle grew 1.4kb** — Minor, but worth noting the trend.

## Action Items

- [ ] A/B test relevance sorting vs score-only — **Owner: Marcus Chen (future sprint)**
- [ ] Consider fuzzy matching for common typos — **Owner: Amir Patel (future sprint)**

## Team Morale
**8/10** — Satisfying sprint that closed a known gap. The relevance scoring makes search feel smarter.
