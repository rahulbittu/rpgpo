# Retro 436: Search Relevance Improvements

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Clean pure-function design. All 5 new functions (`levenshtein`, `wordScore`, `categoryRelevance`, `ratingVolumeSignal`, `combinedRelevance`) are side-effect-free and independently testable. The route integration was a 1-line change from inline formula to `combinedRelevance(name, searchCtx)`."

**Marcus Chen:** "First core loop improvement in the 436-440 roadmap, delivered on target. 44 new tests covering every scoring tier. The multi-word tokenization alone will significantly improve results for queries like 'best biryani irving' that hit name + cuisine + neighborhood signals simultaneously."

**Amir Patel:** "Server build grew only 2.9kb for 5 new functions. The bounded Levenshtein prevents performance concerns. No new API endpoints, no schema changes, no client-side LOC growth."

## What Could Improve

- **No runtime scoring validation** — We test source structure but don't verify actual numeric outputs for specific query/name pairs. Should add unit tests with concrete inputs/outputs.
- **Fuzzy threshold (4 chars)** — Tokens under 4 characters skip fuzzy matching, which means 3-letter cuisine codes or short words get no typo tolerance. May want to revisit.
- **Category/cuisine matching is query-token-level** — A multi-word cuisine like "South Indian" won't match well because tokens are scored individually. May need phrase-level category matching.

## Action Items

- [ ] Begin Sprint 437 (Profile activity timeline) — **Owner: Sarah**
- [ ] Add concrete input/output unit tests for relevance functions in future sprint — **Owner: Amir**

## Team Morale
**8/10** — Strong core loop sprint. Clean architecture, good test coverage. Team excited about the roadmap balance.
